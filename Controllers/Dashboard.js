const db = require("../config/db");
const { get } = require("../routes/monitoring/dash");

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

// URL Uptime Calculator
const getUptime = (req, res) => {
  const { id } = req.params;

  // Fetch 14 days of logs so we can compare last 7 days vs previous 7 days
  const query = `
    SELECT status_code, checked_at
    FROM url_logs
    WHERE url_id = ?
    AND checked_at >= NOW() - INTERVAL 14 DAY
    ORDER BY checked_at ASC
  `;

  db.query(query, [id], (err, logs) => {
    if (err) {
      console.error("Uptime fetch error:", err);
      return res.status(500).json({ message: "Error fetching logs" });
    }

    if (!logs.length) {
      return res.status(200).json({
        total_checks:      0,
        up_checks:         0,
        downtime_checks:   0,
        uptime_percentage: 100,
        trend:             null,
        change_percentage: 0,
        period:            "last 7 days",
      });
    }

    const now        = Date.now();
    const day7ago    = now - 7  * 24 * 60 * 60 * 1000;
    const day14ago   = now - 14 * 24 * 60 * 60 * 1000;

    // Split logs into two windows
    const recentLogs   = logs.filter(l => new Date(l.checked_at).getTime() >= day7ago);
    const previousLogs = logs.filter(l => {
      const t = new Date(l.checked_at).getTime();
      return t >= day14ago && t < day7ago;
    });

    // Calculate uptime % for a set of logs
    const calcUptime = (set) => {
      if (!set.length) return null;
      const up = set.filter(l => l.status_code >= 200 && l.status_code < 400).length;
      return +((up / set.length) * 100).toFixed(2);
    };

    const currentUptime  = calcUptime(recentLogs)  ?? 100;
    const previousUptime = calcUptime(previousLogs);

    // Change vs previous period
    let changePercentage = 0;
    let trend = null; // null = not enough data for comparison

    if (previousUptime !== null) {
      changePercentage = +(currentUptime - previousUptime).toFixed(2);
      if (changePercentage > 0)      trend = 'up';
      else if (changePercentage < 0) trend = 'down';
      else                           trend = 'neutral';
    }

    const upChecks = recentLogs.filter(l => l.status_code >= 200 && l.status_code < 400).length;

    return res.status(200).json({
      total_checks:      recentLogs.length,
      up_checks:         upChecks,
      downtime_checks:   recentLogs.length - upChecks,
      uptime_percentage: currentUptime,
      previous_uptime:   previousUptime,
      trend,             // 'up' | 'down' | 'neutral' | null
      change_percentage: changePercentage,
      period:            "last 7 days",
    });
  });
};
module.exports = {
  getDashboard,
  getUrlLogs,
  getMonthlyStats,
  getUptime
};