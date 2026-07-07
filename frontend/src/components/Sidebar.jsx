import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/attendance", label: "Attendance" },
  { to: "/camera", label: "Scan" },
  { to: "/reports", label: "Reports" },
];

const studentLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/attendance", label: "My attendance" },
  { to: "/reports", label: "Reports" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 bg-ink text-cream min-h-screen flex flex-col justify-between py-8 px-6">
      <div>
        <div className="flex items-center gap-2 mb-12 px-2">
          <span className="w-3 h-3 rounded-full bg-sky" />
          <span className="font-semibold tracking-tight text-lg">FaceAttend AI</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-sky text-ink" : "text-cream/70 hover:text-cream hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <p className="text-xs text-muted px-2">Role: {user?.role}</p>
    </aside>
  );
}
