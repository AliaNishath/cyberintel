import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { ScanFace, X, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Camera } from "lucide-react";
import API_BASE_URL from "../config/api.js";

// Global cache for models so they load once and stay hot in browser GPU memory
let globalModelPromise = null;
export function preloadFaceModels() {
  if (!globalModelPromise) {
    globalModelPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
  }
  return globalModelPromise;
}

export default function FaceScannerModal({ mode = "identify", onSuccess, onClose, token = null }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);

  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState("Accessing front camera...");
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
        setStatus("Accessing camera viewfinder...");
        setStatusType("info");

        // 1. Immediately request camera stream so user sees their face in under 1s
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        } catch (camErr) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!isMounted) {
          if (stream) stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setCameraActive(true);
        }

        // 2. Concurrently load lightweight AI models
        setStatus("Loading lightweight biometric AI...");
        await preloadFaceModels();

        if (!isMounted) return;
        setLoadingModels(false);
        startScanning();
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
    let isProcessingFrame = false;

    const scanInterval = setInterval(async () => {
      if (!isScanningRef.current || !videoRef.current || !canvasRef.current || isProcessingFrame) {
        if (!isScanningRef.current) clearInterval(scanInterval);
        return;
      }

      isProcessingFrame = true;

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          isProcessingFrame = false;
          return;
        }

        // Match canvas dimensions to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Run detection with ultra-fast TinyFaceDetector
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const dims = faceapi.matchDimensions(canvas, video, true);
          const resized = faceapi.resizeResults(detection, dims);

          // Draw bounding box
          const box = resized.detection.box;
          ctx.strokeStyle = "#5da9ff";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Draw corner accents
          const cornerLen = 14;
          ctx.strokeStyle = "#ff5fa2";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(box.x, box.y + cornerLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cornerLen, box.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(box.x + box.width - cornerLen, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + cornerLen); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - cornerLen); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + cornerLen, box.y + box.height); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen); ctx.stroke();

          // Convert Float32Array to 128-D float array
          const descriptor = Array.from(detection.descriptor);

          if (mode === "enroll") {
            isScanningRef.current = false;
            clearInterval(scanInterval);
            setStatus("Face detected! Saving 128-D biometric vector...");
            setStatusType("info");

            const authToken = token || localStorage.getItem("token") || localStorage.getItem("cyberintel_token");
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

              if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("cyberintel_token", data.token);
                localStorage.setItem("cyberintel_auth", "true");
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("cyberintel_user", JSON.stringify(data.user));
              }

              setTimeout(() => {
                stopCamera();
                if (onSuccess) onSuccess(data);
              }, 1200);
            } else {
              if (matchAttempts >= 6) {
                setStatusType("error");
                setErrorMsg(data.message || "Face not recognized. Please adjust lighting or sign in with password.");
              }
            }
          }
        }
      } catch (err) {
        console.error("Scan loop error:", err);
      } finally {
        isProcessingFrame = false;
      }
    }, 280);
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
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .face-modal-card {
          background: rgba(13, 15, 26, 0.98);
          border: 1px solid rgba(93, 169, 255, 0.3);
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(93, 169, 255, 0.15);
          display: flex;
          flex-direction: column;
        }
        .face-modal-head {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .face-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .face-viewfinder-wrap {
          position: relative;
          width: 100%;
          height: 320px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .face-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Mirror camera */
        }
        .face-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: scaleX(-1);
          pointer-events: none;
        }
        .face-scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #5da9ff, #ff5fa2, transparent);
          box-shadow: 0 0 12px #5da9ff;
          animation: scanMove 2s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes scanMove {
          0% { top: 10%; }
          100% { top: 88%; }
        }
        .face-modal-footer {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(8, 10, 18, 0.95);
        }
        .face-status-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #cdd4e6;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .face-status-bar.scanning {
          border-color: rgba(93, 169, 255, 0.35);
          background: rgba(93, 169, 255, 0.08);
          color: #5da9ff;
        }
        .face-status-bar.success {
          border-color: rgba(46, 213, 115, 0.4);
          background: rgba(46, 213, 115, 0.1);
          color: #2ed573;
        }
        .face-status-bar.error {
          border-color: rgba(255, 71, 87, 0.4);
          background: rgba(255, 71, 87, 0.1);
          color: #ff4757;
        }
        .btn-cancel-scan {
          align-self: flex-end;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #9aa4bd;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-cancel-scan:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="face-modal-card">
        <div className="face-modal-head">
          <div className="face-modal-title">
            <ScanFace size={20} color="#5da9ff" />
            <span>{mode === "enroll" ? "Enroll AI Face ID" : "AI Face Recognition Sign-In"}</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              if (onClose) onClose();
            }}
            style={{ background: "none", border: "none", color: "#6b7488", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="face-viewfinder-wrap">
          {loadingModels && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#5da9ff" }}>
              <RefreshCw size={28} className="spin" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Loading AI Models...</span>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline muted className="face-video" />
          <canvas ref={canvasRef} className="face-canvas" />

          {cameraActive && statusType === "scanning" && <div className="face-scan-line" />}
        </div>

        <div className="face-modal-footer">
          <div className={`face-status-bar ${statusType}`}>
            {statusType === "scanning" && <RefreshCw size={15} className="spin" />}
            {statusType === "success" && <CheckCircle2 size={15} color="#2ed573" />}
            {statusType === "error" && <AlertTriangle size={15} color="#ff4757" />}
            {statusType === "info" && <ShieldCheck size={15} color="#5da9ff" />}
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {errorMsg || status}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {errorMsg && (
              <button
                className="btn-cancel-scan"
                onClick={handleRetry}
                style={{ background: "rgba(93,169,255,0.15)", color: "#5da9ff", borderColor: "#5da9ff" }}
              >
                Retry
              </button>
            )}
            <button
              className="btn-cancel-scan"
              onClick={() => {
                stopCamera();
                if (onClose) onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
