const express = require("express")
const router = express.Router()

const { ADD, GET, Delete } = require("../../Controllers/URLManagement")
// authentication middleware
const  authMiddleware  = require("../../middlewares/middleware")

// Apply authentication middleware to all routes in this router
router.post("/add", authMiddleware, ADD)
router.get("/get", authMiddleware, GET)
router.delete("/delete/:id", authMiddleware, Delete)

module.exports = router