const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { generateWelcomeEmail } = require("../Templates/MailSending");
const { sendEmail } = require("../services/Email");

const verifyOTP = async (req, res) => {
  const { otp, signup_token } = req.body;

  // ✅ Input validation
  if (!otp || !signup_token) {
    return res.status(400).json({
      success: false,
      message: "OTP and signup token are required.",
    });
  }

  let decoded;

  try {
    // ✅ Verify token
    decoded = jwt.verify(signup_token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT Error:", err.message);

    return res.status(400).json({
      success: false,
      message: "Invalid or expired signup token.",
    });
  }

  try {
    // ✅ Ensure OTP exists in token
    if (!decoded.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found in token.",
      });
    }

    // ✅ Compare OTP safely
    if (decoded.otp.toString() !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // ✅ Check if user already exists
    const checkUserQuery = "SELECT id FROM users WHERE email = ?";

    db.query(checkUserQuery, [decoded.email], async (err, existingUser) => {
      if (err) {
        console.error("DB check error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error.",
        });
      }

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "User already exists.",
        });
      }

      // ✅ Insert user
      const insertQuery = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `;

      db.query(
        insertQuery,
        [decoded.name, decoded.email, decoded.password],
        async (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({
              success: false,
              message: "Error creating user.",
            });
          }

          // ✅ Send welcome email (non-blocking but safe)
          try {
            const welcomeHTML = generateWelcomeEmail(decoded.name);

            await sendEmail(
              decoded.email,
              "Welcome to URL Monitoring System 🎉",
              welcomeHTML
            );

            console.log("✅ Welcome email sent");
          } catch (mailErr) {
            console.error("❌ Email failed:", mailErr.message);
            // Don't fail request because of email
          }

          return res.status(201).json({
            success: true,
            message: "Account verified successfully. Welcome aboard!",
          });
        }
      );
    });
  } catch (error) {
    console.error("Verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during verification.",
    });
  }
};

module.exports = { verifyOTP };