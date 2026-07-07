import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState("");

  async function load() {
    const { data } = await api.get("/attendance", { params: date ? { date } : {} });
    setRecords(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Attendance records</h2>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm"
            />
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
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted">
                      No attendance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
