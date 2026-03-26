const express = require("express")
const router  = express.Router()
const auth    = require("../../middlewares/middleware")
const {
  logTraffic,
  createWrappedLink,
  getTrafficData,
  serveSnippet,
} = require("../../Controllers/TrafficMonitor")

router.post("/:url_id",        logTraffic)
router.post("/wrap/:url_id",           auth, createWrappedLink)
router.get("/data/:url_id",    auth, getTrafficData)
router.get("/snippet/:url_id", serveSnippet)

module.exports = router