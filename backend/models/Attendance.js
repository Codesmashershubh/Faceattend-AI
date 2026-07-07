const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, indexed for fast daily lookups
    time: { type: String, required: true }, // HH:mm:ss
    status: { type: String, enum: ["present", "absent", "late"], default: "present" },
    confidence: { type: Number, min: 0, max: 100, required: true },
    sessionId: { type: String, default: null }, // groups scans from one attendance session
  },
  { timestamps: true }
);

// Prevent the same student being marked twice for the same day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
