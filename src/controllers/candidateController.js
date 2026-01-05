const db = require("../models");
const { Op } = require("sequelize");
const isAdmin = (req) => req.user && req.user.role === "admin";
const canManage = async (req, candidateId) => {
  if (!req.user) return false;
  if (!Number.isFinite(candidateId)) return false;
  if (isAdmin(req)) return true;
  const c = await db.Candidate.findByPk(candidateId);
  return c && Number(c.userId) === Number(req.user.id);
};

// Helpers to resolve candidate id for alias routes
const resolveCandidateIdForMe = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return null;
  }
  const cand = await db.Candidate.findOne({ where: { userId } });
  if (!cand) {
    res
      .status(404)
      .json({ success: false, message: "Candidate profile not found" });
    return null;
  }
  return cand.id;
};

const resolveCandidateIdByUserParam = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    res
      .status(400)
      .json({ success: false, message: "Valid userId parameter is required" });
    return null;
  }
  const cand = await db.Candidate.findOne({ where: { userId } });
  if (!cand) {
    res
      .status(404)
      .json({ success: false, message: "Candidate profile not found" });
    return null;
  }
  return cand.id;
};

const resolveCandidateIdByUserBody = async (req, res) => {
  const userId = Number(req.body?.userId);
  if (!userId) {
    res
      .status(400)
      .json({ success: false, message: "Valid userId in body is required" });
    return null;
  }
  const cand = await db.Candidate.findOne({ where: { userId } });
  if (!cand) {
    res
      .status(404)
      .json({ success: false, message: "Candidate profile not found" });
    return null;
  }
  return cand.id;
};

// Return candidates with associated user details (safe attrs)
exports.listCandidatesWithUser = async (req, res, next) => {
  try {
    // include associated user details (exclude password)
    const items = await db.Candidate.findAll({
      include: [
        {
          model: db.User,
          as: "user",
          attributes: [
            "id",
            "name",
            "email",
            "role",
            "isActive",
            "createdAt",
            "updatedAt",
          ],
        },
        {
          model: db.CandidateExperience,
          as: "experiences",
          separate: true,
          order: [["startDate", "DESC"]],
        },
        {
          model: db.Skill,
          as: "skills",
          through: { attributes: ["proficiency", "years"] },
        },
      ],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// Return only candidate records (no user associations) with selected attributes
// Return only candidate records (no user associations) with selected attributes
exports.listCandidates = async (req, res, next) => {
  try {
    const items = await db.Candidate.findAll({
      attributes: [
        "id",
        "userId",
        "businessSector",
        "position",
        "experienceYears",
        "studyLevel",
        "locationCountry",
        "phoneNumber",
        "profileImageUrl",
        "cvUrl",
        "cvFileName",
        "cvSize",
        "testTaken",
        "testPassed",
        "lastTestAt",
        "lastScore",
      ],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// Backwards-compatible aliases (deprecated)
exports.getAll = exports.listCandidatesWithUser;
exports.getAllOnly = exports.listCandidates;

exports.getById = async (req, res, next) => {
  try {
    const item = await db.Candidate.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// Get candidate profile for the authenticated user, including the linked user
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const item = await db.Candidate.findOne({
      where: { userId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email", "role", "isActive"],
        },
        {
          model: db.CandidateExperience,
          as: "experiences",
          order: [["startDate", "DESC"]],
        },
        {
          model: db.Skill,
          as: "skills",
          through: { attributes: ["proficiency", "years"] },
        },
      ],
    });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Candidate profile not found" });

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// Get candidate profile by userId param, including the linked user
exports.getByUserId = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Valid userId parameter is required",
      });
    }

    const item = await db.Candidate.findOne({
      where: { userId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email", "role", "isActive"],
        },
        {
          model: db.CandidateExperience,
          as: "experiences",
          order: [["startDate", "DESC"]],
        },
        {
          model: db.Skill,
          as: "skills",
          through: { attributes: ["proficiency", "years"] },
        },
      ],
    });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Candidate profile not found" });

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
      return res.status(400).json({
        success: false,
        message: "userId is required (provide token or userId)",
      });
    }

    const { skills, experiences, ...rest } = req.body || {};

    const result = await db.sequelize.transaction(async (t) => {
      const created = await db.Candidate.create(
        { ...rest, userId },
        { transaction: t }
      );

      // Upsert skills if provided: [{ name, proficiency, years }]
      if (Array.isArray(skills) && skills.length) {
        for (const s of skills) {
          let skill = null;
          if (s.skillId) {
            skill = await db.Skill.findByPk(Number(s.skillId), {
              transaction: t,
            });
            if (!skill) {
              throw Object.assign(new Error("Invalid skillId"), {
                status: 400,
              });
            }
          } else {
            const name = String(s.name || "")
              .trim()
              .toLowerCase();
            if (!name) continue;
            const result = await db.Skill.findOrCreate({
              where: { name },
              defaults: { name },
              transaction: t,
            });
            skill = result[0];
          }
          await db.CandidateSkill.upsert(
            {
              candidateId: created.id,
              skillId: skill.id,
              proficiency: s.proficiency || null,
              years: s.years ?? null,
            },
            { transaction: t }
          );
        }
      }

      // Insert experiences if provided
      if (Array.isArray(experiences) && experiences.length) {
        for (const e of experiences) {
          await db.CandidateExperience.create(
            {
              candidateId: created.id,
              companyName: e.companyName,
              jobTitle: e.jobTitle,
              startDate: e.startDate,
              endDate: e.endDate ?? null,
              isCurrent: !!e.isCurrent,
              location: e.location ?? null,
              description: e.description ?? null,
              achievements: e.achievements ?? null,
              technologies: Array.isArray(e.technologies)
                ? e.technologies
                : null,
            },
            { transaction: t }
          );
        }
      }

      return created;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await db.Candidate.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    // Authorization: owner or admin
    if (!(await canManage(req, item.id))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const { skills, experiences, ...rest } = req.body || {};

    const updated = await db.sequelize.transaction(async (t) => {
      await item.update(rest, { transaction: t });

      if (Array.isArray(skills)) {
        // Replace skills set
        // First fetch or create all skills, then set through table rows
        const pairs = [];
        for (const s of skills) {
          let skill = null;
          if (s.skillId) {
            skill = await db.Skill.findByPk(Number(s.skillId), {
              transaction: t,
            });
            if (!skill) {
              throw Object.assign(new Error("Invalid skillId"), {
                status: 400,
              });
            }
          } else {
            const name = String(s.name || "")
              .trim()
              .toLowerCase();
            if (!name) continue;
            const result = await db.Skill.findOrCreate({
              where: { name },
              defaults: { name },
              transaction: t,
            });
            skill = result[0];
          }
          pairs.push({
            candidateId: item.id,
            skillId: skill.id,
            proficiency: s.proficiency || null,
            years: s.years ?? null,
          });
        }
        // Clear existing
        await db.CandidateSkill.destroy({
          where: { candidateId: item.id },
          transaction: t,
        });
        // Bulk insert
        if (pairs.length) {
          await db.CandidateSkill.bulkCreate(pairs, { transaction: t });
        }
      }

      if (Array.isArray(experiences)) {
        // Replace experiences set
        await db.CandidateExperience.destroy({
          where: { candidateId: item.id },
          transaction: t,
        });
        const toInsert = experiences
          .filter((e) => e && e.companyName && e.jobTitle && e.startDate)
          .map((e) => ({
            candidateId: item.id,
            companyName: e.companyName,
            jobTitle: e.jobTitle,
            startDate: e.startDate,
            endDate: e.endDate ?? null,
            isCurrent: !!e.isCurrent,
            location: e.location ?? null,
            description: e.description ?? null,
            achievements: e.achievements ?? null,
            technologies: Array.isArray(e.technologies) ? e.technologies : null,
          }));
        if (toInsert.length) {
          await db.CandidateExperience.bulkCreate(toInsert, { transaction: t });
        }
      }

      return item;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await db.Candidate.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!(await canManage(req, item.id))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await item.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

// ===== Candidate Skills endpoints =====
exports.getSkills = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    if (!Number.isFinite(candidateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid candidate id" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const cand = await db.Candidate.findByPk(candidateId, {
      include: [
        {
          model: db.Skill,
          as: "skills",
          through: { attributes: ["proficiency", "years"] },
          order: [["name", "ASC"]],
        },
      ],
    });
    if (!cand)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: cand.skills || [] });
  } catch (err) {
    next(err);
  }
};

exports.replaceSkills = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    if (!Number.isFinite(candidateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid candidate id" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const skills = Array.isArray(req.body?.skills) ? req.body.skills : [];
    await db.sequelize.transaction(async (t) => {
      await db.CandidateSkill.destroy({
        where: { candidateId },
        transaction: t,
      });
      const rows = [];
      for (const s of skills) {
        let skill = null;
        if (s.skillId) {
          skill = await db.Skill.findByPk(Number(s.skillId), {
            transaction: t,
          });
          if (!skill) {
            throw Object.assign(new Error("Invalid skillId"), { status: 400 });
          }
        } else {
          const name = String(s.name || "")
            .trim()
            .toLowerCase();
          if (!name) continue;
          const result = await db.Skill.findOrCreate({
            where: { name },
            defaults: { name },
            transaction: t,
          });
          skill = result[0];
        }
        rows.push({
          candidateId,
          skillId: skill.id,
          proficiency: s.proficiency || null,
          years: s.years ?? null,
        });
      }
      if (rows.length)
        await db.CandidateSkill.bulkCreate(rows, { transaction: t });
    });
    res.json({ success: true, message: "Skills updated" });
  } catch (err) {
    next(err);
  }
};

exports.addSkill = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    if (!Number.isFinite(candidateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid candidate id" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    let skill = null;
    if (req.body?.skillId) {
      skill = await db.Skill.findByPk(Number(req.body.skillId));
      if (!skill) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid skillId" });
      }
    } else {
      const name = String(req.body?.name || "")
        .trim()
        .toLowerCase();
      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "name is required" });
      }
      const result = await db.Skill.findOrCreate({
        where: { name },
        defaults: { name },
      });
      skill = result[0];
    }
    await db.CandidateSkill.upsert({
      candidateId,
      skillId: skill.id,
      proficiency: req.body?.proficiency || null,
      years: req.body?.years ?? null,
    });
    res
      .status(201)
      .json({ success: true, data: { id: skill.id, name: skill.name } });
  } catch (err) {
    next(err);
  }
};

exports.removeSkill = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    const skillId = Number(req.params.skillId);
    if (!Number.isFinite(candidateId) || !Number.isFinite(skillId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await db.CandidateSkill.destroy({ where: { candidateId, skillId } });
    res.json({ success: true, message: "Removed" });
  } catch (err) {
    next(err);
  }
};

// ===== Candidate Experiences endpoints =====
exports.listExperiences = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    if (!Number.isFinite(candidateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid candidate id" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const items = await db.CandidateExperience.findAll({
      where: { candidateId },
      order: [["startDate", "DESC"]],
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.addExperience = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    if (!Number.isFinite(candidateId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid candidate id" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const body = req.body || {};
    if (!body.companyName || !body.jobTitle || !body.startDate) {
      return res.status(400).json({
        success: false,
        message: "companyName, jobTitle and startDate are required",
      });
    }
    const created = await db.CandidateExperience.create({
      candidateId,
      companyName: body.companyName,
      jobTitle: body.jobTitle,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      isCurrent: !!body.isCurrent,
      location: body.location ?? null,
      description: body.description ?? null,
      achievements: body.achievements ?? null,
      technologies: Array.isArray(body.technologies) ? body.technologies : null,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

exports.updateExperience = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    const expId = Number(req.params.expId);
    if (!Number.isFinite(candidateId) || !Number.isFinite(expId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const item = await db.CandidateExperience.findByPk(expId);
    if (!item || Number(item.candidateId) !== candidateId) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const body = req.body || {};
    await item.update({
      companyName: body.companyName ?? item.companyName,
      jobTitle: body.jobTitle ?? item.jobTitle,
      startDate: body.startDate ?? item.startDate,
      endDate: body.endDate ?? item.endDate,
      isCurrent:
        typeof body.isCurrent === "boolean" ? body.isCurrent : item.isCurrent,
      location: body.location ?? item.location,
      description: body.description ?? item.description,
      achievements: body.achievements ?? item.achievements,
      technologies: Array.isArray(body.technologies)
        ? body.technologies
        : item.technologies,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.removeExperience = async (req, res, next) => {
  try {
    const candidateId = Number(req.params.id);
    const expId = Number(req.params.expId);
    const item = await db.CandidateExperience.findByPk(expId);
    if (!item || Number(item.candidateId) !== candidateId) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (!(await canManage(req, candidateId))) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await item.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

// ===== Candidate job applications for authenticated user =====
exports.listMyApplications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const candidate = await db.Candidate.findOne({ where: { userId } });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate profile not found' });

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    const applications = await db.JobApplication.findAll({
      where: { candidateId: candidate.id },
      include: [
        {
          model: db.Job,
          as: 'job',
          include: [
            { model: db.Company, as: 'company' },
          ],
        },
      ],
      order: [['appliedAt', 'DESC']],
      limit,
      offset,
    });

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

// ===== Candidate dashboard stats for authenticated user =====
// activeJobs: applications with status 'accepted' (hired)
// applications: total applications by this candidate
// messagesLast7Days: total messages in the last 7 days in conversations
//   where this user is a participant
exports.getMyDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const candidate = await db.Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate profile not found" });
    }

    const activeJobs = await db.JobApplication.count({
      where: { candidateId: candidate.id, status: "accepted" },
    });

    const applications = await db.JobApplication.count({
      where: { candidateId: candidate.id },
    });

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

// ===== Alias routes using /me (resolve by token) =====
exports.getMySkills = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.getSkills(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.replaceMySkills = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.replaceSkills(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.addMySkill = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.addSkill(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.removeMySkill = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.removeSkill(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.listMyExperiences = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.listExperiences(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.addMyExperience = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.addExperience(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.updateMyExperience = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.updateExperience(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.removeMyExperience = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdForMe(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.removeExperience(req, res, next);
  } catch (err) {
    next(err);
  }
};

// ===== Alias routes using /by-user/:userId =====
exports.getSkillsByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.getSkills(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.replaceSkillsByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.replaceSkills(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.addSkillByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.addSkill(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.removeSkillByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.removeSkill(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.listExperiencesByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.listExperiences(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.addExperienceByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.addExperience(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.updateExperienceByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.updateExperience(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.removeExperienceByUser = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserParam(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.removeExperience(req, res, next);
  } catch (err) {
    next(err);
  }
};

// ===== Alias: Skills by userId in body (no params) =====
exports.addSkillByUserBody = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserBody(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.addSkill(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.replaceSkillsByUserBody = async (req, res, next) => {
  try {
    const cid = await resolveCandidateIdByUserBody(req, res);
    if (!cid) return;
    req.params.id = String(cid);
    return exports.replaceSkills(req, res, next);
  } catch (err) {
    next(err);
  }
};
