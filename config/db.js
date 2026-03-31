const mysql = require("mysql2")
const dotenv = require("dotenv")
dotenv.config()

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // ✅ VERY IMPORTANT
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false // ✅ REQUIRED for Aiven
  }
})

db.connect((err) => {
  if (err) {
    console.log("❌ DB connection error:", err)
  } else {
    console.log("✅ Connected to Aiven DB 🚀")
  }
})

module.exports = db