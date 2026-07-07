const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // linked login account, optional
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    class: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    faceData: { type: [Number], default: null }, // 128-d face encoding
    faceImageUrl: { type: String, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
