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



const getUrlLogs = (req, res) => {
  const { url_id } = req.params;
  const user_id    = req.user.id;

  // Pull filter params from query string
  const limit    = parseInt(req.query.limit)    || 100
  const fromDate = req.query.from || null  // e.g. "2026-03-01"
  const toDate   = req.query.to   || null  // e.g. "2026-03-24"

  const checkQuery = `SELECT id, name, url FROM urls WHERE id = ? AND user_id = ?`
  db.query(checkQuery, [url_id, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error checking URL ownership." })
    if (result.length === 0) return res.status(403).json({ message: "Unauthorized access." })

    const urlInfo = result[0]

    const statsQuery = `
      SELECT 
        COUNT(*) AS totalChecks,
        SUM(status_code BETWEEN 200 AND 399) AS upChecks,
        SUM(status_code NOT BETWEEN 200 AND 399) AS downChecks,
        AVG(response_time_ms) AS avgResponse
      FROM url_logs
      WHERE url_id = ?
    `

    // Build logs query dynamically based on filters
    let logsQuery  = `
      SELECT status_code, response_time_ms, error_message, checked_at
      FROM url_logs
      WHERE url_id = ?
    `
    const logsParams = [url_id]

    if (fromDate) {
      logsQuery += ` AND checked_at >= ?`
      logsParams.push(`${fromDate} 00:00:00`)
    }

    if (toDate) {
      logsQuery += ` AND checked_at <= ?`
      logsParams.push(`${toDate} 23:59:59`)
    }

    logsQuery += ` ORDER BY checked_at DESC LIMIT ?`
    logsParams.push(limit)

    db.query(statsQuery, [url_id], (err, statsResult) => {
      if (err) return res.status(500).json({ message: "Error fetching stats." })

      const stats  = statsResult[0]
      const uptime = stats.totalChecks > 0
        ? ((stats.upChecks / stats.totalChecks) * 100).toFixed(2)
        : 0

      db.query(logsQuery, logsParams, (err, logs) => {
        if (err) return res.status(500).json({ message: "Error fetching logs." })

        return res.status(200).json({
          url: { id: urlInfo.id, name: urlInfo.name, url: urlInfo.url },
          stats: {
            totalChecks:  stats.totalChecks,
            upChecks:     stats.upChecks,
            downChecks:   stats.downChecks,
            uptime,
            avgResponse:  Math.round(stats.avgResponse || 0),
          },
          logs,
        })
      })
    })
  })
}

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