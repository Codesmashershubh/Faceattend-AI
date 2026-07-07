import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { DailyAttendanceChart, MonthlyReportChart } from "../components/Charts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [daily, setDaily] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          api.get("/students"),
          api.get("/attendance"),
        ]);

        const students = studentsRes.data;
        const today = new Date().toISOString().slice(0, 10);
        const todaysRecords = attendanceRes.data.filter((r) => r.date === today);

        setStats({
          total: students.length,
          present: todaysRecords.length,
          absent: Math.max(students.length - todaysRecords.length, 0),
          percentage: students.length ? Math.round((todaysRecords.length / students.length) * 100) : 0,
        });

        // Build a simple last-7-days series from attendance records
        const byDate = {};
        attendanceRes.data.forEach((r) => {
          byDate[r.date] = (byDate[r.date] || 0) + 1;
        });
        const series = Object.entries(byDate)
          .sort(([a], [b]) => (a > b ? 1 : -1))
          .slice(-7)
          .map(([date, count]) => ({ date: date.slice(5), present: count }));
        setDaily(series);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }
    load();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Total students" value={stats.total} />
            <Card label="Present today" value={stats.present} accent sub="Live from AI scans" />
            <Card label="Absent today" value={stats.absent} />
            <Card label="Attendance %" value={`${stats.percentage}%`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyAttendanceChart data={daily} />
            <MonthlyReportChart
              data={[
                { month: "Feb", percentage: 88 },
                { month: "Mar", percentage: 91 },
                { month: "Apr", percentage: 85 },
                { month: "May", percentage: 93 },
                { month: "Jun", percentage: stats.percentage || 0 },
              ]}
            />
          </div>

          {user?.role === "admin" && (
            <div className="card-dark p-6 flex items-center justify-between">
              <div>
                <p className="text-cream/60 text-sm">Ready to take attendance?</p>
                <p className="text-lg font-medium">Start a live AI scanning session</p>
              </div>
              <a href="/camera" className="btn-pill">
                <span className="pl-1">Open scanner</span>
                <span className="circle">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M5 13L13 5M13 5H6M13 5V12" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
