const aiClient = require("../utils/aiClient");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const MIN_CONFIDENCE = 40; // reject low-confidence matches to reduce false positives

// POST /api/attendance/mark  (multipart/form-data: image, sessionId?)
async function markAttendance(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "image is required" });

    // Build the set of enrolled faces to match against (stateless AI engine)
    const enrolled = await Student.find({ active: true, faceData: { $ne: null } }, "faceData");
    const knownEncodings = enrolled.map((s) => ({ id: s._id.toString(), encoding: s.faceData }));

    const form = new (require("form-data"))();
    form.append("image", req.file.buffer, { filename: req.file.originalname });
    form.append("known_encodings", JSON.stringify(knownEncodings));

    // Ask the AI engine to identify who is in the frame. aiClient carries the
    // long timeout + retry/backoff needed to survive a sleeping free-tier
    // Render instance waking up mid-request.
    console.log("Calling AI Server...");
    const aiRes = await aiClient.post("/recognize", form, {
      headers: form.getHeaders(),
    });
    console.log("AI Response:", aiRes.data);
    const { studentId, confidence, status } = aiRes.data;
    if (status !== "recognized" || !studentId) {
      return res.status(404).json({ message: "Face not recognized", aiResult: aiRes.data });
    }
    if (confidence < MIN_CONFIDENCE) {
      return res.status(422).json({ message: "Confidence too low to mark attendance", confidence });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Matched student not found in database" });

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);

    // Duplicate prevention relies on the unique (studentId, date) index
    const record = await Attendance.findOneAndUpdate(
      { studentId: student._id, date },
      { $setOnInsert: { time, status: "present", confidence, sessionId: req.body.sessionId || null } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const alreadyMarked = record.time !== time;
    res.json({
      message: alreadyMarked ? "Attendance already marked for today" : "Attendance marked",
      student: { id: student._id, name: student.name, rollNumber: student.rollNumber },
      confidence,
      record,
    });
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({
        message: "Failed to mark attendance",
        error: err.message,
        stack: err.stack
    });
}
}

// GET /api/attendance?studentId=&date=&from=&to=
async function getAttendance(req, res) {
  try {
    const { studentId, date, from, to } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (date) filter.date = date;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const records = await Attendance.find(filter).populate("studentId", "name rollNumber class").sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
}

module.exports = { markAttendance, getAttendance };
