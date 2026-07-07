"""
encoder.py
Converts a detected face into a 128-dimensional embedding used for comparison.
"""

import face_recognition
from face_detector import detect_faces, largest_face


def encode_face(image):
    """
    image: numpy array (RGB).
    Returns a 128-d list of floats for the most prominent face, or None if no face is found.
    """
    boxes = detect_faces(image)
    box = largest_face(boxes)
    if box is None:
        return None

    encodings = face_recognition.face_encodings(image, known_face_locations=[box])
    if not encodings:
        return None

    return encodings[0].tolist()
