import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function toCSV(records) {
  const header = ["Name", "Roll No", "Date", "Time", "Confidence", "Status"];
  const rows = records.map((r) => [
    r.studentId?.name || "",
    r.studentId?.rollNumber || "",
    r.date,
    r.time,
    r.confidence,
    r.status,
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}

export default function Reports() {
  const [records, setRecords] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const { data } = await api.get("/attendance", { params });
    setRecords(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function downloadCSV() {
    const blob = new Blob([toCSV(records)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPDF() {
    // Uses the browser's native print-to-PDF, no paid PDF library required
    window.print();
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 flex flex-col gap-6">
          <div className="card-light p-6 border border-black/5">
            <h2 className="text-lg font-semibold text-ink mb-4">Generate report</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-xs text-muted block mb-1">From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-black/10 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-black/10 px-4 py-2 text-sm" />
              </div>
              <button onClick={load} className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5">
                Filter
              </button>
              <button onClick={downloadCSV} className="btn-pill">
                <span className="pl-1">Export CSV</span>
                <span className="circle">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M5 13L13 5M13 5H6M13 5V12" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              <button onClick={printPDF} className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5">
                Print / Save as PDF
              </button>
            </div>
          </div>

          <div className="card-light p-6 border border-black/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-black/10">
                  <th className="py-2">Student</th>
                  <th>Roll no.</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="border-b border-black/5">
                    <td className="py-3 text-ink">{r.studentId?.name || "—"}</td>
                    <td>{r.studentId?.rollNumber || "—"}</td>
                    <td>{r.date}</td>
                    <td>{r.time}</td>
                    <td>{r.confidence}%</td>
                    <td className="capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
