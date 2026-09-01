import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { ScanFace, X, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Camera } from "lucide-react";
import API_BASE_URL from "../config/api.js";

export default function FaceScannerModal({ mode = "identify", onSuccess, onClose, token = null }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);

  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState("Initializing neural networks...");
  const [statusType, setStatusType] = useState("info"); // 'info' | 'scanning' | 'success' | 'error'
  const [matchedUser, setMatchedUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Clean up camera stream
  const stopCamera = () => {
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setStatus("Loading face detection & biometric models...");
        setStatusType("info");

        // Load models from public/models folder
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        if (!isMounted) return;
        setLoadingModels(false);

        setStatus("Opening camera stream...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMounted) {
              setCameraActive(true);
              startScanning();
            }
          };
        }
      } catch (err) {
        console.error("Camera/Model initialization failed:", err);
        if (isMounted) {
          setStatusType("error");
          setErrorMsg(err.message || "Failed to access webcam or load AI models.");
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const startScanning = () => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    setStatus(mode === "enroll" ? "Look directly at camera to enroll..." : "Scanning face for 1:N biometric match...");
    setStatusType("scanning");

    let matchAttempts = 0;

    const scanInterval = setInterval(async () => {
      if (!isScanningRef.current || !videoRef.current || !canvasRef.current) {
        clearInterval(scanInterval);
        return;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Run full facial detection + landmarks + 128D descriptor extraction
        const detection = await faceapi
          .detectSingleFace(video)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const dims = faceapi.matchDimensions(canvas, video, true);
          const resized = faceapi.resizeResults(detection, dims);

          // Draw custom cyberpunk bounding box
          const box = resized.detection.box;
          ctx.strokeStyle = "#5da9ff";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Draw corner accents
          const cornerLen = 14;
          ctx.strokeStyle = "#ff5fa2";
          ctx.lineWidth = 3;
          // Top Left
          ctx.beginPath(); ctx.moveTo(box.x, box.y + cornerLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cornerLen, box.y); ctx.stroke();
          // Top Right
          ctx.beginPath(); ctx.moveTo(box.x + box.width - cornerLen, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + cornerLen); ctx.stroke();
          // Bottom Left
          ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - cornerLen); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + cornerLen, box.y + box.height); ctx.stroke();
          // Bottom Right
          ctx.beginPath(); ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen); ctx.stroke();

          // Convert Float32Array to regular 128-float array
          const descriptor = Array.from(detection.descriptor);

          if (mode === "enroll") {
            isScanningRef.current = false;
            clearInterval(scanInterval);
            setStatus("Face detected! Saving 128-D biometric vector...");
            setStatusType("info");

            const authToken = token || localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/auth/face/enroll`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ descriptor }),
            });

            const data = await res.json();
            if (res.ok) {
              setStatus("✨ Face profile enrolled successfully!");
              setStatusType("success");
              setTimeout(() => {
                stopCamera();
                if (onSuccess) onSuccess(data);
              }, 1200);
            } else {
              setStatusType("error");
              setErrorMsg(data.message || "Enrollment failed.");
            }
          } else {
            // Mode === "identify" (1:N Zero-Email Login)
            matchAttempts++;
            setStatus(`Face detected. Comparing 128-D vector (Attempt ${matchAttempts})...`);

            const res = await fetch(`${API_BASE_URL}/api/auth/face/identify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor }),
            });

            const data = await res.json();

            if (res.ok) {
              isScanningRef.current = false;
              clearInterval(scanInterval);
              setMatchedUser(data.user);
              setStatus(`✨ Verified: ${data.user.fullName} (${data.confidence}% Match)`);
              setStatusType("success");

              // Save token and invoke onSuccess callback
              if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
              }

              setTimeout(() => {
                stopCamera();
                if (onSuccess) onSuccess(data);
              }, 1400);
            } else {
              if (matchAttempts >= 5) {
                setStatusType("error");
                setErrorMsg(data.message || "Face not recognized. Please sign in with password.");
              }
            }
          }
        }
      } catch (err) {
        console.error("Scan loop error:", err);
      }
    }, 450);
  };

  const handleRetry = () => {
    setErrorMsg("");
    setStatusType("scanning");
    startScanning();
  };

  return (
    <div className="face-modal-overlay">
      <style>{`
        .face-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(5, 6, 10, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .face-modal-card {
          width: 100%;
          max-width: 520px;
          background: rgba(13, 15, 26, 0.95);
          border: 1px solid rgba(93, 169, 255, 0.25);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(93, 169, 255, 0.15);
          position: relative;
        }
        .face-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }
        .face-modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 16px;
          color: #eef2fb;
        }
        .face-modal-close {
          background: none;
          border: none;
          color: #9aa4bd;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.15s ease;
        }
        .face-modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .face-viewport {
          position: relative;
          width: 100%;
          height: 320px;
          background: #05060a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .face-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Mirror view */
        }
        .face-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: scaleX(-1); /* Mirror canvas to align with mirrored video */
          pointer-events: none;
        }
        .scan-laser {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #5da9ff, #ff5fa2, transparent);
          box-shadow: 0 0 12px #5da9ff;
          animation: laserScan 2.4s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes laserScan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .face-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(93, 169, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(93, 169, 255, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }
        .face-status-bar {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .status-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
        }
        .status-chip.info {
          background: rgba(93, 169, 255, 0.08);
          border: 1px solid rgba(93, 169, 255, 0.2);
          color: #5da9ff;
        }
        .status-chip.scanning {
          background: rgba(93, 169, 255, 0.12);
          border: 1px solid rgba(93, 169, 255, 0.35);
          color: #eef2fb;
        }
        .status-chip.success {
          background: rgba(46, 213, 115, 0.12);
          border: 1px solid rgba(46, 213, 115, 0.4);
          color: #2ed573;
          font-weight: 600;
        }
        .status-chip.error {
          background: rgba(255, 71, 87, 0.12);
          border: 1px solid rgba(255, 71, 87, 0.4);
          color: #ff4757;
        }
        .face-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }
        .btn-ghost-sec {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cdd4e6;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s ease;
        }
        .btn-ghost-sec:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .btn-primary-face {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #3a7bff, #ff2f8f);
          border: none;
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(58, 123, 255, 0.3);
          transition: all 0.15s ease;
        }
        .btn-primary-face:hover {
          box-shadow: 0 6px 20px rgba(255, 47, 143, 0.4);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="face-modal-card">
        <div className="face-modal-header">
          <div className="face-modal-title">
            <ScanFace size={20} color="#5da9ff" />
            <span>{mode === "enroll" ? "Biometric Face Enrollment" : "AI Face Recognition Sign-In"}</span>
          </div>
          <button className="face-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="face-viewport">
          <video ref={videoRef} autoPlay playsInline muted className="face-video" />
          <canvas ref={canvasRef} className="face-canvas" />
          <div className="face-grid-overlay" />
          {cameraActive && !errorMsg && <div className="scan-laser" />}

          {loadingModels && (
            <div style={{ position: "absolute", color: "#5da9ff", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <RefreshCw size={28} className="spin" />
              <span>Loading AI Models...</span>
            </div>
          )}
        </div>

        <div className="face-status-bar">
          <div className={`status-chip ${statusType}`}>
            {statusType === "success" && <CheckCircle2 size={16} />}
            {statusType === "error" && <AlertTriangle size={16} />}
            {statusType === "scanning" && <ScanFace size={16} className="pulse" />}
            {statusType === "info" && <ShieldCheck size={16} />}
            <span>{errorMsg || status}</span>
          </div>

          <div className="face-footer-actions">
            {errorMsg && (
              <button className="btn-primary-face" onClick={handleRetry}>
                <RefreshCw size={14} /> Retry Scan
              </button>
            )}
            <button className="btn-ghost-sec" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
