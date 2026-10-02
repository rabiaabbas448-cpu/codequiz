const express = require("express");
const router = express.Router();
const { getAdminStats, getPublicStats } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/public-stats", getPublicStats);

module.exports = router;