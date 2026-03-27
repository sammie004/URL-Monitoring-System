const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/middleware");
const {
  logTraffic,
  createWrappedLink,
  getTrafficData,
  serveSnippet,
} = require("../../Controllers/TrafficMonitor");

// ─── POST /api/traffice/wrap ───
// Auth required — create a wrapped link
router.post("/wrap", authMiddleware, (req, res) => {
  console.log("POST /wrap hit");
  createWrappedLink(req, res);
});

// ─── POST /api/traffice/:url_id ───
// Public traffic logging
router.post("/:url_id", (req, res) => {
  console.log("POST /:url_id hit:", req.params.url_id);
  logTraffic(req, res);
});

// ─── GET /api/traffice/data/:url_id ───
// Auth required — get traffic dashboard data
router.get("/data/:url_id", authMiddleware, (req, res) => {
  console.log("GET /data/:url_id hit:", req.params.url_id);
  getTrafficData(req, res);
});

// ─── GET /api/traffice/snippet/:url_id ───
// Public — serves the tracking JS snippet
router.get("/snippet/:url_id", (req, res) => {
  console.log("GET /snippet/:url_id hit:", req.params.url_id);
  serveSnippet(req, res);
});

module.exports = router;