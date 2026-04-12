const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 5,   // smaller is better for Aiven free tier
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  ssl: {
    rejectUnauthorized: false
  }
});

const db = pool.promise();
db.query("SELECT 1")
  .then(() => console.log("✅ Aiven MySQL pool ready"))
  .catch(err => console.error("❌ DB connection error:", err));

module.exports = db;