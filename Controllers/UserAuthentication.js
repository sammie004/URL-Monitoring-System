const db = require('../config/db')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const { generateOTP } = require("../services/CreateOTP")

const {generateOtpEmail} = require("../Templates/MailSending")
const { sendEmail } = require('../services/Email')
const { sign } = require('crypto')
dotenv.config()


// actual controller functions
const Onboard = async (req, res) => {
    const { name, email, password } = req.body
    if(!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password." })
    }
    const check_query = `select * from users where email = ?`
    db.query(check_query,[email],async (err,results)=>{
        if (err) {
            console.log(`an error occured while checking for existing user`, err)
            res.status(500).json({ message: "Oops! Something went wrong." })
        }
        if (results.length > 0) {
            console.log(`A user with this email already exists`)
            res.status(400).json({ message: "A user with this email already exists." })

        } else {
            const otp = generateOTP()
            console.log(`Generated OTP for ${email}: ${otp}`)
            const hashed_password = bcrypt.hashSync(password, 10)
             await sendEmail(email,'Your verification code', generateOtpEmail(name, otp))
            const signup_token = jwt.sign({ name, email, password:hashed_password, otp}, process.env.JWT_SECRET, { expiresIn: '10m' })
            
            return res.status(200).json({ message: "User registered successfully. Please check your email for the OTP.", signup_token})
        }
    })
}

const Login = (req, res) => {
    const { email, password } = req.body
    if(!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." })
    }
    const check_query = `select * from users where email = ?`
    db.query(check_query,[email],async (err,results)=>{
        if (err) {
            console.log(`an error occured while checking for existing user`, err)
            res.status(500).json({ message: "Oops! Something went wrong." })
        }
        if (results.length === 0) {
            console.log(`No user found with this email`)
            res.status(400).json({ message: "Invalid email or password." })
        } else {
            const user = results[0]
            const isMatch = bcrypt.compareSync(password, user.password)
            if (!isMatch) {
                console.log(`Invalid password for user: ${user.email}`)
                res.status(400).json({ message: "Invalid email or password." })
            } else {
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
                res.status(200).json({ message: "Login successful.", token , user_id:user.id, name:user.name})
            }
        }
    })

}

module.exports = {
    Onboard,
    Login
}