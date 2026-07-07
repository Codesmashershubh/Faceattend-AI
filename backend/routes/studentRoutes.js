const express = require("express");
const multer = require("multer");
const { auth, requireRole } = require("../middleware/auth");
const {
  listStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router.get("/", auth, listStudents);
router.post("/", auth, requireRole("admin"), upload.single("faceImage"), addStudent);
router.put("/:id", auth, requireRole("admin"), updateStudent);
router.delete("/:id", auth, requireRole("admin"), deleteStudent);

module.exports = router;
