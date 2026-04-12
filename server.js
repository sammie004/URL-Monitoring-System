// dependencies
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const app = express();
dotenv.config();

// DB
const db = require("./config/db");
// require('./cron-job')

// routes
const userAuthRoutes = require("./routes/users/authentication");
const URLRoutes      = require("./routes/URL/URL");
const dashboardRoutes = require("./routes/monitoring/dash");
const TrafficRoutes  = require("./routes/monitoring/Traffic")

// ✅ Add this
const { handleRedirect } = require("./Controllers/TrafficMonitor")

// middlewares
const allowedOrigins = [
  "http://localhost:5173",
  // "https://your-frontend-domain.com"t 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Add this BEFORE the traffic routes
app.get("/go/:short_code", handleRedirect)

// routes
app.use("/api/auth",      userAuthRoutes);
app.use("/api/url",       URLRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/traffic",   TrafficRoutes)

// server start
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});