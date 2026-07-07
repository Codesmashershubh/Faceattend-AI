const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000";

// Render's free tier spins a web service down after ~15 minutes of no traffic.
// The AI engine is the heavier of the two services to wake (it has to import
// dlib/face_recognition), so the very first request after idle time can take
// 30-60s just to get a TCP connection accepted, before any inference happens.
// A default axios call has no timeout at all, which means a sleeping AI engine
// makes the backend request (and the user's browser request behind it) hang
// indefinitely instead of failing fast or recovering on its own.
const aiClient = axios.create({
  baseURL: AI_SERVER_URL,
  timeout: 90_000, // generous enough to cover a cold start + HOG inference
});

axiosRetry(aiClient, {
  retries: 3,
  // Backs off 2s, 4s, 8s — enough spacing for the free-tier instance to finish
  // waking up between attempts without the caller waiting much longer than the
  // single 90s timeout would anyway.
  retryDelay: (retryCount) => 2000 * 2 ** (retryCount - 1),
  // Both /encode and /recognize are side-effect-free on the AI engine itself
  // (no DB writes happen there), so it's safe to retry them even though they're
  // POST requests — axios-retry's default only retries idempotent methods,
  // which would otherwise skip exactly the requests this app makes most.
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    error.code === "ECONNABORTED" ||
    error.response?.status === 502 ||
    error.response?.status === 503,
});

module.exports = aiClient;
