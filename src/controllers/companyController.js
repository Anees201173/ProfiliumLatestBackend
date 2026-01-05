const db = require("../models");
const { Op } = require("sequelize");

exports.getAll = async (req, res, next) => {
  try {
    // include jobs so we can expose both how many posts each company has
    // and the overall job data (title, status, etc.)
    const rows = await db.Company.findAll({
      include: [
        {
          model: db.Job,
          as: "jobs",
        },
      ],
    });

    // shape response: keep company fields, full jobs array, and a jobsCount shortcut
    const items = rows.map((row) => {
      const json = row.toJSON();
      const jobs = Array.isArray(json.jobs) ? json.jobs : [];
      return {
        ...json,
        jobs,
        jobsCount: jobs.length,
      };
    });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    // include this company's posted jobs in the detailed view
    const item = await db.Company.findByPk(req.params.id, {
      include: [
        {
          model: db.Job,
          as: "jobs",
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
    // prefer authenticated user's id from token; fall back to body.userId
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required (provide token or userId)" });
    }

    const payload = { ...req.body, userId };

    // Normalize email and website values so validation behaves as expected
    if (typeof payload.email === "string") {
      const trimmed = payload.email.trim();
      payload.email = trimmed || null;
    }

    if (typeof payload.websiteUrl === "string") {
      let website = payload.websiteUrl.trim();
      if (!website) {
        payload.websiteUrl = null;
      } else {
        // If user omitted protocol, assume https so it passes URL validation
        if (!/^https?:\/\//i.test(website)) {
          website = `https://${website}`;
        }
        payload.websiteUrl = website;
      }
    }
    const created = await db.Company.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await db.Company.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    await item.update(req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// Get the authenticated company's profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const company = await db.Company.findOne({ where: { userId } });
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found" });
    }

    return res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

// Update the authenticated company's profile
exports.updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const company = await db.Company.findOne({ where: { userId } });
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found" });
    }

    const updates = { ...(req.body || {}) };

    // Normalize email field: treat empty string as null
    if (typeof updates.email === "string") {
      const trimmed = updates.email.trim();
      updates.email = trimmed || null;
    }

    // Normalize websiteUrl: empty -> null, missing protocol -> https://
    if (typeof updates.websiteUrl === "string") {
      let website = updates.websiteUrl.trim();
      if (!website) {
        updates.websiteUrl = null;
      } else {
        if (!/^https?:\/\//i.test(website)) {
          website = `https://${website}`;
        }
        updates.websiteUrl = website;
      }
    }

    await company.update(updates);
    return res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await db.Company.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    await item.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

// Authenticated company dashboard stats
exports.getMyDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const company = await db.Company.findOne({ where: { userId } });
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found" });
    }

    // Active jobs = open jobs owned by this company
    const activeJobs = await db.Job.count({
      where: {
        companyId: company.id,
        status: "open",
      },
    });

    // Total applications across all company jobs
    const jobIds = await db.Job.findAll({
      where: { companyId: company.id },
      attributes: ["id"],
      raw: true,
    }).then((rows) => rows.map((r) => r.id));

    let applications = 0;
    if (jobIds.length > 0) {
      applications = await db.JobApplication.count({
        where: { jobId: { [Op.in]: jobIds } },
      });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Conversations where this user is a participant
    const conversations = await db.Conversation.findAll({
      include: [
        {
          model: db.User,
          as: "participants",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    const myConversationIds = conversations
      .filter((c) => c.participants.some((p) => p.id === userId))
      .map((c) => c.id);

    let messagesLast7Days = 0;
    if (myConversationIds.length > 0) {
      messagesLast7Days = await db.Message.count({
        where: {
          conversationId: { [Op.in]: myConversationIds },
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
      });
    }

    return res.json({
      success: true,
      data: {
        activeJobs,
        applications,
        messagesLast7Days,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Authenticated company quick analytics (hire rate, views, days to hire, cost per hire)
exports.getMyQuickAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const company = await db.Company.findOne({ where: { userId } });
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found" });
    }

    const { startDate, endDate } = req.query || {};
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    if (Number.isNaN(start?.getTime?.())) start = null;
    if (Number.isNaN(end?.getTime?.())) end = null;

    const jobRows = await db.Job.findAll({
      where: { companyId: company.id },
      attributes: ["id", "createdAt"],
      raw: true,
    });
    const jobIds = jobRows.map((r) => r.id);

    let whereApps = {};
    if (jobIds.length > 0) {
      whereApps.jobId = { [Op.in]: jobIds };
    } else {
      whereApps.jobId = -1;
    }
    if (start || end) {
      whereApps.appliedAt = {};
      if (start) whereApps.appliedAt[Op.gte] = start;
      if (end) whereApps.appliedAt[Op.lte] = end;
    }

    const applications = await db.JobApplication.findAll({
      where: whereApps,
      attributes: ["id", "status", "appliedAt", "updatedAt"],
      raw: true,
    });

    const totalApplications = applications.length;
    const hires = applications.filter((a) => a.status === "accepted");
    const hiresCount = hires.length;
    const hireRate = totalApplications > 0 ? Math.round((hiresCount / totalApplications) * 100) : 0;

    let avgDaysToHire = 0;
    if (hiresCount > 0) {
      const totalDays = hires.reduce((sum, a) => {
        const applied = new Date(a.appliedAt);
        const updated = new Date(a.updatedAt || a.appliedAt);
        const diffMs = updated.getTime() - applied.getTime();
        const days = diffMs / (1000 * 60 * 60 * 24);
        return sum + (Number.isFinite(days) ? days : 0);
      }, 0);
      avgDaysToHire = Math.round(totalDays / hiresCount) || 0;
    }

    // We do not track real views or cost yet, so expose approximations/placeholders
    const views = totalApplications; // treat each application as a "view"
    const costPerHire = 0; // no billing data yet

    return res.json({
      success: true,
      data: {
        hireRate,
        views,
        avgDaysToHire,
        costPerHire,
        totalApplications,
        hires: hiresCount,
      },
    });
  } catch (err) {
    next(err);
  }
};
