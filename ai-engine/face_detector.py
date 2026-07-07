"""
face_detector.py
Locates faces inside an image using face_recognition (dlib HOG/CNN detector under the hood).
"""

import face_recognition


def detect_faces(image):
    """
    image: numpy array (RGB) as loaded by face_recognition.load_image_file or decoded from bytes.
    Returns a list of face bounding boxes as (top, right, bottom, left) tuples.
    """
    # "hog" is fast and free-tier friendly (CPU only). Swap to "cnn" if a GPU is available.
    return face_recognition.face_locations(image, model="hog")


def largest_face(boxes):
    """Given multiple detected faces, pick the largest one (closest to camera)."""
    if not boxes:
        return None

    def area(box):
        top, right, bottom, left = box
        return (bottom - top) * (right - left)

    return max(boxes, key=area)
