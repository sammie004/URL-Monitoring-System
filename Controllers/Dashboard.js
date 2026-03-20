const db = require("../config/db");

// 1️⃣ GET DASHBOARD OVERVIEW
const getDashboard = (req, res) => {
  const user_id = req.user.id;

  // Get all URLs for user
  const urlQuery = `
    SELECT id, url, name, status, last_checked, last_response_time_ms
    FROM urls
    WHERE user_id = ?
  `;

  db.query(urlQuery, [user_id], (err, urls) => {
    if (err) {
      console.log("Dashboard URL fetch error:", err);
      return res.status(500).json({ message: "Error fetching dashboard data." });
    }

    // Summary stats
    const total = urls.length;
    const up = urls.filter(u => u.status === "up").length;
    const down = urls.filter(u => u.status === "down").length;

    return res.status(200).json({
      summary: { total, up, down },
      urls
    });
  });
};



// 2️⃣ GET RECENT LOGS FOR A URL
const getUrlLogs = (req, res) => {
  const { url_id } = req.params;
  const user_id = req.user.id;

  // Ensure user owns this URL
  const checkQuery = `SELECT id FROM urls WHERE id = ? AND user_id = ?`;

  db.query(checkQuery, [url_id, user_id], (err, result) => {
    if (err) {
      console.log("Ownership check error:", err);
      return res.status(500).json({ message: "Error checking URL ownership." });
    }

    if (result.length === 0) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Fetch logs
    const logsQuery = `
      SELECT status_code, response_time_ms, error_message, checked_at
      FROM url_logs
      WHERE url_id = ?
      ORDER BY checked_at DESC
      LIMIT 10
    `;

    db.query(logsQuery, [url_id], (err, logs) => {
      if (err) {
        console.log("Logs fetch error:", err);
        return res.status(500).json({ message: "Error fetching logs." });
      }

      return res.status(200).json({ logs });
    });
  });
};



// 3️⃣ GET MONTHLY ANALYTICS
const getMonthlyStats = (req, res) => {
  const user_id = req.user.id;

  const query = `
    SELECT 
      u.id as url_id,
      u.name,
      AVG(l.response_time_ms) as avg_response_time,
      COUNT(CASE WHEN l.status_code >= 400 OR l.status_code IS NULL THEN 1 END) as downtime_count
    FROM urls u
    LEFT JOIN url_logs l ON u.id = l.url_id
    WHERE u.user_id = ?
      AND MONTH(l.checked_at) = MONTH(NOW())
      AND YEAR(l.checked_at) = YEAR(NOW())
    GROUP BY u.id
  `;

  db.query(query, [user_id], (err, stats) => {
    if (err) {
      console.log("Monthly stats error:", err);
      return res.status(500).json({ message: "Error fetching analytics." });
    }

    return res.status(200).json({ stats });
  });
};

module.exports = {
  getDashboard,
  getUrlLogs,
  getMonthlyStats
};