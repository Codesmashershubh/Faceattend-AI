import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function DailyAttendanceChart({ data }) {
  // data: [{ date: "Mon", present: 42 }, ...]
  return (
    <div className="card-light p-6 border border-black/5">
      <p className="text-sm text-muted mb-4">Daily attendance (last 7 days)</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid stroke="#EFEFEF" vertical={false} />
          <XAxis dataKey="date" stroke="#9A9590" fontSize={12} />
          <YAxis stroke="#9A9590" fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
          <Line type="monotone" dataKey="present" stroke="#75C5DE" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyReportChart({ data }) {
  // data: [{ month: "Jan", percentage: 92 }, ...]
  return (
    <div className="card-light p-6 border border-black/5">
      <p className="text-sm text-muted mb-4">Monthly attendance %</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid stroke="#EFEFEF" vertical={false} />
          <XAxis dataKey="month" stroke="#9A9590" fontSize={12} />
          <YAxis stroke="#9A9590" fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
          <Bar dataKey="percentage" fill="#0B0B0B" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
