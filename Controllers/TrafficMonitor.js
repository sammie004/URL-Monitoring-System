"use strict";

const db     = require("../config/db");
const crypto = require("crypto");

// ─── Helper ───────────────────────────────────────────────────────────────────
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// Hash IP + UA + date — privacy-safe unique visitor detection, no raw IPs stored
const visitorHash = (ip, ua, date) =>
  crypto.createHash("sha256").update(`${ip}|${ua}|${date}`).digest("hex");

// ─── POST /api/traffic/:url_id ────────────────────────────────────────────────
const logTraffic = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);

  const { url_id } = req.params; // ✅ KEEP IT SIMPLE
  console.log("PARAMS:", req.params);
  const referrer   = req.body?.referrer || req.headers.referer || null;
  const userAgent  = req.body?.user_agent || req.headers["user-agent"] || null;

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (!url_id) return res.status(400).json({ message: "url_id is required" });

  try {
    const rows = await query("SELECT id FROM urls WHERE id = ?", [url_id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "URL not found" });

    const today = new Date().toISOString().slice(0, 10);
    const hash  = visitorHash(ip, userAgent || "", today);

    await query(
      `INSERT INTO traffic_logs (url_id, timestamp, referrer, user_agent, visitor_hash)
       VALUES (?, NOW(), ?, ?, ?)`,
      [url_id, referrer, userAgent, hash]
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Traffic log error:", err.message);
    return res.status(500).json({ message: "Failed to log traffic" });
  }
};

// ─── GET /go/:short_code ──────────────────────────────────────────────────────
// Link wrapping redirect — logs the visit then immediately redirects
const handleRedirect = async (req, res) => {
  const { short_code } = req.params;

  try {
    const rows = await query(
      `SELECT wl.url_id, u.url
       FROM wrapped_links wl
       INNER JOIN urls u ON u.id = wl.url_id
       WHERE wl.short_code = ?`,
      [short_code]
    );

    if (rows.length === 0) return res.status(404).send("Link not found");

    const { url_id, url } = rows[0];
    const referrer  = req.headers.referer          || null;
    const userAgent = req.headers["user-agent"]    || null;
    const ip        = req.headers["x-forwarded-for"]?.split(",")[0].trim()
                      || req.socket.remoteAddress  || "unknown";
    const today     = new Date().toISOString().slice(0, 10);
    const hash      = visitorHash(ip, userAgent || "", today);

    // Fire and forget — don't block the redirect
    query(
      `INSERT INTO traffic_logs (url_id, timestamp, referrer, user_agent, visitor_hash, source)
       VALUES (?, NOW(), ?, ?, ?, 'wrapped_link')`,
      [url_id, referrer, userAgent, hash]
    ).catch(err => console.error("Wrapped link log error:", err.message));

    return res.redirect(302, url);
  } catch (err) {
    console.error("Redirect error:", err.message);
    return res.status(500).send("Something went wrong");
  }
};

// ─── POST /api/traffic/wrap ───────────────────────────────────────────────────
// Creates or returns a wrapped link for a URL
const createWrappedLink = async (req, res) => {
  const user_id    = req.user.id;
  const { url_id } = req.body;

  if (!url_id) return res.status(400).json({ message: "url_id is required" });

  try {
    const rows = await query(
      "SELECT id, url FROM urls WHERE id = ? AND user_id = ?",
      [url_id, user_id]
    );
    if (rows.length === 0) return res.status(403).json({ message: "Unauthorized" });

    // Return existing wrapped link if already created
    const existing = await query(
      "SELECT short_code FROM wrapped_links WHERE url_id = ?",
      [url_id]
    );
    if (existing.length > 0) {
      return res.status(200).json({
        short_code:  existing[0].short_code,
        wrapped_url: `${process.env.BASE_URL}/go/${existing[0].short_code}`,
      });
    }

    const short_code = crypto.randomBytes(4).toString("hex");
    await query(
      "INSERT INTO wrapped_links (url_id, short_code, created_at) VALUES (?, ?, NOW())",
      [url_id, short_code]
    );

    return res.status(201).json({
      short_code,
      wrapped_url: `${process.env.BASE_URL}/go/${short_code}`,
    });
  } catch (err) {
    console.error("Create wrapped link error:", err.message);
    return res.status(500).json({ message: "Failed to create wrapped link" });
  }
};

// ─── GET /api/dashboard/traffic/:url_id ──────────────────────────────────────
// Returns aggregated traffic data — daily visits, peak hours, summary
const getTrafficData = async (req, res) => {
  const user_id    = req.user.id;
  const { url_id } = req.params;
  const fromDate   = req.query.from || null;
  const toDate     = req.query.to   || null;

  try {
    const ownership = await query(
      "SELECT id FROM urls WHERE id = ? AND user_id = ?",
      [url_id, user_id]
    );
    if (ownership.length === 0) return res.status(403).json({ message: "Unauthorized" });

    let dateFilter = "";
    const p = [url_id];
    if (fromDate) { dateFilter += " AND timestamp >= ?"; p.push(`${fromDate} 00:00:00`); }
    if (toDate)   { dateFilter += " AND timestamp <= ?"; p.push(`${toDate} 23:59:59`); }

    const [dailyVisits, peakHours, summary, sources] = await Promise.all([
      // Daily visits — total + unique per day
      query(
        `SELECT
           DATE(timestamp)              AS date,
           COUNT(*)                     AS total,
           COUNT(DISTINCT visitor_hash) AS unique_visitors
         FROM traffic_logs
         WHERE url_id = ? ${dateFilter}
         GROUP BY DATE(timestamp)
         ORDER BY date ASC`,
        p
      ),
      // Peak hours 0-23
      query(
        `SELECT
           HOUR(timestamp) AS hour,
           COUNT(*)        AS visits
         FROM traffic_logs
         WHERE url_id = ? ${dateFilter}
         GROUP BY HOUR(timestamp)
         ORDER BY hour ASC`,
        p
      ),
      // Overall summary
      query(
        `SELECT
           COUNT(*)                     AS totalVisits,
           COUNT(DISTINCT visitor_hash) AS uniqueVisitors,
           COUNT(DISTINCT DATE(timestamp)) AS activeDays
         FROM traffic_logs
         WHERE url_id = ? ${dateFilter}`,
        p
      ),
      // Source breakdown: script embed vs wrapped link
      query(
        `SELECT
           COALESCE(source, 'script') AS source,
           COUNT(*) AS visits
         FROM traffic_logs
         WHERE url_id = ? ${dateFilter}
         GROUP BY source`,
        p
      ),
    ]);

    return res.status(200).json({
      dailyVisits,
      peakHours: buildFullDayArray(peakHours),
      summary:   summary[0],
      sources,
    });
  } catch (err) {
    console.error("Traffic data error:", err.message);
    return res.status(500).json({ message: "Failed to fetch traffic data" });
  }
};

// Always return 24 hourly buckets even if some have 0 visits
const buildFullDayArray = (rows) => {
  const map = Object.fromEntries(rows.map(r => [r.hour, r.visits]));
  return Array.from({ length: 24 }, (_, h) => ({
    hour:   h,
    label:  `${String(h).padStart(2, "0")}:00`,
    visits: map[h] || 0,
  }));
};

// ─── GET /api/snippet/:url_id ─────────────────────────────────────────────────
// Serves the tracker JS — used as a <script src> tag
const serveSnippet = async (req, res) => {
  const { url_id } = req.params;

  try {
    const rows = await query("SELECT id FROM urls WHERE id = ?", [url_id]);
    if (rows.length === 0) return res.status(404).send("// URL not found");

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const js = `(function(){try{fetch("${baseUrl}/api/traffic/${url_id}",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referrer:document.referrer||null,user_agent:navigator.userAgent}),keepalive:true}).catch(function(){})}catch(e){}})();`;

    res.setHeader("Content-Type",  "application/javascript");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(js);
  } catch (err) {
    return res.status(500).send("// Error");
  }
};

module.exports = {
  logTraffic,
  handleRedirect,
  createWrappedLink,
  getTrafficData,
  serveSnippet,
};