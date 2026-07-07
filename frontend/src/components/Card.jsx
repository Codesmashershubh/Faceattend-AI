import React from "react";

export default function Card({ label, value, accent = false, sub }) {
  return (
    <div className={accent ? "card-dark p-6" : "card-light p-6 border border-black/5"}>
      <p className={`text-sm ${accent ? "text-cream/60" : "text-muted"}`}>{label}</p>
      <p className={`text-3xl font-semibold mt-2 ${accent ? "text-cream" : "text-ink"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? "text-sky" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}
