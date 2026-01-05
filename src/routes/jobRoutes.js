const express = require("express");
const router = express.Router();
const controller = require("../controllers/jobController");
const { authenticate, authorizeRoles } = require("../middlewares/auth");

router.get("/", controller.getAll);
// jobs for authenticated user's company (define before :id to avoid routing conflicts)
router.get("/my", authenticate, controller.getByCompanyForUser);
// AI matches for a specific job (company owner or admin)
router.get("/:id(\\d+)/matches", authenticate, authorizeRoles("company", "admin"), controller.getMatches);
router.get("/:id(\\d+)", controller.getById);
// Only users with role 'company' can create a job
router.post("/", authenticate, authorizeRoles("company"), controller.create);
router.put("/:id(\\d+)", authenticate, controller.update);
// Update job status (company owner or admin)
router.put('/:id(\\d+)/status', authenticate, authorizeRoles('company','admin'), controller.updateJobStatus);
router.delete("/:id(\\d+)", authenticate, controller.remove);

// Candidate applies to a job
router.post(
  "/:id(\\d+)/apply",
  authenticate,
  authorizeRoles("candidate"),
  controller.apply
);

// Update application status (company owner or admin)
router.put('/applications/:id(\\d+)/status', authenticate, authorizeRoles('company','admin'), controller.updateApplicationStatus);

module.exports = router;
