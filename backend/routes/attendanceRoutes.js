const express = require("express");
const multer = require("multer");
const { auth } = require("../middleware/auth");
const { markAttendance, getAttendance } = require("../controllers/attendanceController");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router.post("/mark", auth, upload.single("image"), markAttendance);
router.get("/", auth, getAttendance);

module.exports = router;
