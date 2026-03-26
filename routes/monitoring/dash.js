const express = require("express")
const router = express.Router()
const {
  getDashboard,
  getUrlLogs,
  getMonthlyStats,
  getUptime
} = require("../../Controllers/Dashboard")

// authentication middleware
const  authMiddleware  = require("../../middlewares/middleware")

// router
router.get("/overview", authMiddleware, getDashboard)
router.get("/logs/:url_id", authMiddleware, getUrlLogs)
router.get("/stats/monthly", authMiddleware, getMonthlyStats)
router.get("/uptime/:id", authMiddleware, getUptime)

// =========================


module.exports = router