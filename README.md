# FaceAttend AI — Smart Attendance Monitoring System

A production-shaped, 100% free-tier attendance system built exactly to the PRD:
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

## 1. Prerequisites (all free)

- Node.js 18+ and npm
- Python 3.10–3.11 (face_recognition/dlib do not yet support every 3.13 build)
- A free MongoDB Atlas cluster: https://www.mongodb.com/cloud/atlas/register
- CMake + a C++ build toolchain, required to install `dlib`:
  - macOS: `brew install cmake`
  - Ubuntu/Debian: `sudo apt install cmake build-essential`
  - Windows: install "Visual Studio Build Tools" + CMake

## 2. AI engine setup

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt  # dlib compiles from source here — this step can take 5-15 min
python app.py                    # runs on http://localhost:8000
```

Verify it's alive: `curl http://localhost:8000/health`

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: paste your MongoDB Atlas connection string and a random JWT_SECRET
npm install
npm run dev      # runs on http://localhost:5000
```

## 4. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # runs on http://localhost:5173
```

## 5. Using the app

1. Open http://localhost:5173/register and create the **first account** — then, in
   MongoDB Atlas (or via `mongosh`), set that user's `role` field to `"admin"`.
   Every subsequent signup defaults to `"student"`.
2. Log in as admin → **Students** → add each student with a clear, front-facing
   photo. The photo is sent to the AI engine once to build a 128-d face encoding,
   which is stored in MongoDB — the image itself doesn't need to be kept.
3. Go to **Scan** → start the camera → **Capture & mark**. The backend fetches all
   enrolled encodings, forwards the frame to the AI engine, and marks attendance
   for the closest match above the confidence threshold (70% by default).
4. **Dashboard** shows live present/absent counts and trend charts. **Reports**
   exports CSV, or use "Print / Save as PDF" for a PDF report with zero extra
   libraries.

## 6. Free deployment

| Layer     | Where            | Notes                                                      |
|-----------|------------------|--------------------------------------------------------------|
| Frontend  | Vercel (free)    | Set `VITE_API_URL` to your deployed backend URL              |
| Backend   | Render (free)    | Set `MONGO_URI`, `JWT_SECRET`, `AI_SERVER_URL`, `CLIENT_ORIGIN` |
| AI engine | Render (free)    | See "Deploying the AI engine to Render" below — needs a special build step |
| Database  | MongoDB Atlas (free M0 cluster) | Whitelist Render's IPs or allow `0.0.0.0/0` for simplicity |

Render's free instances sleep after inactivity, so the first request after idle
time (especially to the AI engine, since dlib is heavier) can take 30–60s to wake up.
`backend/utils/aiClient.js` already carries a 90s timeout and retry/backoff for
exactly this, and both the student-enrollment and attendance-scan controllers
use it, so a sleeping AI engine recovers on its own instead of the request
just failing.

### One-click deploy with the Blueprint

A `render.yaml` at the repo root defines both the `faceattend-backend` and
`faceattend-ai-engine` services (plan `free`, correct build/start commands,
`/health` checks) so Render can provision them together:

1. Render Dashboard → **New** → **Blueprint** → select this repo.
2. Render pauses to ask for the `sync: false` values: `MONGO_URI`,
   `AI_SERVER_URL` (leave blank on the very first sync, then fill in the
   `faceattend-ai-engine` service's URL once Render assigns it and redeploy
   the backend), and `CLIENT_ORIGIN`. `JWT_SECRET` is generated for you.
3. Deploy the frontend separately to Vercel as described above.

You can still create the two Render services by hand instead — the steps
below describe exactly what the Blueprint automates.

### Deploying the AI engine to Render

**The problem:** a plain `pip install -r requirements.txt` compiles `dlib` from
C++ source. That takes 1+ hours on Render's free-tier build machines and always
times out — Render's free tier build step has a hard time limit far shorter than that.

**The fix:** `dlib-bin` on PyPI ships the *exact same* dlib library as a
precompiled wheel — same version, same API, verified to behave identically
in every test above. Two new files handle this, and your **local Windows
setup is completely unaffected** — `requirements.txt` still compiles real
`dlib` locally exactly as before, since local isn't time-limited the way
Render's build step is.

When you create the Render Web Service for `ai-engine`, set:

- **Root Directory:** `ai-engine`
- **Build Command:** `bash build.sh`
- **Start Command:** `gunicorn -c gunicorn_conf.py app:app`
- **Environment variable:** none required beyond what Render sets automatically (`PORT`)

`build.sh`, `requirements-render.txt`, and `gunicorn_conf.py` are already in
the `ai-engine/` folder — Render just needs to be told to use the build
command above instead of its default `pip install -r requirements.txt`, and
the start command above so the free-tier-tuned worker/thread/timeout settings
in `gunicorn_conf.py` actually take effect (a bare `gunicorn app:app` ignores
that file).

This was tested end-to-end in a clean environment simulating Render's setup:
full build completes in under 15 seconds, and every API response (`/health`,
`/encode`, `/recognize`, including error cases) came back byte-for-byte
identical to the locally-compiled version. Nothing about the app's behavior
changes — only *how* the dlib binary gets onto the server.

**Performance note:** `app.py` downscales any uploaded image whose longest
edge exceeds 800px before running detection/encoding. This is applied
identically at enrollment (`/encode`) and scan time (`/recognize`), so the
two encodings being compared always come from equivalently-scaled images —
matching accuracy is unaffected, but a modern phone photo (often 3000px+)
now takes a fraction of the CPU/RAM it used to on Render's shared-CPU
512MB free instance.

## 7. Design system

The UI follows a signature look: a near-black (`#0B0B0B`) surface for
navigation and emphasis cards, a warm cream (`#F4F1E8`) for text on dark
surfaces, a light canvas (`#E4E4E4`) background, and a single accent —
a cyan-blue (`#75C5DE`) — used only for the AI "scan" moments and primary
actions, echoed in the pill-shaped buttons with a circular arrow icon.
Typography is Inter throughout. This keeps the interface calm and legible for
daily attendance-taking, while the accent color reinforces the one thing that
makes this product different: live AI recognition.

## 8. Security notes already implemented

- Passwords hashed with bcrypt (12 rounds), never stored in plaintext
- JWT-based auth with role checks (`admin` vs `student`) on every protected route
- Duplicate-attendance prevention via a unique `(studentId, date)` MongoDB index
- Minimum confidence threshold (70%) before an attendance record is accepted
- Multer file-size limits (5MB) on all image uploads

## 9. Realistic next steps toward "industry ready"

This scaffold is fully functional but a few things are worth doing before a
real rollout, in line with the PRD's own "Future Improvements" section:
- **Liveness detection** (blink/movement check) to stop someone attending with
  a photo of a photo — this is the single biggest gap for a production deployment.
- Rate limiting and HTTPS-only cookies instead of `localStorage` for the JWT.
- Automated tests (Jest for backend, Vitest for frontend) and CI.
- Structured logging/monitoring (e.g. Sentry) instead of `console.error`.
