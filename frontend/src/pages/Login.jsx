import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md card-dark p-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-sky" />
          <span className="text-sm text-cream/60">FaceAttend AI</span>
        </div>
        <h1 className="text-2xl font-semibold mb-8">Sign in to your account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-cream/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-cream outline-none focus:border-sky"
              placeholder="you@school.edu"
            />
          </div>
          <div>
            <label className="text-xs text-cream/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-cream outline-none focus:border-sky"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={busy} className="btn-pill justify-center mt-2 disabled:opacity-50">
            <span className="pl-1">{busy ? "Signing in..." : "Sign in"}</span>
            <span className="circle">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M5 13L13 5M13 5H6M13 5V12" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </form>

        <p className="text-sm text-cream/60 mt-6">
          New here?{" "}
          <Link to="/register" className="text-sky underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
