// dependencies
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const app = express();
dotenv.config();

// DB
const db = require("./config/db");


// monitoring service
// const monitor = require("./services/URLMonitoringService");
// monitor.start()

// routes
const userAuthRoutes = require("./routes/users/authentication");
const URLRoutes = require("./routes/URL/URL");
const dashboardRoutes = require("./routes/monitoring/dash");

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", userAuthRoutes);
app.use("/api/url", URLRoutes);
app.use("/api/dashboard", dashboardRoutes);

// server start
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});