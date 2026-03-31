const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10, // adjust as needed
  queueLimit: 0
});

// Use promise wrapper for async/await
const db = pool.promise();

db.getConnection()
  .then(conn => {
    console.log("✅ Connected to Aiven DB 🚀");
    conn.release(); // release immediately
  })
  .catch(err => {
    console.log("❌ DB connection error:", err);
  });

module.exports = db;