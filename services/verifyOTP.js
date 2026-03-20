const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { generateWelcomeEmail } = require("../Templates/MailSending");
const { sendEmail } = require("../services/Email");

const verifyOTP = async (req, res) => {

    // ✅ prevent crash if req.body is undefined
  const { otp, signup_token } = req.body ;
  console.log(`${req.body}`)

    try {
        // ✅ Verify JWT
        const decoded = jwt.verify(signup_token, process.env.JWT_SECRET);

        // ✅ Ensure OTP exists
        if (!decoded.otp) {
            return res.status(400).json({
                message: "OTP not found in token."
            });
        }

        // ✅ Compare OTP safely
        if (decoded.otp.toString() !== otp.toString()) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // ✅ Check if user already exists (prevents duplicates)
        const checkQuery = "SELECT id FROM users WHERE email = ?";

        db.query(checkQuery, [decoded.email], (err, existingUser) => {
            if (err) {
                console.log("DB check error:", err);
                return res.status(500).json({
                    message: "Database error."
                });
            }

            if (existingUser.length > 0) {
                return res.status(409).json({
                    message: "User already exists."
                });
            }

            // ✅ Insert user
            const insert_query = `
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
            `;

            db.query(
                insert_query,
                [decoded.name, decoded.email, decoded.password],
                async (err, result) => {

                    if (err) {
                        console.log("Insert error:", err);
                        return res.status(500).json({
                            message: "Error creating user."
                        });
                    }

                    // ✅ Send email WITHOUT breaking request if it fails
                    try {
                        const welcomeHTML = generateWelcomeEmail(decoded.name);

                        await sendEmail(
                            decoded.email,
                            "Welcome to URL Monitoring System 🎉",
                            welcomeHTML
                        );

                        console.log("✅ Welcome email sent");
                    } catch (mailErr) {
                        console.log("❌ Email error:", mailErr.message);
                    }

                    return res.status(201).json({
                        message: "Account verified successfully. Welcome aboard!"
                    });
                }
            );
        });

    } catch (error) {
        console.log("OTP verification error:", error.message);

        return res.status(400).json({
            message: "Invalid or expired signup token."
        });
    }
};

module.exports = {
    verifyOTP
};