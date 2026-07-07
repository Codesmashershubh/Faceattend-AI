import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", rollNumber: "", class: "", email: "" });
  const [faceImage, setFaceImage] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadStudents() {
    const { data } = await api.get("/students");
    setStudents(data);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();
    setStatus("");
    setBusy(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (faceImage) body.append("faceImage", faceImage);

      await api.post("/students", body, { headers: { "Content-Type": "multipart/form-data" } });
      setStatus("Student added successfully.");
      setForm({ name: "", rollNumber: "", class: "", email: "" });
      setFaceImage(null);
      loadStudents();
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to add student");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/students/${id}`);
    loadStudents();
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 flex flex-col gap-6">
          <div className="card-light p-6 border border-black/5">
            <h2 className="text-lg font-semibold text-ink mb-4">Add a student</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Full name" value={form.name} onChange={update("name")} className="rounded-xl border border-black/10 px-4 py-3" />
              <input required placeholder="Roll number" value={form.rollNumber} onChange={update("rollNumber")} className="rounded-xl border border-black/10 px-4 py-3" />
              <input required placeholder="Class" value={form.class} onChange={update("class")} className="rounded-xl border border-black/10 px-4 py-3" />
              <input required type="email" placeholder="Email" value={form.email} onChange={update("email")} className="rounded-xl border border-black/10 px-4 py-3" />
              <div className="sm:col-span-2">
                <label className="text-sm text-muted block mb-2">Face photo (clear, front-facing)</label>
                <input type="file" accept="image/*" onChange={(e) => setFaceImage(e.target.files[0])} />
              </div>
              {status && <p className="sm:col-span-2 text-sm text-sky">{status}</p>}
              <button type="submit" disabled={busy} className="btn-pill w-fit sm:col-span-2 disabled:opacity-50">
                <span className="pl-1">{busy ? "Adding..." : "Add student"}</span>
                <span className="circle">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M5 13L13 5M13 5H6M13 5V12" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </form>
          </div>

          <div className="card-light p-6 border border-black/5">
            <h2 className="text-lg font-semibold text-ink mb-4">All students ({students.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-black/10">
                    <th className="py-2">Name</th>
                    <th>Roll no.</th>
                    <th>Class</th>
                    <th>Face enrolled</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} className="border-b border-black/5">
                      <td className="py-3 text-ink">{s.name}</td>
                      <td>{s.rollNumber}</td>
                      <td>{s.class}</td>
                      <td>{s.faceData ? "Yes" : "No"}</td>
                      <td>
                        <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:underline text-xs">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
