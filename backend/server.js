require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

// Render sits behind a reverse proxy; this makes req.ip / req.secure reflect
// the real client instead of Render's proxy.
app.set("trust proxy", 1);

// gzip JSON/text responses. Cheap CPU cost, meaningfully shrinks payloads like
// attendance history / student lists on Render's free-tier shared bandwidth.
app.use(compression());

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "faceattend-backend" }));

app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

let server;
connectDB().then(() => {
  server = app.listen(PORT, () => console.log(`[server] FaceAttend backend running on port ${PORT}`));
});

// Render sends SIGTERM on every redeploy/restart. Closing the HTTP server and
// the MongoDB connection cleanly avoids dangling connections piling up against
// MongoDB Atlas's free M0 connection cap across repeated deploys.
function shutdown(signal) {
  console.log(`[server] ${signal} received, shutting down gracefully`);
  if (server) {
    server.close(() => {
      require("mongoose").connection.close(false, () => process.exit(0));
    });
  } else {
    process.exit(0);
  }
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
