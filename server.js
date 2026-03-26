const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const app = express();
dotenv.config();

const db = require("./config/db");

// routes
const userAuthRoutes  = require("./routes/users/authentication");
const URLRoutes       = require("./routes/URL/URL");
const dashboardRoutes = require("./routes/monitoring/dash");
const trafficRoutes   = require("./routes/monitoring/Traffic");

// ✅ Import handleRedirect directly
const { handleRedirect } = require("./Controllers/TrafficMonitor");

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth",      userAuthRoutes);
app.use("/api/url",       URLRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/traffic",   trafficRoutes);

// ✅ Wrapped link redirect — must be at root level
app.get("/go/:short_code", handleRedirect);

const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});