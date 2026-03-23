const dotenv = require("dotenv");
dotenv.config();

const db      = require("./config/db");
const monitor = require("./services/URLMonitoringService");

monitor.start();
console.log("👁️ Monitor running");