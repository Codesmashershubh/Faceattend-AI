import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      setError("Camera access denied or unavailable.");
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }

  async function captureAndMark() {
    if (!videoRef.current) return;
    setBusy(true);
    setResult(null);
    setError("");

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      try {
        const body = new FormData();
        body.append("image", blob, "capture.jpg");
        const { data } = await api.post("/attendance/mark", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || "Recognition failed");
      } finally {
        setBusy(false);
      }
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 flex flex-col gap-6 max-w-2xl">
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold mb-1">Live attendance scan</h2>
            <p className="text-sm text-cream/60 mb-4">
              Look directly at the camera, then capture a frame to mark attendance.
            </p>

            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3 mt-5">
              {!streaming ? (
                <button onClick={startCamera} className="btn-pill">
                  <span className="pl-1">Start camera</span>
                  <span className="circle">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <path d="M5 13L13 5M13 5H6M13 5V12" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ) : (
                <>
                  <button onClick={captureAndMark} disabled={busy} className="btn-pill disabled:opacity-50">
                    <span className="pl-1">{busy ? "Scanning..." : "Capture & mark"}</span>
                    <span className="circle">
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <path d="M5 13L13 5M13 5H6M13 5V12" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                  <button onClick={stopCamera} className="text-sm text-cream/60 underline">
                    Stop camera
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {result && (
            <div className="card-light p-6 border border-black/5">
              <p className="text-sm text-muted mb-1">Result</p>
              <p className="text-lg font-medium text-ink">{result.message}</p>
              {result.student && (
                <p className="text-sm text-muted mt-1">
                  {result.student.name} · Roll {result.student.rollNumber} · Confidence {result.confidence}%
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
