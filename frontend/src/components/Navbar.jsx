import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-canvas border-b border-black/5">
      <div>
        <p className="text-sm text-muted">Welcome back</p>
        <h1 className="text-xl font-semibold text-ink">{user?.name || "Guest"}</h1>
      </div>
      <button onClick={logout} className="btn-pill">
        <span className="pl-1">Sign out</span>
        <span className="circle">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path
              d="M5 13L13 5M13 5H6M13 5V12"
              stroke="#0B0B0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </header>
  );
}
