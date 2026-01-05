const express = require("express");
const router = express.Router();
const controller = require("../controllers/candidateController");
const { authenticate } = require("../middlewares/auth");

// Basic candidate list (no user object)
router.get("/", controller.listCandidates);

// create candidate
router.post("/", controller.create);
// Detailed candidate list including user object
router.get("/with-user", controller.listCandidatesWithUser);
// Authenticated user's candidate profile
router.get("/me", authenticate, controller.getMyProfile);
// Authenticated candidate dashboard stats
router.get("/me/dashboard-stats", authenticate, controller.getMyDashboardStats);
// Candidate profile by userId
router.get("/by-user/:userId", authenticate, controller.getByUserId);
router.get("/:id", controller.getById);

// Alias: operate on skills for the authenticated user (no candidate id needed)
router.get("/me/skills", authenticate, controller.getMySkills);
router.put("/me/skills", authenticate, controller.replaceMySkills);
router.post("/me/skills", authenticate, controller.addMySkill);
router.delete("/me/skills/:skillId", authenticate, controller.removeMySkill);
// Candidate applications for authenticated user
router.get("/me/applications", authenticate, controller.listMyApplications);

// Alias: operate on skills by user id
router.get("/by-user/:userId/skills", authenticate, controller.getSkillsByUser);
router.put(
  "/by-user/:userId/skills",
  authenticate,
  controller.replaceSkillsByUser
);
router.post("/by-user/:userId/skills", authenticate, controller.addSkillByUser);
router.delete(
  "/by-user/:userId/skills/:skillId",
  authenticate,
  controller.removeSkillByUser
);

// Alias: operate on skills by user id in body (no params)
router.post("/skills", authenticate, controller.addSkillByUserBody);
router.put("/skills", authenticate, controller.replaceSkillsByUserBody);

// Candidate skills (dynamic :id) - keep after aliases to avoid capturing 'me' or 'by-user'
router.get("/:id/skills", authenticate, controller.getSkills);
router.put("/:id/skills", authenticate, controller.replaceSkills);
router.post("/:id/skills", authenticate, controller.addSkill);
router.delete("/:id/skills/:skillId", authenticate, controller.removeSkill);

// Alias: experiences for the authenticated user
router.get("/me/experiences", authenticate, controller.listMyExperiences);
router.post("/me/experiences", authenticate, controller.addMyExperience);
router.put(
  "/me/experiences/:expId",
  authenticate,
  controller.updateMyExperience
);
router.delete(
  "/me/experiences/:expId",
  authenticate,
  controller.removeMyExperience
);

// Alias: experiences by user id
router.get(
  "/by-user/:userId/experiences",
  authenticate,
  controller.listExperiencesByUser
);
router.post(
  "/by-user/:userId/experiences",
  authenticate,
  controller.addExperienceByUser
);
router.put(
  "/by-user/:userId/experiences/:expId",
  authenticate,
  controller.updateExperienceByUser
);
router.delete(
  "/by-user/:userId/experiences/:expId",
  authenticate,
  controller.removeExperienceByUser
);

// Candidate experiences (:id) - after aliases
router.get("/:id/experiences", authenticate, controller.listExperiences);
router.post("/:id/experiences", authenticate, controller.addExperience);
router.put(
  "/:id/experiences/:expId",
  authenticate,
  controller.updateExperience
);
router.delete(
  "/:id/experiences/:expId",
  authenticate,
  controller.removeExperience
);
router.post("/", authenticate, controller.create);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.remove);

module.exports = router;
