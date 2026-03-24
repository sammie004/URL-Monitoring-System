/**
 * URLMonitoringService.js
 * Production-ready URL monitoring with structured logging,
 * retry logic, timeouts, circuit breaking, and graceful shutdown.
 *
 * Email strategy:
 *   0 changes in a tick  → no email
 *   1 change             → individual down/recovery template
 *   2+ changes           → batched digest email per user
 */

console.log("✅ URLMonitoringService version: BATCHED_DIGEST_ALERTS");

"use strict";

const cron = require("node-cron");
const db   = require("../config/db");

const { sendEmail }             = require("../services/Email");
const { generateDownAlertEmail} = require("../Templates/DownAlertEmail");
const { generateRecoveryEmail } = require("../Templates/RecoveryEmail");
const { generateDigestEmail }   = require("../Templates/DigestEmail");

// ─── Logger ───────────────────────────────────────────────────────────────────

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

const logger = {
  _format(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      service: "URLMonitoringService",
      ...(Object.keys(meta).length > 0 && { meta }),
    });
  },
  debug(msg, meta) { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) console.debug(this._format("DEBUG", msg, meta)); },
  info(msg, meta)  { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO)  console.log(this._format("INFO",  msg, meta)); },
  warn(msg, meta)  { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN)  console.warn(this._format("WARN",  msg, meta)); },
  error(msg, meta) { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) console.error(this._format("ERROR", msg, meta)); },
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  FETCH_TIMEOUT_MS:    parseInt(process.env.MONITOR_TIMEOUT_MS)      || 10_000,
  MAX_RETRIES:         parseInt(process.env.MONITOR_MAX_RETRIES)      || 2,
  RETRY_DELAY_MS:      parseInt(process.env.MONITOR_RETRY_DELAY_MS)   || 1_500,
  CONCURRENCY_LIMIT:   parseInt(process.env.MONITOR_CONCURRENCY)      || 10,
  CRON_SCHEDULE:       process.env.MONITOR_CRON                       || "*/1 * * * *",
  CIRCUIT_BREAK_AFTER: parseInt(process.env.MONITOR_CIRCUIT_BREAK)    || 5,
  CIRCUIT_RESET_MS:    parseInt(process.env.MONITOR_CIRCUIT_RESET_MS) || 60_000,
};

// ─── Fetch (ESM-safe) ─────────────────────────────────────────────────────────

const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

// ─── DB Helper ────────────────────────────────────────────────────────────────

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

const circuitBreaker = new Map();

function getCircuit(urlId) {
  if (!circuitBreaker.has(urlId)) {
    circuitBreaker.set(urlId, { failures: 0, openedAt: null });
  }
  return circuitBreaker.get(urlId);
}

function isCircuitOpen(urlId) {
  const circuit = getCircuit(urlId);
  if (circuit.openedAt === null) return false;
  const elapsed = Date.now() - circuit.openedAt;
  if (elapsed >= CONFIG.CIRCUIT_RESET_MS) {
    circuit.openedAt = null;
    circuit.failures = 0;
    logger.info("Circuit half-open, allowing probe", { urlId });
    return false;
  }
  return true;
}

function recordCircuitSuccess(urlId) {
  const c = getCircuit(urlId);
  c.failures = 0;
  c.openedAt = null;
}

function recordCircuitFailure(urlId) {
  const c = getCircuit(urlId);
  c.failures += 1;
  if (c.failures >= CONFIG.CIRCUIT_BREAK_AFTER && c.openedAt === null) {
    c.openedAt = Date.now();
    logger.warn("Circuit opened — URL will be skipped until reset", {
      urlId, failures: c.failures, resetInMs: CONFIG.CIRCUIT_RESET_MS,
    });
  }
}

// ─── Core: Ping a URL ─────────────────────────────────────────────────────────

async function pingUrl(url) {
  const controller    = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);
  const start         = Date.now();

  try {
    const response    = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "PulseWatch-Monitor/1.0" },
      redirect: "follow",
    });
    const responseTime = Date.now() - start;
    clearTimeout(timeoutHandle);
    return {
      status:      response.ok ? "up" : "down",
      statusCode:  typeof response.status === "number" ? response.status : 0,
      responseTime,
      error:       null,
    };
  } catch (err) {
    clearTimeout(timeoutHandle);
    return {
      status:      "down",
      statusCode:  0,
      responseTime: Date.now() - start,
      error:       err.name === "AbortError"
                     ? `Timed out after ${CONFIG.FETCH_TIMEOUT_MS}ms`
                     : err.message,
    };
  }
}

// ─── Core: Ping with Retries ──────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pingWithRetry(url, urlId) {
  let lastResult;
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES + 1; attempt++) {
    lastResult = await pingUrl(url);
    logger.debug("Ping attempt complete", { url, urlId, attempt, ...lastResult });
    if (lastResult.status === "up") return lastResult;
    if (attempt <= CONFIG.MAX_RETRIES) {
      logger.info("Retrying after failure", { url, urlId, attempt, error: lastResult.error });
      await sleep(CONFIG.RETRY_DELAY_MS * attempt);
    }
  }
  return lastResult;
}

// ─── Get Previous Log ─────────────────────────────────────────────────────────

async function getPreviousLog(urlId) {
  try {
    const rows = await query(
      `SELECT status_code, checked_at FROM url_logs
       WHERE url_id = ? ORDER BY checked_at DESC LIMIT 1`,
      [urlId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    logger.error("Failed to fetch previous log", { urlId, error: err.message });
    return null;
  }
}

// ─── Core: Process One URL ────────────────────────────────────────────────────
// Returns a change object if something noteworthy happened, otherwise null.

async function processUrl({ id, url, user_id, user_name, user_email }) {
  if (isCircuitOpen(id)) {
    logger.warn("Skipping URL — circuit open", { urlId: id, url, owner_name: user_name, owner_email: user_email });
    return null;
  }

  const previousLog = await getPreviousLog(id);
  const result      = await pingWithRetry(url, id);

  if (result.status === "up") {
    recordCircuitSuccess(id);
    logger.info("URL is up", {
      urlId: id, url,
      statusCode:   result.statusCode,
      responseTime: `${result.responseTime}ms`,
      owner_name:   user_name,
      owner_email:  user_email,
    });
  } else {
    recordCircuitFailure(id);
    logger.warn("URL is down", {
      urlId: id, url,
      statusCode:  result.statusCode,
      error:       result.error,
      owner_name:  user_name,
      owner_email: user_email,
    });
  }

  // ── Determine if this is a noteworthy change BEFORE writing to DB ─────────
  const isFirstCheck  = previousLog === null;
  const statusChanged = !isFirstCheck && previousLog.status_code !== result.statusCode;

  logger.info("Change detection", {
    urlId: id, url,
    isFirstCheck,
    previousStatusCode: previousLog?.status_code ?? null,
    newStatusCode:      result.statusCode,
    statusChanged,
  });

  // ── Persist log ───────────────────────────────────────────────────────────
  try {
    await query(
      `INSERT INTO url_logs (url_id, status_code, response_time_ms, error_message, checked_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, result.statusCode, result.responseTime, result.error]
    );
  } catch (err) {
    logger.error("Failed to insert url_log", { urlId: id, url, error: err.message });
  }

  // ── Update urls table ─────────────────────────────────────────────────────
  try {
    await query(
      `UPDATE urls SET status = ?, last_checked = NOW(), last_response_time_ms = ? WHERE id = ?`,
      [result.status, result.responseTime, id]
    );
  } catch (err) {
    logger.error("Failed to update url status", { urlId: id, url, error: err.message });
  }

  if (!isFirstCheck && !statusChanged) {
    logger.debug("No change detected — skipping alert", { urlId: id, url, statusCode: result.statusCode });
    return null;
  }

  // Return a change record to be batched at the user level
  return {
    user_id,
    user_name,
    user_email,
    url,
    previousStatusCode: isFirstCheck ? null : previousLog.status_code,
    newStatusCode:      result.statusCode,
    newStatus:          result.status,
    reason:             isFirstCheck ? "first_check" : "status_code_change",
  };
}

// ─── Concurrency Limiter ──────────────────────────────────────────────────────

async function runWithConcurrency(items, limit, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      try {
        results.push(await fn(item));
      } catch (err) {
        logger.error("Unhandled error in processUrl", { error: err.message });
        results.push(null);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ─── Send Alerts Per User ─────────────────────────────────────────────────────
// Groups changes by user_id, then sends:
//   1 change  → individual down/recovery template
//   2+ changes → digest template

async function sendAlertsForTick(changes) {
  // Filter out nulls (no change)
  const actionable = changes.filter(Boolean);

  if (actionable.length === 0) {
    logger.info("No changes this tick — no emails to send");
    return;
  }

  // Group by user
  const byUser = new Map();
  for (const change of actionable) {
    if (!byUser.has(change.user_id)) {
      byUser.set(change.user_id, {
        user_name:  change.user_name,
        user_email: change.user_email,
        changes:    [],
      });
    }
    byUser.get(change.user_id).changes.push(change);
  }

  for (const [userId, { user_name, user_email, changes: userChanges }] of byUser) {
    try {
      if (userChanges.length === 1) {
        // ── Single change → individual template ──────────────────────────
        const c       = userChanges[0];
        const isDown  = c.newStatus === "down";
        const subject = isDown
          ? `🚨 PulseWatch — ${c.url} is DOWN`
          : `✅ PulseWatch — ${c.url} is back online`;
        const html = isDown
          ? generateDownAlertEmail(user_name, c.url)
          : generateRecoveryEmail(user_name, c.url);

        await sendEmail(user_email, subject, html);
        logger.info("Individual alert sent", {
          userId, to: user_email,
          url: c.url, reason: c.reason,
          previousStatusCode: c.previousStatusCode,
          newStatusCode:      c.newStatusCode,
          newStatus:          c.newStatus,
        });

      } else {
        // ── Multiple changes → digest ─────────────────────────────────────
        const downCount = userChanges.filter(c => c.newStatus === "down").length;
        const subject   = downCount > 0
          ? `🚨 PulseWatch — ${downCount} service${downCount > 1 ? "s" : ""} down across your URLs`
          : `✅ PulseWatch — ${userChanges.length} updates across your monitored URLs`;

        const html = generateDigestEmail(user_name, userChanges);

        await sendEmail(user_email, subject, html);
        logger.info("Digest alert sent", {
          userId, to: user_email,
          totalChanges: userChanges.length,
          down:         downCount,
          recovered:    userChanges.length - downCount,
        });
      }
    } catch (err) {
      logger.error("Failed to send alert for user", { userId, to: user_email, error: err.message });
    }
  }
}

// ─── Main Monitor Job ─────────────────────────────────────────────────────────

let isRunning = false;

const monitorUrls = async () => {
  if (isRunning) {
    logger.warn("Previous monitor run still in progress — skipping this tick");
    return;
  }

  isRunning = true;
  const jobStart = Date.now();
  logger.info("Monitor job started", { schedule: CONFIG.CRON_SCHEDULE });

  let urls;
  try {
    urls = await query(`
      SELECT
        u.id,
        u.url,
        u.user_id,
        usr.name  AS user_name,
        usr.email AS user_email
      FROM urls u
      INNER JOIN users usr ON usr.id = u.user_id
    `);
  } catch (err) {
    logger.error("Failed to fetch URLs from DB", { error: err.message });
    isRunning = false;
    return;
  }

  if (!urls.length) {
    logger.info("No active URLs to monitor");
    isRunning = false;
    return;
  }

  logger.info("Starting URL checks", { count: urls.length, concurrency: CONFIG.CONCURRENCY_LIMIT });

  urls.forEach(({ id, url, user_name, user_email }) => {
    logger.info("Queued for check", { urlId: id, url, owner_name: user_name, owner_email: user_email });
  });

  // Check all URLs, collect change records
  const changes = await runWithConcurrency(urls, CONFIG.CONCURRENCY_LIMIT, processUrl);

  // Send emails grouped by user
  await sendAlertsForTick(changes);

  const duration = Date.now() - jobStart;
  logger.info("Monitor job complete", { duration: `${duration}ms`, checked: urls.length });

  isRunning = false;
};

// ─── Scheduler ────────────────────────────────────────────────────────────────

let cronJob = null;

function start() {
  if (cronJob) { logger.warn("Monitor already started"); return; }

  if (!cron.validate(CONFIG.CRON_SCHEDULE)) {
    logger.error("Invalid cron schedule — monitor will not start", { schedule: CONFIG.CRON_SCHEDULE });
    return;
  }

  cronJob = cron.schedule(CONFIG.CRON_SCHEDULE, monitorUrls);
  logger.info("URL monitor scheduled", { schedule: CONFIG.CRON_SCHEDULE });
}

function stop() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info("URL monitor stopped");
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

process.on("SIGTERM", () => { logger.info("SIGTERM received — shutting down monitor"); stop(); });
process.on("SIGINT",  () => { logger.info("SIGINT received — shutting down monitor");  stop(); });

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception in monitor", { error: err.message, stack: err.stack });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection in monitor", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { start, stop, monitorUrls };