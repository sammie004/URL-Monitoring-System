const db = require("../config/db");

// =========================
// Helpers
// =========================
const isValidUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const checkUrlReachable = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const startTime = Date.now();

  try {
    console.log("⏳ Pinging URL:", url);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startTime;

    return {
      success: true,
      reachable: response.ok,
      statusCode: response.status,
      responseTimeMs,
      error: null,
      errorMessage: null,
    };
  } catch (error) {
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startTime;

    let errorType = "NETWORK_ERROR";

    if (error.name === "AbortError") {
      errorType = "TIMEOUT";
    } else if (error.message.includes("ENOTFOUND")) {
      errorType = "DNS_ERROR";
    } else if (error.message.toLowerCase().includes("certificate")) {
      errorType = "SSL_ERROR";
    } else if (error.message.toLowerCase().includes("fetch failed")) {
      errorType = "FETCH_FAILED";
    }

    return {
      success: false,
      reachable: false,
      statusCode: null,
      responseTimeMs,
      error: errorType,
      errorMessage: error.message,
    };
  }
};

// =========================
// Add URL
// =========================
const ADD = async (req, res) => {
  try {
    const { url, name } = req.body || {};
    const userId = req.user?.id;

    console.log("⏳ Starting URL addition process...");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Please provide a URL to monitor.",
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid HTTP or HTTPS URL.",
      });
    }

    const pingResult = await checkUrlReachable(url);
    console.log("📡 Ping result:", pingResult);

    if (!pingResult.success) {
      return res.status(400).json({
        success: false,
        message: "Could not reach the URL.",
        ping: pingResult,
      });
    }

    const checkQuery = `SELECT id FROM urls WHERE url = ? AND user_id = ?`;

    db.query(checkQuery, [url, userId], (checkErr, checkResults) => {
      if (checkErr) {
        console.log("❌ Error checking existing URL:", checkErr.message);
        return res.status(500).json({
          success: false,
          message: "Database error while checking existing URL.",
        });
      }

      if (checkResults.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This URL is already being monitored.",
          ping: pingResult,
        });
      }

      const insertQuery = `
        INSERT INTO urls (user_id, url, name, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;

      db.query(insertQuery, [userId, url, name || ""], (insertErr, insertResult) => {
        if (insertErr) {
          console.log("❌ Error inserting URL:", insertErr.message);
          return res.status(500).json({
            success: false,
            message: "Database error while adding URL.",
          });
        }

        return res.status(201).json({
          success: true,
          message: "URL added successfully.",
          data: {
            id: insertResult.insertId,
            user_id: userId,
            url,
            name: name || "",
          },
          ping: pingResult,
        });
      });
    });
  } catch (error) {
    console.log("❌ Unexpected error in ADD:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error.",
    });
  }
};

// =========================
// Get all URLs
// =========================
const GET = (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    const query = `
      SELECT id, user_id, url, name, created_at, updated_at
      FROM urls
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.log("❌ Error fetching URLs:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error while fetching URLs.",
        });
      }

      return res.status(200).json({
        success: true,
        count: results.length,
        urls: results,
      });
    });
  } catch (error) {
    console.log("❌ Unexpected error in GET:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error.",
    });
  }
};

// =========================
// Delete URL
// =========================
const Delete = (req, res) => {
  try {
    const userId = req.user?.id;
    const urlId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    if (!urlId) {
      return res.status(400).json({
        success: false,
        message: "URL id is required.",
      });
    }

    const deleteQuery = `DELETE FROM urls WHERE id = ? AND user_id = ?`;

    db.query(deleteQuery, [urlId, userId], (err, result) => {
      if (err) {
        console.log("❌ Error deleting URL:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error while deleting URL.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "URL not found or does not belong to this user.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "URL deleted successfully.",
      });
    });
  } catch (error) {
    console.log("❌ Unexpected error in Delete:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error.",
    });
  }
};

module.exports = {
  ADD,
  GET,
  Delete,
};