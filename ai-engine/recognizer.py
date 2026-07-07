"""
recognizer.py
Compares a freshly captured face encoding against a set of known (stored) encodings
and returns the closest match plus a confidence score.
"""

import numpy as np
import face_recognition

# Faces further apart than this (in face-distance units) are never considered a match,
# regardless of confidence math below. 0.6 is the widely used face_recognition default.
MAX_DISTANCE = 0.6


def recognize_face(unknown_encoding, known_encodings, known_ids):
    """
    unknown_encoding: 128-d list/array for the face just captured by the camera.
    known_encodings: list of 128-d lists/arrays, one per enrolled student.
    known_ids: list of student IDs, same order/length as known_encodings.

    Returns: (student_id_or_None, confidence_percent, status)
    """
    if not known_encodings:
        return None, 0, "no_enrolled_faces"

    unknown = np.array(unknown_encoding)
    knowns = np.array(known_encodings)

    distances = face_recognition.face_distance(knowns, unknown)
    best_index = int(np.argmin(distances))
    best_distance = float(distances[best_index])

    if best_distance > MAX_DISTANCE:
        raw_confidence = (1 - best_distance) * 100
        return None, round(max(raw_confidence, 0), 2), "not_recognized"

    # Convert distance to an intuitive 0-100% confidence score
    confidence = round((1 - best_distance / MAX_DISTANCE) * 100, 2)
    return known_ids[best_index], confidence, "recognized"
