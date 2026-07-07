const aiClient = require("../utils/aiClient");
const Student = require("../models/Student");

// GET /api/students
async function listStudents(req, res) {
  try {
    const students = await Student.find({ active: true }).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
}

// POST /api/students  (multipart/form-data: name, rollNumber, class, email, faceImage)
async function addStudent(req, res) {
  try {
    const { name, rollNumber, class: className, email } = req.body;
    if (!name || !rollNumber || !className || !email) {
      return res.status(400).json({ message: "name, rollNumber, class and email are required" });
    }

    const exists = await Student.findOne({ rollNumber });
    if (exists) return res.status(409).json({ message: "Roll number already exists" });

    let faceData = null;
    if (req.file) {
      // Forward the uploaded image to the Python AI engine to build a face encoding
      const form = new (require("form-data"))();
      form.append("image", req.file.buffer, { filename: req.file.originalname });
      const aiRes = await aiClient.post("/encode", form, {
        headers: form.getHeaders(),
      });
      if (!aiRes.data?.encoding) {
        return res.status(422).json({ message: "No face detected in the uploaded image" });
      }
      faceData = aiRes.data.encoding;
    }

    const student = await Student.create({
      name,
      rollNumber,
      class: className,
      email: email.toLowerCase(),
      faceData,
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to add student", error: err.message });
  }
}

// PUT /api/students/:id
async function updateStudent(req, res) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to update student", error: err.message });
  }
}

// DELETE /api/students/:id
async function deleteStudent(req, res) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove student", error: err.message });
  }
}

module.exports = { listStudents, addStudent, updateStudent, deleteStudent };
