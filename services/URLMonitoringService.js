/**
 * URLMonitoringService.js
 * Production-ready URL monitoring with structured logging,
 * retry logic, timeouts, circuit breaking, and graceful shutdown.
 */

"use strict";

const cron = require("node-cron");
const db = require("../config/db");

// ─── Logger ──────────────────────────────────────────────────────────────────

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

const logger = {
  _format(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: "URLMonitoringService",
      ...(Object.keys(meta).length > 0 && { meta }),
    };
    return JSON.stringify(entry);
  },

  debug(message, meta)  { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) console.debug(this._format("DEBUG", message, meta)); },
  info(message, meta)   { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO)  console.log(this._format("INFO",  message, meta)); },
  warn(message, meta)   { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN)  console.warn(this._format("WARN",  message, meta)); },
  error(message, meta)  { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) console.error(this._format("ERROR", message, meta)); },
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  FETCH_TIMEOUT_MS:     parseInt(process.env.MONITOR_TIMEOUT_MS)     || 10_000,
  MAX_RETRIES:          parseInt(process.env.MONITOR_MAX_RETRIES)     || 2,
  RETRY_DELAY_MS:       parseInt(process.env.MONITOR_RETRY_DELAY_MS)  || 1_500,
  CONCURRENCY_LIMIT:    parseInt(process.env.MONITOR_CONCURRENCY)     || 10,
  CRON_SCHEDULE:        process.env.MONITOR_CRON                      || "*/5 * * * *",
  CIRCUIT_BREAK_AFTER:  parseInt(process.env.MONITOR_CIRCUIT_BREAK)   || 5,   // consecutive failures before skipping
  CIRCUIT_RESET_MS:     parseInt(process.env.MONITOR_CIRCUIT_RESET_MS)|| 60_000,
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
// Prevents hammering URLs that are persistently down.

const circuitBreaker = new Map();
// Map<urlId, { failures: number, openedAt: number | null }>

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
    // Half-open: allow one probe through
    circuit.openedAt = null;
    circuit.failures = 0;
    logger.info("Circuit half-open, allowing probe", { urlId });
    return false;
  }
  return true;
}

function recordCircuitSuccess(urlId) {
  const circuit = getCircuit(urlId);
  circuit.failures = 0;
  circuit.openedAt = null;
}

function recordCircuitFailure(urlId) {
  const circuit = getCircuit(urlId);
  circuit.failures += 1;
  if (circuit.failures >= CONFIG.CIRCUIT_BREAK_AFTER && circuit.openedAt === null) {
    circuit.openedAt = Date.now();
    logger.warn("Circuit opened — URL will be skipped until reset", {
      urlId,
      failures: circuit.failures,
      resetInMs: CONFIG.CIRCUIT_RESET_MS,
    });
  }
}

// ─── Core: Ping a URL ─────────────────────────────────────────────────────────

async function pingUrl(url) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "PulseWatch-Monitor/1.0" },
      redirect: "follow",
    });

    const responseTime = Date.now() - start;
    clearTimeout(timeoutHandle);

    return {
      status:       response.ok ? "up" : "down",
      statusCode:   typeof response.status === "number" ? response.status : 0,
      responseTime,
      error:        null,
    };
  } catch (err) {
    clearTimeout(timeoutHandle);
    const responseTime = Date.now() - start;
    const isTimeout = err.name === "AbortError";

    return {
      status:       "down",
      statusCode:   0,                                          // never null — DB constraint safe
      responseTime,
      error:        isTimeout ? `Timed out after ${CONFIG.FETCH_TIMEOUT_MS}ms` : err.message,
    };
  }
}

// ─── Core: Ping with Retries ──────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pingWithRetry(url, urlId) {
  let lastResult;

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES + 1; attempt++) {
    lastResult = await pingUrl(url);

    logger.debug("Ping attempt complete", {
      url,
      urlId,
      attempt,
      status: lastResult.status,
      statusCode: lastResult.statusCode,
      responseTime: lastResult.responseTime,
      error: lastResult.error,
    });

    if (lastResult.status === "up") return lastResult;

    if (attempt <= CONFIG.MAX_RETRIES) {
      logger.info("Retrying after failure", { url, urlId, attempt, error: lastResult.error });
      await sleep(CONFIG.RETRY_DELAY_MS * attempt); // exponential-ish back-off
    }
  }

  return lastResult;
}

// ─── Core: Process One URL ────────────────────────────────────────────────────

async function processUrl({ id, url }) {
  if (isCircuitOpen(id)) {
    logger.warn("Skipping URL — circuit open", { urlId: id, url });
    return;
  }

  const result = await pingWithRetry(url, id);

  if (result.status === "up") {
    recordCircuitSuccess(id);
    logger.info("URL is up", { urlId: id, url, statusCode: result.statusCode, responseTime: result.responseTime });
  } else {
    recordCircuitFailure(id);
    logger.warn("URL is down", { urlId: id, url, error: result.error, statusCode: result.statusCode });
  }

  // Persist log
  try {
    await query(
      `INSERT INTO url_logs (url_id, status_code, response_time_ms, error_message, checked_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, result.statusCode, result.responseTime, result.error]
    );
  } catch (err) {
    logger.error("Failed to insert url_log", { urlId: id, url, error: err.message, sqlState: err.sqlState });
  }

  // Update current status
  try {
    await query(
      `UPDATE urls SET status = ?, last_checked = NOW(), last_response_time_ms = ? WHERE id = ?`,
      [result.status, result.responseTime, id]
    );
  } catch (err) {
    logger.error("Failed to update url status", { urlId: id, url, error: err.message });
  }
}

// ─── Concurrency Limiter ──────────────────────────────────────────────────────
// Runs tasks in parallel but caps inflight count so we don't overwhelm the DB
// or the network when there are hundreds of URLs.

async function runWithConcurrency(items, limit, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      try {
        results.push(await fn(item));
      } catch (err) {
        results.push({ error: err.message });
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ─── Main Monitor Job ─────────────────────────────────────────────────────────

let isRunning = false; // Guard against cron overlap

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
    urls = await query("SELECT id, url FROM urls");
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

  await runWithConcurrency(urls, CONFIG.CONCURRENCY_LIMIT, processUrl);

  const duration = Date.now() - jobStart;
  logger.info("Monitor job complete", { duration: `${duration}ms`, checked: urls.length });

  isRunning = false;
};

// ─── Scheduler ────────────────────────────────────────────────────────────────

let cronJob = null;

function start() {
  if (cronJob) {
    logger.warn("Monitor already started");
    return;
  }

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

process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down monitor");
  stop();
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down monitor");
  stop();
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception in monitor", { error: err.message, stack: err.stack });
  // Don't exit — let the process manager (PM2 etc.) decide
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection in monitor", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { start, stop, monitorUrls };