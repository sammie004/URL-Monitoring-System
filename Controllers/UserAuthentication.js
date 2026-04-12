const db = require('../config/db')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const { generateOTP } = require("../services/CreateOTP")

const { generateOtpEmail } = require("../Templates/MailSending")
const { sendEmail } = require('../services/Email')

dotenv.config()


// ========================
// ONBOARD (with logs)
// ========================
const Onboard = async (req, res) => {
    console.time("ONBOARD_TOTAL")

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        console.timeEnd("ONBOARD_TOTAL")
        return res.status(400).json({ message: "Please provide name, email, and password." })
    }

    const check_query = `select * from users where email = ?`

    console.time("ONBOARD_DB_CHECK")

    db.query(check_query, [email], async (err, results) => {
        console.timeEnd("ONBOARD_DB_CHECK")

        if (err) {
            console.log("DB error:", err)
            console.timeEnd("ONBOARD_TOTAL")
            return res.status(500).json({ message: "Oops! Something went wrong." })
        }

        if (results.length > 0) {
            console.timeEnd("ONBOARD_TOTAL")
            return res.status(400).json({ message: "A user with this email already exists." })
        }

        console.time("OTP_AND_HASH")

        const otp = generateOTP()
        const hashed_password = bcrypt.hashSync(password, 10)

        console.timeEnd("OTP_AND_HASH")

        console.time("EMAIL_SEND")
        await sendEmail(email, 'Your verification code', generateOtpEmail(name, otp))
        console.timeEnd("EMAIL_SEND")

        const signup_token = jwt.sign(
            { name, email, password: hashed_password, otp },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        )

        console.timeEnd("ONBOARD_TOTAL")

        return res.status(200).json({
            message: "User registered successfully. Please check your email for the OTP.",
            signup_token
        })
    })
}


// ========================
// LOGIN (IMPORTANT ONE)
// ========================
const Login = (req, res) => {
    console.time("LOGIN_TOTAL")

    const { email, password } = req.body

    if (!email || !password) {
        console.timeEnd("LOGIN_TOTAL")
        return res.status(400).json({ message: "Please provide email and password." })
    }

    const check_query = `select * from users where email = ?`

    console.time("LOGIN_DB")

    db.query(check_query, [email], (err, results) => {
        console.timeEnd("LOGIN_DB")

        if (err) {
            console.log("DB error:", err)
            console.timeEnd("LOGIN_TOTAL")
            return res.status(500).json({ message: "Oops! Something went wrong." })
        }

        if (results.length === 0) {
            console.timeEnd("LOGIN_TOTAL")
            return res.status(400).json({ message: "Invalid email or password." })
        }

        const user = results[0]

        console.time("BCRYPT_COMPARE")

        const isMatch = bcrypt.compareSync(password, user.password)

        console.timeEnd("BCRYPT_COMPARE")

        if (!isMatch) {
            console.timeEnd("LOGIN_TOTAL")
            return res.status(400).json({ message: "Invalid email or password." })
        }

        console.time("JWT_SIGN")

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        console.timeEnd("JWT_SIGN")

        console.timeEnd("LOGIN_TOTAL")

        return res.status(200).json({
            message: "Login successful.",
            token,
            user_id: user.id,
            name: user.name
        })
    })
}

module.exports = {
    Onboard,
    Login
}