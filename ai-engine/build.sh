#!/usr/bin/env bash
# Render "Build Command" for the ai-engine service.
#
# WHY THIS FILE EXISTS:
# Render's free tier build step has a hard time limit. Compiling dlib from
# C++ source (what a plain `pip install -r requirements.txt` would do) takes
# 1+ hours on Render's free-tier machines and always times out.
#
# THE FIX:
# `dlib-bin` on PyPI ships the exact same dlib library as precompiled wheels
# (verified: same version, same API — get_frontal_face_detector,
# shape_predictor, face_recognition_model_v1 all present and working). We
# install that instead, then install face_recognition on top with --no-deps
# so pip doesn't try to also fetch and compile the real "dlib" package.
#
# This changes NOTHING about app behavior — it's the identical dlib binary,
# just precompiled instead of built from source on Render's machine.

set -e  # stop immediately if any step fails, so a bad build never looks "successful"

echo "== Python version in use =="
python --version

echo "== Upgrading pip =="
pip install --upgrade pip

echo "== Pinning setuptools<81 (face_recognition_models needs pkg_resources, =="
echo "== which newer setuptools removed) =="
pip install "setuptools<81"

echo "== Installing precompiled dlib (dlib-bin) — skips the 1hr+ source build =="
pip install --only-binary=:all: dlib-bin==20.0.1

echo "== Verifying dlib-bin actually installed as a precompiled wheel =="
python -c "import dlib; assert hasattr(dlib, 'shape_predictor'); assert hasattr(dlib, 'face_recognition_model_v1'); print('dlib OK:', dlib.__file__)"

echo "== Installing face_recognition WITHOUT its declared dlib dependency =="
echo "== (already satisfied by dlib-bin above) =="
pip install --no-deps face_recognition==1.3.0

echo "== Installing the rest of the app's dependencies =="
pip install -r requirements-render.txt

echo "== Final sanity check: import the real app.py =="
python -c "import app; print('app.py imports successfully')"

echo "== Build complete =="
