# FaceAttend AI — Smart Attendance Monitoring System

A production-shaped, attendance system built according to modern era:
React + Vite frontend, Express/MongoDB backend, and a Python/Flask AI engine
that does real face detection and recognition with OpenCV + face_recognition (dlib).

```
faceattend-ai/
├── frontend/    React + Vite + Tailwind — admin & student UI
├── backend/     Node + Express + MongoDB — API, auth, business logic
└── ai-engine/   Python + Flask + OpenCV + face_recognition — the AI itself
```

## How it fits together

```
Camera (browser, WebRTC)
   → React frontend
      → Express backend  (auth, students, attendance, JWT)
         → Flask AI engine (face detect + encode + match)
            → MongoDB Atlas (users, students, attendance records)
```

The AI engine is stateless: on every scan, the backend sends the captured frame
*and* the list of enrolled face encodings already in MongoDB. The AI engine never
talks to the database directly, which keeps the Python side simple and free-tier
friendly (one less service to provision).


