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
  const user_id = req.user.id;

  // Pull filter params from query string
  const limit = parseInt(req.query.limit) || 100;
  const fromDate = req.query.from || null;
  const toDate = req.query.to || null;

  const checkQuery = `SELECT id, name, url FROM urls WHERE id = ? AND user_id = ?`;
  db.query(checkQuery, [url_id, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error checking URL ownership." });
    if (result.length === 0) return res.status(403).json({ message: "Unauthorized access." });

    const urlInfo = result[0];

    const statsQuery = `
      SELECT 
        COUNT(*) AS totalChecks,
        SUM(status_code BETWEEN 200 AND 399) AS upChecks,
        SUM(status_code NOT BETWEEN 200 AND 399) AS downChecks,
        AVG(response_time_ms) AS avgResponse,
        MIN(checked_at) AS firstCheck
      FROM url_logs
      WHERE url_id = ?
    `;

    let logsQuery = `
      SELECT status_code, response_time_ms, error_message, checked_at
      FROM url_logs
      WHERE url_id = ?
    `;
    const logsParams = [url_id];

    if (fromDate) {
      logsQuery += ` AND checked_at >= ?`;
      logsParams.push(`${fromDate} 00:00:00`);
    }

    if (toDate) {
      logsQuery += ` AND checked_at <= ?`;
      logsParams.push(`${toDate} 23:59:59`);
    }

    logsQuery += ` ORDER BY checked_at DESC LIMIT ?`;
    logsParams.push(limit);

    db.query(statsQuery, [url_id], (err, statsResult) => {
      if (err) return res.status(500).json({ message: "Error fetching stats." });

      const stats = statsResult[0];
      const uptime = stats.totalChecks > 0
        ? ((stats.upChecks / stats.totalChecks) * 100).toFixed(2)
        : 0;

      db.query(logsQuery, logsParams, (err, logs) => {
        if (err) return res.status(500).json({ message: "Error fetching logs." });

        // ── Smart Insights Logic ──
        let insight = null;
        if (logs.length > 0 && stats.firstCheck) {
          const firstLogTime = new Date(stats.firstCheck).getTime();
          const now = Date.now();
          const hoursPassed = (now - firstLogTime) / (1000 * 60 * 60);

          // Stall insights for the first 24 hours
          if (hoursPassed >= 24 && logs.length >= 3 && stats.avgResponse) {
            // Compare last response vs avg
            const lastResponse = logs[0].response_time_ms;
            if (lastResponse < stats.avgResponse) {
              insight = {
                type: 'good',
                message: `Response time improved to ${lastResponse}ms (avg ${Math.round(stats.avgResponse)}ms)`
              };
            } else if (lastResponse > stats.avgResponse) {
              insight = {
                type: 'warning',
                message: `Response time slowed to ${lastResponse}ms (avg ${Math.round(stats.avgResponse)}ms)`
              };
            } else {
              insight = {
                type: 'neutral',
                message: `Response time stable at ${lastResponse}ms`
              };
            }
          }
        }

        return res.status(200).json({
          url: { id: urlInfo.id, name: urlInfo.name, url: urlInfo.url },
          stats: {
            totalChecks: stats.totalChecks,
            upChecks: stats.upChecks,
            downChecks: stats.downChecks,
            uptime,
            avgResponse: Math.round(stats.avgResponse || 0),
          },
          insight,
          logs,
        });
      });
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
// Monitor Traffic Analytics
const logTraffic = async (req, res) => {
  const { url_id, timestamp, referrer, user_agent } = req.body;

  if (!url_id) {
    return res.status(400).json({ message: "url_id is required" });
  }

  const query = `
    INSERT INTO traffic_logs (url_id, timestamp, referrer, user_agent)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [url_id, timestamp || new Date(), referrer || null, user_agent || null], (err) => {
    if (err) {
      console.error("Traffic log insert error:", err);
      return res.status(500).json({ message: "Failed to log traffic" });
    }

    res.status(200).json({ message: "Traffic logged successfully" });
  });
}
module.exports = {
  getDashboard,
  getUrlLogs,
  getMonthlyStats,
};