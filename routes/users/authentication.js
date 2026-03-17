const express = require("express")
const router = express.Router()
const { Onboard,Login } = require("../../Controllers/UserAuthentication")
const { verifyOTP } = require("../../services/verifyOTP")


// onboarding
router.post("/onboard", Onboard)
router.post("/verify-otp", verifyOTP)

// Login route
router.post("/login", Login)
module.exports = router