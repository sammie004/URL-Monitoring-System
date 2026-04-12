const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const app = express();
dotenv.config();

// DB
const db = require("./config/db");

// routes
const userAuthRoutes = require("./routes/users/authentication");
const URLRoutes = require("./routes/URL/URL");
const dashboardRoutes = require("./routes/monitoring/dash");
const TrafficRoutes = require("./routes/monitoring/Traffic");
const { handleRedirect } = require("./Controllers/TrafficMonitor");

// ✅ CORS FIX
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/go/:short_code", handleRedirect);

app.use("/api/auth", userAuthRoutes);
app.use("/api/url", URLRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/traffic", TrafficRoutes);

// server start (IMPORTANT FIX)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});