"""
app.py
FaceAttend AI engine — Flask microservice that exposes two endpoints:

  POST /encode      -> turn one uploaded face image into a 128-d encoding (used at student enrollment)
  POST /recognize    -> identify who is in an uploaded frame against a set of known encodings

This server is stateless by design: the Node/Express backend owns the database and
sends the list of enrolled (studentId, encoding) pairs on every /recognize call.
That keeps the AI engine free-tier friendly (no second DB connection to manage)
and matches the architecture in the PRD: Camera -> Express -> AI server -> MongoDB.
"""

import io
import json

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

from encoder import encode_face
from recognizer import recognize_face

app = Flask(__name__)
CORS(app)


def load_image_from_request(file_storage):
    """Decode an uploaded file into an RGB numpy array."""
    image = Image.open(io.BytesIO(file_storage.read())).convert("RGB")
    return np.array(image)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "faceattend-ai-engine"})


@app.post("/encode")
def encode():
    """
    Form-data: image=<file>
    Used when an admin adds a student / a student registers their face.
    """
    if "image" not in request.files:
        return jsonify({"message": "image file is required"}), 400

    image = load_image_from_request(request.files["image"])
    encoding = encode_face(image)

    if encoding is None:
        return jsonify({"message": "No face detected", "encoding": None}), 422

    return jsonify({"encoding": encoding})


@app.post("/recognize")
def recognize():
    """
    Form-data:
      image=<file>
      known_encodings=<JSON string> e.g. '[{"id":"64f...","encoding":[...128 floats...]}, ...]'
    Used when the camera captures a live frame to mark attendance.
    """
    if "image" not in request.files:
        return jsonify({"message": "image file is required"}), 400

    image = load_image_from_request(request.files["image"])
    encoding = encode_face(image)

    if encoding is None:
        return jsonify({"person": None, "studentId": None, "confidence": 0, "status": "no_face_detected"})

    raw_known = request.form.get("known_encodings", "[]")
    try:
        known = json.loads(raw_known)
    except json.JSONDecodeError:
        return jsonify({"message": "known_encodings must be valid JSON"}), 400

    known_ids = [k["id"] for k in known]
    known_encodings = [k["encoding"] for k in known]

    student_id, confidence, status = recognize_face(encoding, known_encodings, known_ids)

    return jsonify({
        "studentId": student_id,
        "confidence": confidence,
        "status": status,
    })


if __name__ == "__main__":
    # Free-tier hosts (Render) set PORT via env var; default to 8000 for local dev
    import os
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
