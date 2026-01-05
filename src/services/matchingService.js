const { Op } = require("sequelize");
const db = require("../models");
const { extractTextFromCv } = require("./cvParserService");

// Map experienceLevel string to a rough minimum years value
function requiredYearsForLevel(level) {
  if (!level) return 0;
  const v = String(level).toLowerCase();
  if (v.includes("senior") || v.includes("lead")) return 5;
  if (v.includes("mid")) return 2;
  if (v.includes("entry") || v.includes("junior")) return 0;
  return 0;
}

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((t) => t.trim())
    .filter(Boolean);
}

function computeSkillScore(jobRequirements, candidateSkillNames, cvTokens) {
  const req = Array.isArray(jobRequirements) ? jobRequirements : [];
  if (!req.length) return 0;

  const reqTokens = new Set(
    req
      .flatMap((r) => tokenize(typeof r === "string" ? r : r?.name || ""))
  );
  if (!reqTokens.size) return 0;

  const candidateTokens = new Set([
    ...candidateSkillNames.map((s) => s.toLowerCase()),
    ...cvTokens,
  ]);

  let matched = 0;
  reqTokens.forEach((tok) => {
    if (candidateTokens.has(tok)) matched += 1;
  });

  const coverage = matched / reqTokens.size;
  return clampScore(coverage * 100);
}

function computeExperienceScore(jobLevel, candidateYears) {
  const requiredYears = requiredYearsForLevel(jobLevel);
  const years = Math.max(0, candidateYears || 0);

  if (requiredYears <= 0) {
    // No explicit requirement, reward more experience but cap
    return clampScore(Math.min(years * 10, 90));
  }

  if (years <= 0) return 0;

  if (years < requiredYears) {
    // Under-qualified: score up to 60
    const ratio = years / requiredYears;
    return clampScore(20 + ratio * 40);
  }

  if (years === requiredYears) {
    return 75;
  }

  // Over-qualified: up to 100
  const extra = years - requiredYears;
  return clampScore(75 + Math.min(extra * 5, 25));
}

function computePsychScore(candidate) {
  // Prefer lastScore from Candidate, fallback to latest completed CandidateTest score
  if (typeof candidate.lastScore === "number") {
    return clampScore(candidate.lastScore);
  }

  const tests = candidate.candidateTests || [];
  const completed = tests.filter((t) => t.status === "completed" && typeof t.score === "number");
  if (!completed.length) return 0;
  const latest = completed.sort((a, b) => new Date(b.completedAt || b.updatedAt || 0) - new Date(a.completedAt || a.updatedAt || 0))[0];
  return clampScore(latest.score);
}

function computeFinalScore({ skillScore, expScore, psychScore }) {
  // Location and language are intentionally ignored per requirements.
  const wSkill = 0.5;
  const wExp = 0.25;
  const wPsych = 0.25;

  const raw = wSkill * skillScore + wExp * expScore + wPsych * psychScore;
  return clampScore(raw);
}

/**
 * Compute AI matches for a job on demand.
 *
 * Rules:
 * - Only candidates with a completed test (Candidate.testTaken = true AND at least one completed CandidateTest)
 *   are considered. Others are skipped completely.
 * - Location and language are ignored for now.
 * - CV text (if available) is used as an additional source of skills/keywords.
 */
async function getMatchesForJob(jobId, { limit = 50 } = {}) {
  const job = await db.Job.findByPk(jobId);
  if (!job) {
    const err = new Error("Job not found");
    err.status = 404;
    throw err;
  }

  // Fetch candidates that have taken at least one test (testTaken flag),
  // along with their skills, experiences and tests.
  const candidates = await db.Candidate.findAll({
    where: {
      testTaken: true,
    },
    include: [
      {
        model: db.CandidateSkill,
        as: "candidateSkills",
        include: [{ model: db.Skill, as: "skill" }],
      },
      {
        model: db.CandidateExperience,
        as: "experiences",
      },
      {
        model: db.CandidateTest,
        as: "candidateTests",
      },
      {
        model: db.User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  const results = [];

  for (const candidate of candidates) {
    // Ensure candidate has at least one completed test; otherwise skip completely
    const tests = candidate.candidateTests || [];
    const hasCompletedTest = tests.some((t) => t.status === "completed");
    if (!hasCompletedTest) continue;

    // Collect candidate skills
    const skillNames = (candidate.candidateSkills || [])
      .map((cs) => cs.skill && cs.skill.name)
      .filter(Boolean);

    // Derive candidate years of experience: prefer experienceYears, else derive from experiences count
    let years = candidate.experienceYears || 0;
    if (!years && Array.isArray(candidate.experiences) && candidate.experiences.length) {
      // Very rough heuristic: each experience counts as 1 year if dates are missing
      years = candidate.experiences.length;
    }

    // Try to extract tokens from CV text (if available); fail silently on error
    const cvText = await extractTextFromCv(candidate.cvUrl);
    const cvTokens = tokenize(cvText);

    const skillScore = computeSkillScore(job.requirements, skillNames, cvTokens);
    const expScore = computeExperienceScore(job.experienceLevel, years);
    const psychScore = computePsychScore(candidate);
    const finalScore = computeFinalScore({ skillScore, expScore, psychScore });

    // If everything is zero, skip to avoid noisy matches
    if (finalScore <= 0) continue;

    results.push({
      candidate,
      scores: {
        skillScore,
        expScore,
        psychScore,
        final: finalScore,
      },
    });
  }

  // Sort by final score desc
  results.sort((a, b) => b.scores.final - a.scores.final);

  const total = results.length;

  // Compute bucket counts for labels
  const topCount = results.filter((r) => (r.scores?.final ?? 0) >= 90).length;
  const goodCount = results.filter((r) => (r.scores?.final ?? 0) >= 80).length;

  const sliced = results.slice(0, limit);

  // Return both top matches and total count for preview/summary use
  return {
    matches: sliced,
    total,
    topCount,
    goodCount,
  };
}

module.exports = {
  getMatchesForJob,
};
