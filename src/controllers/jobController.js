const db = require("../models");
const { getMatchesForJob } = require("../services/matchingService");

exports.getAll = async (req, res, next) => {
  try {
    const items = await db.Job.findAll({
      include: [{ model: db.Company, as: "company" }],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await db.Job.findByPk(req.params.id, {
      include: [
        { model: db.Company, as: "company" },
        {
          model: db.JobApplication,
          as: "applications",
          include: [
            {
              model: db.Candidate,
              as: "candidate",
              include: [
                {
                  model: db.User,
                  as: "user",
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    // Only company users can create jobs
    if (!req.user || req.user.role !== "company") {
      return res
        .status(403)
        .json({ success: false, message: "Only company users can post jobs" });
    }

    // Resolve company of the authenticated user
    const userId = req.user.id;
    const company = await db.Company.findOne({ where: { userId } });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found for user",
      });
    }

    // If body contains companyId, ensure it matches the authenticated user's company
    if (
      req.body.companyId &&
      Number(req.body.companyId) !== Number(company.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only post jobs for your own company",
      });
    }

    const payload = { ...req.body, companyId: company.id };
    const created = await db.Job.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

// Candidate applies to a job
exports.apply = async (req, res, next) => {
  try {
    // Only candidate users can apply
    if (!req.user || req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidate users can apply for jobs",
      });
    }

    const jobId = Number(req.params.id);
    const coverLetter = req.body?.coverLetter || null;

    // ensure job exists and is open
    const job = await db.Job.findByPk(jobId);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    if (job.status && job.status !== "open") {
      return res
        .status(400)
        .json({ success: false, message: "Job is not open for applications" });
    }

    // resolve candidate profile for current user
    const candidate = await db.Candidate.findOne({
      where: { userId: req.user.id },
    });
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate profile not found" });
    }

    // prevent duplicate applications
    const existing = await db.JobApplication.findOne({
      where: { jobId, candidateId: candidate.id },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    const application = await db.JobApplication.create({
      jobId,
      candidateId: candidate.id,
      coverLetter,
    });

    // increment applicants count atomically
    try {
      await db.Job.increment("applicantsCount", {
        by: 1,
        where: { id: jobId },
      });
    } catch (e) {
      /* ignore counter failure */
    }

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await db.Job.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    await item.update(req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await db.Job.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    await item.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

// Get jobs for the company owned by the authenticated user
exports.getByCompanyForUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const company = await db.Company.findOne({ where: { userId } });
    if (!company)
      return res.status(404).json({
        success: false,
        message: "Company profile not found for user",
      });

    const jobs = await db.Job.findAll({
      where: { companyId: company.id },
      include: [
        {
          model: db.JobApplication,
          as: "applications",
          include: [
            {
              model: db.Candidate,
              as: "candidate",
              include: [
                {
                  model: db.User,
                  as: "user",
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Add applicationsCount derived from applications array for convenience
    const enriched = jobs.map((j) => {
      const job = j.toJSON();
      job.applicationsCount = Array.isArray(job.applications)
        ? job.applications.length
        : 0;
      return job;
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

// Update only application status (company that owns the job or admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const appId = Number(req.params.id);
    const newStatus = req.body?.status;
    if (!appId || !newStatus) {
      return res.status(400).json({ success: false, message: 'Application id and status are required' });
    }

    const application = await db.JobApplication.findByPk(appId, {
      include: [{ model: db.Job, as: 'job' }],
    });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Only company that owns the job or admin can update status
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    if (req.user.role !== 'admin') {
      const company = await db.Company.findOne({ where: { id: application.job.companyId } });
      if (!company || Number(company.userId) !== Number(userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    await application.update({ status: newStatus });

    // Return updated application with job and candidate
    const updated = await db.JobApplication.findByPk(appId, {
      include: [
        { model: db.Job, as: 'job', include: [{ model: db.Company, as: 'company' }] },
        { model: db.Candidate, as: 'candidate', include: [{ model: db.User, as: 'user', attributes: ['id','name','email'] }] }
      ],
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Update job status (only company that owns the job or admin)
exports.updateJobStatus = async (req, res, next) => {
  try {
    const jobId = Number(req.params.id);
    const newStatus = req.body?.status;
    if (!jobId || !newStatus) {
      return res.status(400).json({ success: false, message: 'Job id and status are required' });
    }

    // Validate allowed statuses
    const allowed = ['draft', 'open', 'paused', 'closed'];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const job = await db.Job.findByPk(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    // Only admin or the company owner can change job status
    if (req.user.role !== 'admin') {
      const company = await db.Company.findOne({ where: { id: job.companyId } });
      if (!company || Number(company.userId) !== Number(userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    await job.update({ status: newStatus });
    // return updated job with company
    const updated = await db.Job.findByPk(jobId, { include: [{ model: db.Company, as: 'company' }] });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Get AI matches for a given job (on-demand computation)
exports.getMatches = async (req, res, next) => {
  try {
    const jobId = Number(req.params.id);
    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job id is required" });
    }

    // Only company that owns the job or admin can view AI matches
    const job = await db.Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
      const company = await db.Company.findOne({ where: { id: job.companyId } });
      if (!company || Number(company.userId) !== Number(userId)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const limit = Number(req.query.limit) || 50;
    const result = await getMatchesForJob(jobId, { limit });

    // result: { matches: [...], total, topCount, goodCount }
    const data = {
      matches: result.matches.map((m) => ({ candidate: m.candidate, scores: m.scores })),
      total: result.total,
      topCount: result.topCount,
      goodCount: result.goodCount,
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
