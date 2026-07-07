const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash, never store plaintext
    role: { type: String, enum: ["admin", "student"], default: "student" },
    faceEncoding: { type: [Number], default: null }, // 128-d vector from face_recognition
    faceRegistered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
