import React, { useEffect, useRef, useState } from "react";
import {
  Globe,
  ShieldAlert,
  Zap,
  Activity,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Layers,
  Flame,
  AlertTriangle,
  Server,
  Crosshair,
  Wifi,
} from "lucide-react";

// Major global cybersecurity hubs with latitude and longitude coordinates
const HUBS = [
  { id: "blr", name: "Bangalore, IN", lat: 12.9716, lon: 77.5946, status: "Critical Defense", ip: "103.14.120.4" },
  { id: "del", name: "New Delhi, IN", lat: 28.6139, lon: 77.2090, status: "Active Triage", ip: "115.240.90.18" },
  { id: "fra", name: "Frankfurt, DE", lat: 50.1109, lon: 8.6821, status: "SOC Protected", ip: "194.12.44.82" },
  { id: "lon", name: "London, UK", lat: 51.5074, lon: -0.1278, status: "Encrypted", ip: "82.165.197.1" },
  { id: "nyc", name: "New York, US", lat: 40.7128, lon: -74.0060, status: "High Volume", ip: "198.51.100.24" },
  { id: "sfo", name: "San Francisco, US", lat: 37.7749, lon: -122.4194, status: "Firewall Strict", ip: "192.0.2.144" },
  { id: "tyo", name: "Tokyo, JP", lat: 35.6762, lon: 139.6503, status: "Zero-Trust Active", ip: "133.242.18.9" },
  { id: "sgp", name: "Singapore, SG", lat: 1.3521, lon: 103.8198, status: "DDoS Mitigation", ip: "203.116.88.5" },
  { id: "syd", name: "Sydney, AU", lat: -33.8688, lon: 151.2093, status: "Monitoring", ip: "139.130.4.5" },
  { id: "dxb", name: "Dubai, AE", lat: 25.2048, lon: 55.2708, status: "Normal", ip: "94.200.12.8" },
  { id: "sao", name: "São Paulo, BR", lat: -23.5505, lon: -46.6333, status: "Threat Isolated", ip: "177.18.204.3" },
];

const THREAT_TYPES = [
  { id: "all", name: "All Threats", color: "#5da9ff" },
  { id: "ddos", name: "DDoS Volumetric", color: "#ff4757" },
  { id: "ransom", name: "Ransomware Exfil", color: "#a55eea" },
  { id: "brute", name: "Brute Force Auth", color: "#5da9ff" },
  { id: "zeroday", name: "Zero-Day Injection", color: "#ffa502" },
];

// Convert lat/lon to 3D sphere cartesian coordinates
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export default function GlobalThreatMapPage() {
  const canvasRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRotating, setIsRotating] = useState(true);
  const [attackCount, setAttackCount] = useState(48291);
  const [attackSpeed, setAttackSpeed] = useState(384);
  const [selectedHub, setSelectedHub] = useState(null);
  const [attackFeed, setAttackFeed] = useState([]);

  const rotRef = useRef({ x: 0.25, y: 0.5 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const activeArcsRef = useRef([]);

  // Generate continuous attack feed and attack arcs
  useEffect(() => {
    const feedInterval = setInterval(() => {
      const src = HUBS[Math.floor(Math.random() * HUBS.length)];
      let dst = HUBS[Math.floor(Math.random() * HUBS.length)];
      while (dst.id === src.id) {
        dst = HUBS[Math.floor(Math.random() * HUBS.length)];
      }

      const threatTypes = ["ddos", "ransom", "brute", "zeroday"];
      const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      const threatMeta = THREAT_TYPES.find((t) => t.id === type);

      const newAttack = {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        src: src.name,
        srcIp: src.ip,
        dst: dst.name,
        dstIp: dst.ip,
        type: threatMeta.name,
        color: threatMeta.color,
        typeKey: type,
        bandwidth: (Math.random() * 45 + 5).toFixed(1) + " Gbps",
      };

      setAttackFeed((prev) => [newAttack, ...prev.slice(0, 7)]);
      setAttackCount((c) => c + Math.floor(Math.random() * 3 + 1));
      setAttackSpeed(Math.floor(360 + Math.random() * 60));

      // Add 3D trajectory arc
      activeArcsRef.current.push({
        src,
        dst,
        color: threatMeta.color,
        typeKey: type,
        progress: 0,
        speed: 0.012 + Math.random() * 0.008,
      });
    }, 1200);

    return () => clearInterval(feedInterval);
  }, []);

  // 3D Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;

      if (isRotating && !isDraggingRef.current) {
        rotRef.current.y += 0.004;
      }

      const rotX = rotRef.current.x;
      const rotY = rotRef.current.y;

      // Project 3D (x,y,z) to 2D (screenX, screenY, scale)
      const project = (v) => {
        // Rotate around Y
        let x1 = v.x * Math.cos(rotY) + v.z * Math.sin(rotY);
        let y1 = v.y;
        let z1 = -v.x * Math.sin(rotY) + v.z * Math.cos(rotY);

        // Rotate around X
        let x2 = x1;
        let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

        const fov = 700;
        const scale = fov / (fov + z2);
        return {
          x: cx + x2 * scale,
          y: cy + y2 * scale,
          z: z2,
          scale,
        };
      };

      // 1. Draw glowing background sphere aura
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.25);
      grad.addColorStop(0, "rgba(93, 169, 255, 0.08)");
      grad.addColorStop(0.6, "rgba(93, 169, 255, 0.03)");
      grad.addColorStop(1, "rgba(5, 6, 10, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 3D wireframe latitude / longitude rings
      ctx.lineWidth = 1;
      // Latitude parallels
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(93, 169, 255, 0.12)";
        let first = true;
        for (let lon = -180; lon <= 180; lon += 10) {
          const p = project(latLonToVector3(lat, lon, radius));
          if (p.z > 0) {
            ctx.strokeStyle = "rgba(93, 169, 255, 0.18)";
          } else {
            ctx.strokeStyle = "rgba(93, 169, 255, 0.04)";
          }
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Longitude meridians
      for (let lon = 0; lon < 360; lon += 45) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 10) {
          const p = project(latLonToVector3(lat, lon, radius));
          if (p.z > 0) {
            ctx.strokeStyle = "rgba(93, 169, 255, 0.14)";
          } else {
            ctx.strokeStyle = "rgba(93, 169, 255, 0.03)";
          }
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // 3. Draw active cyber hubs
      HUBS.forEach((hub) => {
        const v3 = latLonToVector3(hub.lat, hub.lon, radius);
        const p = project(v3);

        if (p.z > -radius * 0.3) {
          const alpha = (p.z + radius) / (radius * 2);

          // Pulse ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(93, 169, 255, ${alpha * 0.9})`;
          ctx.shadowColor = "#5da9ff";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Label
          ctx.font = `${Math.round(11 * p.scale)}px 'Inter', sans-serif`;
          ctx.fillStyle = `rgba(238, 242, 251, ${alpha * 0.85})`;
          ctx.fillText(hub.name, p.x + 8 * p.scale, p.y + 3 * p.scale);
        }
      });

      // 4. Draw active 3D ballistic attack arcs
      const currentArcs = activeArcsRef.current;
      for (let i = currentArcs.length - 1; i >= 0; i--) {
        const arc = currentArcs[i];

        if (activeFilter !== "all" && arc.typeKey !== activeFilter) {
          continue;
        }

        arc.progress += arc.speed;

        if (arc.progress >= 1) {
          currentArcs.splice(i, 1);
          continue;
        }

        const vSrc = latLonToVector3(arc.src.lat, arc.src.lon, radius);
        const vDst = latLonToVector3(arc.dst.lat, arc.dst.lon, radius);

        // Draw trajectory arc path
        ctx.beginPath();
        const steps = 24;
        let isFront = false;

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          // Spherical linear interpolation with elevation arc
          const x = vSrc.x * (1 - t) + vDst.x * t;
          const y = vSrc.y * (1 - t) + vDst.y * t;
          const z = vSrc.z * (1 - t) + vDst.z * t;
          const len = Math.sqrt(x * x + y * y + z * z);

          // Parabolic height apex above sphere
          const heightApex = Math.sin(t * Math.PI) * (radius * 0.35);
          const elevatedRadius = radius + heightApex;

          const point3D = {
            x: (x / len) * elevatedRadius,
            y: (y / len) * elevatedRadius,
            z: (z / len) * elevatedRadius,
          };

          const p = project(point3D);
          if (p.z > 0) isFront = true;

          if (s === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }

        ctx.strokeStyle = arc.color + (isFront ? "55" : "15");
        ctx.lineWidth = isFront ? 1.8 : 0.8;
        ctx.stroke();

        // Draw traveling laser photon head
        const tHead = arc.progress;
        const xH = vSrc.x * (1 - tHead) + vDst.x * tHead;
        const yH = vSrc.y * (1 - tHead) + vDst.y * tHead;
        const zH = vSrc.z * (1 - tHead) + vDst.z * tHead;
        const lenH = Math.sqrt(xH * xH + yH * yH + zH * zH);
        const heightApexH = Math.sin(tHead * Math.PI) * (radius * 0.35);
        const head3D = {
          x: (xH / lenH) * (radius + heightApexH),
          y: (yH / lenH) * (radius + heightApexH),
          z: (zH / lenH) * (radius + heightApexH),
        };
        const pHead = project(head3D);

        if (pHead.z > -radius * 0.2) {
          ctx.beginPath();
          ctx.arc(pHead.x, pHead.y, 3.5 * pHead.scale, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [isRotating, activeFilter]);

  // Mouse drag handlers for 3D globe rotation
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    rotRef.current.y += dx * 0.006;
    rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x - dy * 0.006));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="threat-map-page">
      <style>{`
        .threat-map-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #eef2fb;
        }
        .map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .map-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .map-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5da9ff;
          background: rgba(93, 169, 255, 0.1);
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(93, 169, 255, 0.25);
          width: fit-content;
        }
        .map-headline {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .map-tagline {
          font-size: 13px;
          color: #9aa4bd;
          margin: 0;
        }
        .map-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) {
          .map-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .map-stats-grid { grid-template-columns: 1fr; }
        }
        .map-stat-card {
          background: rgba(13, 15, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          backdrop-filter: blur(12px);
        }
        .map-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .map-stat-icon.blue { background: rgba(93, 169, 255, 0.12); color: #5da9ff; border: 1px solid rgba(93, 169, 255, 0.3); }
        .map-stat-icon.pink { background: rgba(255, 95, 162, 0.12); color: #ff5fa2; border: 1px solid rgba(255, 95, 162, 0.3); }
        .map-stat-icon.green { background: rgba(46, 213, 115, 0.12); color: #2ed573; border: 1px solid rgba(46, 213, 115, 0.3); }
        .map-stat-icon.gold { background: rgba(255, 165, 2, 0.12); color: #ffa502; border: 1px solid rgba(255, 165, 2, 0.3); }
        .map-stat-num {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .map-stat-lbl {
          font-size: 12px;
          color: #9aa4bd;
          margin-top: 2px;
        }
        .globe-stage-card {
          position: relative;
          background: rgba(13, 15, 26, 0.9);
          border: 1px solid rgba(93, 169, 255, 0.25);
          border-radius: 20px;
          height: 540px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(93, 169, 255, 0.08);
        }
        .globe-canvas {
          width: 100%;
          height: 100%;
          cursor: grab;
        }
        .globe-canvas:active {
          cursor: grabbing;
        }
        .globe-controls-bar {
          position: absolute;
          top: 18px;
          left: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          pointer-events: none;
        }
        .filter-pill-group {
          display: flex;
          gap: 6px;
          background: rgba(5, 6, 10, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px;
          border-radius: 999px;
          pointer-events: auto;
        }
        .filter-btn {
          background: none;
          border: none;
          color: #9aa4bd;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .filter-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .filter-btn.active {
          background: rgba(93, 169, 255, 0.18);
          color: #5da9ff;
          border: 1px solid rgba(93, 169, 255, 0.4);
          font-weight: 600;
        }
        .globe-actions {
          display: flex;
          gap: 8px;
          pointer-events: auto;
        }
        .globe-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(5, 6, 10, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cdd4e6;
          padding: 7px 12px;
          border-radius: 10px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .globe-tool-btn:hover {
          background: rgba(93, 169, 255, 0.15);
          border-color: #5da9ff;
          color: #fff;
        }
        .globe-bottom-overlay {
          position: absolute;
          bottom: 16px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          pointer-events: none;
        }
        .live-legend {
          background: rgba(5, 6, 10, 0.85);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          pointer-events: auto;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .feed-container {
          background: rgba(13, 15, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px 20px;
        }
        .feed-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .feed-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .feed-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .feed-table th {
          text-align: left;
          color: #6b7488;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .feed-table td {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .threat-tag {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
      `}</style>

      <div className="map-header">
        <div className="map-title-wrap">
          <div className="map-eyebrow">
            <Radio size={12} className="pulse" /> LIVE TELEMETRY INTERCEPTOR
          </div>
          <h1 className="map-headline">3D Global Cyber Threat Matrix</h1>
          <p className="map-tagline">
            Real-time geospatial vector tracking of autonomous attack trajectories and edge SOC defenses.
          </p>
        </div>
      </div>

      <div className="map-stats-grid">
        <div className="map-stat-card">
          <div className="map-stat-icon blue">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="map-stat-num">{attackCount.toLocaleString()}</div>
            <div className="map-stat-lbl">Global Attacks Blocked</div>
          </div>
        </div>

        <div className="map-stat-card">
          <div className="map-stat-icon pink">
            <Activity size={20} />
          </div>
          <div>
            <div className="map-stat-num">{attackSpeed} / min</div>
            <div className="map-stat-lbl">Attack Velocity</div>
          </div>
        </div>

        <div className="map-stat-card">
          <div className="map-stat-icon green">
            <Zap size={20} />
          </div>
          <div>
            <div className="map-stat-num">99.4%</div>
            <div className="map-stat-lbl">AI Deflection Rate</div>
          </div>
        </div>

        <div className="map-stat-card">
          <div className="map-stat-icon gold">
            <Server size={20} />
          </div>
          <div>
            <div className="map-stat-num">11 Active Hubs</div>
            <div className="map-stat-lbl">Monitored Cloud SOCs</div>
          </div>
        </div>
      </div>

      <div className="globe-stage-card">
        <canvas
          ref={canvasRef}
          className="globe-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        <div className="globe-controls-bar">
          <div className="filter-pill-group">
            {THREAT_TYPES.map((t) => (
              <button
                key={t.id}
                className={`filter-btn ${activeFilter === t.id ? "active" : ""}`}
                onClick={() => setActiveFilter(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="globe-actions">
            <button
              className="globe-tool-btn"
              onClick={() => setIsRotating((r) => !r)}
              title={isRotating ? "Pause auto-spin" : "Start auto-spin"}
            >
              {isRotating ? <Pause size={13} /> : <Play size={13} />}
              {isRotating ? "Pause Spin" : "Auto Spin"}
            </button>
            <button
              className="globe-tool-btn"
              onClick={() => { rotRef.current = { x: 0.25, y: 0.5 }; }}
              title="Reset 3D Orientation"
            >
              <RotateCcw size={13} /> Reset View
            </button>
          </div>
        </div>

        <div className="globe-bottom-overlay">
          <div className="live-legend">
            <div style={{ fontWeight: 600, color: "#fff", marginBottom: 2 }}>Threat Classifications</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#ff4757" }} /> DDoS Flooding (Layer 4/7)</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#a55eea" }} /> Ransomware Payload Exfil</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#5da9ff" }} /> Brute-Force Auth Attempt</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#ffa502" }} /> Zero-Day Exploit Injection</div>
          </div>

          <div style={{ color: "#9aa4bd", fontSize: 12, background: "rgba(5,6,10,0.8)", padding: "6px 12px", borderRadius: 8 }}>
            💡 Click and drag with your mouse to rotate the 3D globe in any direction
          </div>
        </div>
      </div>

      <div className="feed-container">
        <div className="feed-head">
          <div className="feed-title">
            <Crosshair size={17} color="#ff5fa2" /> Live Intercepted Threat Stream
          </div>
          <div style={{ fontSize: 12, color: "#2ed573", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="dot on" /> Active Sniffer (WireGuard / eBPF)
          </div>
        </div>

        <table className="feed-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Attack Vector</th>
              <th>Source Origin</th>
              <th>Destination Target</th>
              <th>Volumetric Bandwidth</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attackFeed.map((a) => (
              <tr key={a.id}>
                <td style={{ color: "#9aa4bd" }}>{a.time}</td>
                <td>
                  <span
                    className="threat-tag"
                    style={{
                      background: a.color + "20",
                      color: a.color,
                      border: `1px solid ${a.color}50`,
                    }}
                  >
                    {a.type}
                  </span>
                </td>
                <td>
                  <div style={{ color: "#fff", fontWeight: 500 }}>{a.src}</div>
                  <div style={{ fontSize: 11, color: "#6b7488" }}>{a.srcIp}</div>
                </td>
                <td>
                  <div style={{ color: "#5da9ff", fontWeight: 500 }}>{a.dst}</div>
                  <div style={{ fontSize: 11, color: "#6b7488" }}>{a.dstIp}</div>
                </td>
                <td style={{ color: "#ffa502", fontWeight: 600 }}>{a.bandwidth}</td>
                <td>
                  <span style={{ color: "#2ed573", fontSize: 12, fontWeight: 600 }}>
                    🛡️ Auto-Mitigated
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
