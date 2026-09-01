import React, { useState, useEffect, useRef } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { useNavigate } from "react-router-dom";
import AiChatWidget from "../components/AiChatWidget";
import LanguageSelector from "../components/LanguageSelector";
import FaceScannerModal from "../components/FaceScannerModal";
import {
  LayoutDashboard,
  ScanFace,
  Cpu,
  Radar,
  Activity,
  BarChart3,
  Info,
  Users,
  Hammer,
  Target,
  Search,
  Bell,
  Settings,
  ChevronDown,
  ShieldCheck,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  Download,
  Wifi,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  ScanSearch,
  XCircle,
  Lightbulb,
  Sparkles,
  Rocket,
  Coffee,
  Skull,
  Lock,
  Eye,
  Zap,
  Clock,
  Globe,
  Code2,
  GraduationCap,
  Briefcase,
  UserCog,
  Ghost,
  PartyPopper,
  TrendingUp,
  MapPin,
  Flag,
  Puzzle,
  HeartHandshake,
  Database,
  ShieldAlert,
  Flame,
  Camera,
  Keyboard,
  Swords,
  Volume2,
  VolumeX,
  Square,
  Headphones,
  Brain,
} from "lucide-react";
import {
  BreachCheckerPage,
  SecurityHeadersPage,
  IpIntelPage,
  PlaybooksPage,
} from "./CyberSecurityModules";
import GlobalThreatMapPage from "./GlobalThreatMapPage.jsx";
import CyberDuelArenaPage from "./CyberDuelArenaPage.jsx";
import API_BASE_URL from "../config/api.js";
import { speakText, stopSpeaking, generateDailyBriefing } from "../utils/voiceAssistant.js";
import { translateToPlainLanguage } from "../utils/plainLanguageDictionary.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

/* ---------------------------------------------------------
   CyberIntel — Dashboard Shell
   Sidebar + 5 modules + project info pages
--------------------------------------------------------- */

const API_BASE = `${API_BASE_URL}/api/dashboard`;

// Fetches real data from the backend for a given module. Falls back to the
// provided mock data if the request fails (e.g. backend not running yet),
// so the dashboard never breaks — it just quietly shows sample data instead.
function useDashboardData(endpoint, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("cyberintel_token");

    fetch(`${API_BASE}/${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setIsLive(true);
        }
      })
      .catch(() => {
        // Silently keep the fallback mock data
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading, isLive };
}

function LiveBadge({ isLive }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 999,
        marginLeft: 10,
        color: isLive ? "#7fd68a" : "#9aa4bd",
        background: isLive ? "rgba(127,214,138,0.12)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${isLive ? "rgba(127,214,138,0.3)" : "rgba(255,255,255,0.1)"}`,
      }}
    >
      {isLive ? "● LIVE DATA" : "○ SAMPLE DATA"}
    </span>
  );
}

const NAV_GROUPS = [
  {
    label: "Core Modules",
    items: [
      { key: "overview", label: "Dashboard", icon: LayoutDashboard },
      { key: "biometric", label: "Biometric Authentication", icon: ScanFace },
      { key: "threat-map", label: "3D Global Threat Map", icon: Globe },
      { key: "cyber-duel", label: "AI Cyber Duel Arena", icon: Swords },
      { key: "ai-threat", label: "AI Threat Detection", icon: Cpu },
      { key: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Cyber Tools & Intel",
    items: [
      { key: "url-scanner", label: "URL Threat Scanner", icon: LinkIcon },
      { key: "breach-checker", label: "Data Leak & Breach Checker", icon: Database },
      { key: "security-headers", label: "Security Headers & SSL", icon: ShieldAlert },
      { key: "playbooks", label: "SOC Incident Playbooks", icon: Flame },
    ],
  },
  {
    label: "Project Information",
    items: [
      { key: "about", label: "About the Project", icon: Info },
      { key: "users", label: "Users", icon: Users },
      { key: "builders", label: "Builders", icon: Hammer },
      { key: "goal", label: "Goal of the Project", icon: Target },
    ],
  },
  {
    label: "Admin",
    adminOnly: true,
    items: [
      { key: "admin-panel", label: "Admin Panel", icon: UserCog },
    ],
  },
];

const trendData = [
  { day: "Mon", threats: 12 }, { day: "Tue", threats: 19 }, { day: "Wed", threats: 14 },
  { day: "Thu", threats: 27 }, { day: "Fri", threats: 22 }, { day: "Sat", threats: 9 },
  { day: "Sun", threats: 17 },
];

const reportData = [
  { month: "Feb", incidents: 34 }, { month: "Mar", incidents: 28 }, { month: "Apr", incidents: 41 },
  { month: "May", incidents: 22 }, { month: "Jun", incidents: 30 }, { month: "Jul", incidents: 18 },
];

const threatCategoryData = [
  { name: "Phishing", value: 34 },
  { name: "Malware", value: 24 },
  { name: "Brute Force", value: 18 },
  { name: "Insider", value: 12 },
  { name: "Other", value: 12 },
];

const trafficData = [
  { hour: "00:00", volume: 120 }, { hour: "04:00", volume: 80 }, { hour: "08:00", volume: 260 },
  { hour: "12:00", volume: 340 }, { hour: "16:00", volume: 300 }, { hour: "20:00", volume: 190 },
  { hour: "23:59", volume: 140 },
];

const biometricUsageData = [
  { method: "Face ID", logins: 420 },
  { method: "Fingerprint", logins: 310 },
  { method: "Passkey", logins: 60 },
];

const anomalyTypeData = [
  { name: "Network", value: 28 },
  { name: "Authentication", value: 22 },
  { name: "Privilege Escalation", value: 15 },
  { name: "Data Exfiltration", value: 9 },
];

const riskByDeptData = [
  { dept: "IT", risk: 62 }, { dept: "Finance", risk: 74 }, { dept: "HR", risk: 41 },
  { dept: "Engineering", risk: 55 }, { dept: "Marketing", risk: 33 },
];

const connectionsData = [
  { time: "-60m", connections: 2800 }, { time: "-45m", connections: 3200 },
  { time: "-30m", connections: 3600 }, { time: "-15m", connections: 3300 },
  { time: "now", connections: 3842 },
];

const incidentTypeData = [
  { name: "Phishing", value: 30 }, { name: "Ransomware", value: 12 },
  { name: "Unauthorized Access", value: 26 }, { name: "DDoS", value: 14 },
  { name: "Misconfiguration", value: 18 },
];

const PIE_COLORS = ["#ff5fa2", "#5da9ff", "#ff8fc0", "#7cbaff", "#c084fc"];

const CHART_TOOLTIP_STYLE = {
  background: "#0d0f1a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#eef2fb",
};

/* ---------------------------- Ambient background ---------------------------- */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, particles, raf;
    const COUNT = 55;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.5,
        hue: Math.random() > 0.5 ? "blue" : "pink",
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === "blue" ? "rgba(93,169,255,0.55)" : "rgba(255,95,162,0.5)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(93,169,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(step);
    }

    init();
    step();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" />;
}

function AmbientBackground() {
  const stars = [
    { top: "10%", delay: "0s", dur: "6s" },
    { top: "35%", delay: "2.2s", dur: "7s" },
    { top: "65%", delay: "4.1s", dur: "5.5s" },
    { top: "85%", delay: "1.3s", dur: "6.5s" },
  ];
  return (
    <div className="ambient-bg">
      <div className="ambient-glow blue" />
      <div className="ambient-glow pink" />
      <ParticleField />
      <div className="scanlines" />
      {stars.map((s, i) => (
        <span key={i} className="dash-shooting-star" style={{ top: s.top, animationDelay: s.delay, animationDuration: s.dur }} />
      ))}
    </div>
  );
}

/* ---------------------------- Sidebar ---------------------------- */
function Sidebar({ active, setActive }) {
  const [hovered, setHovered] = useState(false);

  const currentRole = (() => {
    try {
      return (JSON.parse(localStorage.getItem("cyberintel_user")) || {}).role || "user";
    } catch {
      return "user";
    }
  })();

  const visibleGroups = NAV_GROUPS.filter((g) => !g.adminOnly || currentRole === "admin");

  return (
    <aside
      className={`sidebar ${hovered ? "expanded" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="sidebar-brand">
        <ShieldCheck size={22} color="#5da9ff" />
        <span className="brand-text">
          Cyber<span className="brand-accent">Intel</span>
        </span>
      </div>

      {visibleGroups.map((group) => (
        <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
              title={item.label}
            >
              <item.icon size={18} />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

/* ---------------------------- Topbar ---------------------------- */
function Topbar({ title, setActive, soundEnabled, setSoundEnabled }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(false);
  const notifRef = useRef(null);

  // Close notifications if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notifOpen]);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("cyberintel_user")) || {};
    } catch {
      return {};
    }
  })();
  const fullName = storedUser.fullName || "Alex Rock";
  const role = storedUser.role
    ? storedUser.role.charAt(0).toUpperCase() + storedUser.role.slice(1)
    : "Security Admin";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("cyberintel_auth");
    localStorage.removeItem("cyberintel_token");
    localStorage.removeItem("cyberintel_user");
    navigate("/auth");
  };

  const openNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notifications.length === 0) {
      setNotifLoading(true);
      try {
        const token = localStorage.getItem("cyberintel_token");
        const res = await fetch(`${API_BASE_URL}/api/dashboard/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setNotifications((data.recentActivity || []).slice(0, 6));
      } catch {
        setNotifications([]);
      } finally {
        setNotifLoading(false);
      }
    }
  };

  // Every sidebar page, searchable by label — typing "biometric" and hitting
  // Enter jumps straight to that module instead of the search box doing nothing.
  const allPages = NAV_GROUPS.flatMap((g) => g.items);

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const match = allPages.find((p) => p.label.toLowerCase().includes(q));
    if (match) {
      setActive(match.key);
      setSearchQuery("");
      setSearchError(false);
    } else {
      setSearchError(true);
    }
  };

  const [isBriefingPlaying, setIsBriefingPlaying] = useState(false);
  const [briefingTranscript, setBriefingTranscript] = useState("");

  const handleToggleBriefing = async () => {
    if (isBriefingPlaying) {
      stopSpeaking();
      setIsBriefingPlaying(false);
      return;
    }

    try {
      const token = localStorage.getItem("cyberintel_token");
      const res = await fetch(`${API_BASE_URL}/api/dashboard/overview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const text = generateDailyBriefing(data.stats || {}, data.recentActivity || []);
      setBriefingTranscript(text);
      setIsBriefingPlaying(true);

      speakText(text, {
        rate: 1.0,
        onStart: () => setIsBriefingPlaying(true),
        onEnd: () => setIsBriefingPlaying(false),
      });
    } catch {
      const fallbackText = generateDailyBriefing({ overallScore: 94 }, []);
      setBriefingTranscript(fallbackText);
      setIsBriefingPlaying(true);
      speakText(fallbackText, {
        onEnd: () => setIsBriefingPlaying(false),
      });
    }
  };

  return (
    <>
      <div className="topbar">
        <h2>{title}</h2>
        <div className="topbar-right">
          <div className="search-wrap">
            <div className="search-box">
              <Search size={15} />
              <input
                placeholder="Search identities, threats, reports..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchError(false); }}
                onKeyDown={handleSearch}
              />
            </div>
            {searchError && <div className="search-hint">No matching page — try "risk", "biometric", "reports"...</div>}
          </div>

          <button
            className={`btn-briefing ${isBriefingPlaying ? "playing" : ""}`}
            onClick={handleToggleBriefing}
            title={isBriefingPlaying ? "Stop Voice Briefing" : "Listen to Daily Audio Security Briefing"}
          >
            {isBriefingPlaying ? (
              <>
                <Square size={13} fill="#ff4757" />
                <span>Stop Briefing</span>
                <div className="audio-waves-container">
                  <div className="audio-wave-bar" />
                  <div className="audio-wave-bar" />
                  <div className="audio-wave-bar" />
                  <div className="audio-wave-bar" />
                </div>
              </>
            ) : (
              <>
                <Headphones size={14} />
                <span>Daily Briefing</span>
              </>
            )}
          </button>

          <LanguageSelector compact />

          <button
            className="icon-btn"
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? "Alert sound on — click to mute" : "Alert sound muted — click to unmute"}
          >
            {soundEnabled ? <Zap size={17} /> : <XCircle size={17} />}
          </button>

        <div className="notif-wrap" ref={notifRef}>
          <button
            className={`icon-btn ${notifOpen ? "active" : ""}`}
            onClick={openNotifications}
            title="Notifications"
            style={{ position: "relative" }}
          >
            <Bell size={17} />
            {notifications.length > 0 && <span className="notif-badge-dot" />}
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={14} color="#5da9ff" />
                  <span>Recent Activity</span>
                </div>
                <span className="notif-count-chip">{notifications.length} alerts</span>
              </div>
              <div className="notif-list-body">
                {notifLoading && <div className="notif-empty">Loading live telemetry...</div>}
                {!notifLoading && notifications.length === 0 && (
                  <div className="notif-empty">No recent activity yet.</div>
                )}
                {!notifLoading && notifications.map((n, i) => (
                  <div className="notif-item" key={i}>
                    <span className={`dot ${n.tone || "blue"}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="icon-btn" onClick={() => setActive("profile")} title="Account settings">
          <Settings size={17} />
        </button>

        <div className="profile-wrap">
          <div className="profile" onClick={() => setMenuOpen((o) => !o)}>
            <div className="avatar">{initials}</div>
            <div className="profile-info">
              <div className="profile-name">{fullName}</div>
              <div className="profile-role">{role}</div>
            </div>
            <ChevronDown size={14} />
          </div>
          {menuOpen && (
            <div className="profile-menu">
              <button onClick={() => { setActive("profile"); setMenuOpen(false); }}>My Profile</button>
              <button onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </div>

      {isBriefingPlaying && (
        <div className="briefing-hud-bar">
          <div className="briefing-hud-left">
            <div className="audio-waves-container">
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
            </div>
            <div className="briefing-hud-text">
              <div className="briefing-title">🎙️ AI Daily Security Briefing (Speaking Aloud)</div>
              <div className="briefing-subtitle">{briefingTranscript}</div>
            </div>
          </div>
          <button className="btn-stop-briefing" onClick={handleToggleBriefing}>
            <Square size={13} fill="#ff4757" /> Stop Briefing
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------------------- Shared bits ---------------------------- */
function StatCard({ icon: Icon, label, value, delta, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {delta && <div className={`stat-delta ${tone}`}>{delta}</div>}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PageIntro({ eyebrow, title, tagline }) {
  return (
    <div className="page-intro">
      {eyebrow && <div className="eyebrow-chip">{eyebrow}</div>}
      <p className="page-tagline">{tagline}</p>
    </div>
  );
}

function TipCallout({ icon: Icon = Lightbulb, title, children }) {
  return (
    <div className="tip-callout">
      <div className="tip-icon"><Icon size={16} /></div>
      <div>
        <div className="tip-title">{title}</div>
        <p>{children}</p>
      </div>
    </div>
  );
}

function VibeLine({ icon: Icon = Sparkles, children }) {
  return (
    <div className="vibe-line">
      <Icon size={14} /> {children}
    </div>
  );
}

function MiniPie({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={3}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PieLegend({ data }) {
  return (
    <ul className="pie-legend">
      {data.map((d, i) => (
        <li key={d.name}>
          <span className="dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
          {d.name} <b>{d.value}%</b>
        </li>
      ))}
    </ul>
  );
}

function OverviewPage() {
  const [plainMode, setPlainMode] = useState(false);
  const fallback = {
    stats: { activeThreats: 24, riskScore: 72, monitoredAssets: 1204, resolvedThisWeek: 86, blockedAttacksToday: 312, avgUptime: 99.98 },
    threatsLast7Days: trendData,
    threatsByCategory: threatCategoryData,
    recentActivity: [
      { text: "Brute-force attempt blocked on 10.0.4.21", time: "2m ago", tone: "pink" },
      { text: "New device fingerprint enrolled for tanya.hill", time: "14m ago", tone: "blue" },
      { text: "Anomalous login location flagged", time: "40m ago", tone: "pink" },
      { text: "Weekly report generated", time: "1h ago", tone: "blue" },
    ],
  };
  const { data, isLive } = useDashboardData("overview", fallback);
  const s = data.stats;

  return (
    <>
      <PageIntro
        eyebrow="COMMAND CENTER"
        tagline="Everything your org needs to know, in one glance — currently vibing more securely than your grandma's pocket where she keeps her actual cash."
      />

      <TipCallout title="New here? Start with this page.">
        This dashboard is your control tower. The cards below update live and roll up
        every module — biometrics, AI detection, risk, monitoring, and reports — into
        one summary. If a number looks scary, click into the matching module on the
        left for the full story instead of panicking. We got you.
        <LiveBadge isLive={isLive} />
      </TipCallout>

      <div className="stat-grid">
        <StatCard icon={AlertTriangle} label="Active Threats" value={s.activeThreats} delta="+3 today" tone="pink" />
        <StatCard icon={ShieldCheck} label="Risk Score" value={`${s.riskScore}/100`} delta="-4 pts" tone="blue" />
        <StatCard icon={Activity} label="Monitored Assets" value={s.monitoredAssets?.toLocaleString()} delta="+18" tone="blue" />
        <StatCard icon={CheckCircle2} label="Resolved This Week" value={s.resolvedThisWeek} delta="+11%" tone="pink" />
        <StatCard icon={Zap} label="Blocked Attacks Today" value={s.blockedAttacksToday} delta="+27" tone="pink" />
        <StatCard icon={Clock} label="Avg Uptime" value={`${s.avgUptime}%`} delta="stable" tone="blue" />
      </div>

      <div className="grid-2">
        <Panel title="Threats Detected (Last 7 Days)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.threatsLast7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#6b7488" fontSize={12} />
              <YAxis stroke="#6b7488" fontSize={12} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="threats" stroke="#ff5fa2" strokeWidth={2.5} dot={{ fill: "#5da9ff", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Threats by Category">
          <div className="pie-row">
            <MiniPie data={data.threatsByCategory} height={180} />
            <PieLegend data={data.threatsByCategory} />
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Network Traffic (Last 24h)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#6b7488" fontSize={11} />
              <YAxis stroke="#6b7488" fontSize={11} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="volume" stroke="#5da9ff" fill="rgba(93,169,255,0.18)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Recent Activity"
          action={
            <button
              className={`eli5-toggle-btn ${plainMode ? "active" : ""}`}
              onClick={() => setPlainMode((p) => !p)}
              title="Toggle Plain English & Real-life Analogies"
            >
              <Brain size={13} />
              <span>{plainMode ? "🧠 Plain Language: ON" : "⚙️ Technical Jargon"}</span>
            </button>
          }
        >
          <ul className="activity-list">
            {data.recentActivity.map((a, i) => {
              const plainInfo = translateToPlainLanguage(a.text);
              return (
                <li key={i} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className={`dot ${a.tone || "blue"}`} />
                      <span style={{ fontWeight: plainMode ? 700 : 500, color: plainMode ? "#fff" : "#cdd4e6" }}>
                        {plainMode ? plainInfo.plainTitle : a.text}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="time">{a.time}</span>
                      <button
                        className="btn-mini-speaker"
                        onClick={() =>
                          speakText(
                            plainMode
                              ? `${plainInfo.plainTitle}. ${plainInfo.analogy}`
                              : a.text
                          )
                        }
                        title="Listen to this alert aloud"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>

                  {plainMode && (
                    <div className="eli5-analogy-box">
                      💡 <b>In Simple Words:</b> {plainInfo.analogy}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Beginner Glossary — decode the jargon">
        <div className="glossary-grid">
          <div><b>Risk Score</b><p>A single number (0–100) estimating how exposed your org is right now. Lower is safer.</p></div>
          <div><b>Anomaly</b><p>Something that doesn't match normal behavior — like logging in from three countries in one hour.</p></div>
          <div><b>Endpoint</b><p>Any device connected to the network: laptops, phones, servers, that suspicious smart fridge.</p></div>
          <div><b>False Positive</b><p>An alert that looked scary but turned out to be totally harmless. It happens, don't panic.</p></div>
        </div>
      </Panel>

      <TipCallout icon={ShieldCheck} title="Real talk: where these numbers actually come from">
        Every stat card, the weekly trend line, and the category chart pull live from
        your MongoDB — every login attempt and every auto-detected threat updates these
        in real time. Network Traffic and Monitored Assets are still placeholder values
        until device-level tracking exists. No smoke, no mirrors — the "SAMPLE DATA"
        badge means exactly that, nothing more.
      </TipCallout>

      <Panel title="Scenario Walkthrough: Someone Tries to Brute-Force In">
        <ul className="timeline-list">
          <li><Lock size={16} /> <div><b>Attempt 1–2</b><span>Wrong password entered. Logged quietly, nothing flagged yet.</span></div></li>
          <li><AlertTriangle size={16} /> <div><b>Attempt 3</b><span>Threshold hit — CyberIntel auto-creates a real "Brute Force" threat.</span></div></li>
          <li><Radar size={16} /> <div><b>Instantly</b><span>That threat appears right here, on the Risk page, and bumps the org risk score.</span></div></li>
          <li><CheckCircle2 size={16} /> <div><b>Resolution</b><span>An admin reviews it, locks the account or confirms it was legit, and closes it out.</span></div></li>
        </ul>
      </Panel>

      <VibeLine icon={Rocket}>
        Real talk: this whole dashboard updates faster than your group chat during finals week.
      </VibeLine>
    </>
  );
}

/* ---------------------------- Biometric page ---------------------------- */
function BiometricPage() {
  const [faceModalMode, setFaceModalMode] = useState(null);
  const [isFaceEnrolled, setIsFaceEnrolled] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceMsg, setFaceMsg] = useState("");

  const token = localStorage.getItem("cyberintel_token") || localStorage.getItem("token");

  useEffect(() => {
    async function checkFaceStatus() {
      try {
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/auth/face/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await res.json();
          setIsFaceEnrolled(!!d.isFaceEnrolled);
        }
      } catch (err) {
        console.error("Face status check error:", err);
      }
    }
    checkFaceStatus();
  }, [token]);

  const handleRemoveFace = async () => {
    if (!window.confirm("Are you sure you want to remove your enrolled face profile?")) return;
    setFaceLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/face/remove`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (res.ok) {
        setIsFaceEnrolled(false);
        setFaceMsg("Enrolled face profile removed.");
        setTimeout(() => setFaceMsg(""), 3000);
      }
    } catch (err) {
      console.error("Remove face error:", err);
    } finally {
      setFaceLoading(false);
    }
  };

  const fallback = {
    enrolledMethods: [
      { method: "Face Recognition", active: true },
      { method: "Fingerprint", active: false },
      { method: "Device Passkey", active: true },
    ],
    successRate: 97,
    usageByMethod: biometricUsageData,
    recentAttempts: [
      { user: "tanya.hill@example.com", method: "Face ID", device: "iPhone 15", result: "Success", time: "2 min ago" },
      { user: "youav@rezonate.io", method: "Fingerprint", device: "Windows Hello", result: "Success", time: "10 min ago" },
      { user: "m.scott@trexony.com", method: "Face ID", device: "Pixel 9", result: "Failed", time: "22 min ago" },
    ],
  };
  const { data, isLive } = useDashboardData("biometric", fallback);
  const methodIcons = [ScanFace, Fingerprint, Smartphone];

  return (
    <>
      <PageIntro
        eyebrow="MODULE 01"
        tagline="Face ID, fingerprints, and passkeys — because typing 'Password123!' for the fifth account in a row was never the vibe."
      />

      {/* Live AI Face Recognition Panel */}
      <Panel title="AI Facial Biometric Security (Live Neural Network)">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: isFaceEnrolled ? "rgba(46, 213, 115, 0.15)" : "rgba(255, 95, 162, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${isFaceEnrolled ? "rgba(46, 213, 115, 0.4)" : "rgba(255, 95, 162, 0.4)"}`,
            }}>
              <ScanFace size={24} color={isFaceEnrolled ? "#2ed573" : "#ff5fa2"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                AI Face ID Profile
                <span className={`tag ${isFaceEnrolled ? "on" : "off"}`}>
                  {isFaceEnrolled ? "Enrolled & Active" : "Not Enrolled"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#9aa4bd", marginTop: 2 }}>
                {isFaceEnrolled
                  ? "128-dimensional biometric embedding active. Enables 1-click zero-email login."
                  : "Scan your face with your webcam to activate instant passwordless login."}
              </div>
              {faceMsg && <div style={{ fontSize: 12, color: "#2ed573", marginTop: 4 }}>{faceMsg}</div>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn-primary sm"
              onClick={() => setFaceModalMode("enroll")}
            >
              <Camera size={14} /> {isFaceEnrolled ? "Re-Enroll Face Scan" : "Enroll Face Scan"}
            </button>
            {isFaceEnrolled && (
              <>
                <button
                  className="btn-outline sm"
                  onClick={() => setFaceModalMode("identify")}
                >
                  <ScanFace size={14} /> Test Live Match
                </button>
                <button
                  className="btn-outline sm"
                  style={{ color: "#ff4757", borderColor: "rgba(255, 71, 87, 0.3)" }}
                  onClick={handleRemoveFace}
                  disabled={faceLoading}
                >
                  Remove Face
                </button>
              </>
            )}
          </div>
        </div>
      </Panel>

      {faceModalMode && (
        <FaceScannerModal
          mode={faceModalMode}
          token={token}
          onSuccess={(res) => {
            if (faceModalMode === "enroll") {
              setIsFaceEnrolled(true);
              setFaceMsg("Face scan enrolled successfully!");
              setTimeout(() => setFaceMsg(""), 4000);
            }
            setFaceModalMode(null);
          }}
          onClose={() => setFaceModalMode(null)}
        />
      )}

      <TipCallout icon={ScanFace} title="What is biometric authentication?">
        Instead of typing a password (which can be guessed, leaked, or written on a
        sticky note), your device checks something unique to you — your face, your
        fingerprint, or a hardware passkey. It's faster, and way harder for an attacker
        to fake.
        <LiveBadge isLive={isLive} />
      </TipCallout>

      <div className="grid-2">
        <Panel title="Enrolled Biometric Methods">
          <div className="method-grid">
            {data.enrolledMethods.map((m, i) => {
              const Icon = methodIcons[i] || ScanFace;
              return (
                <div className="method-card" key={m.method}>
                  <Icon size={22} />
                  <div>{m.method}</div>
                  <span className={`tag ${m.active ? "on" : "off"}`}>{m.active ? "Active" : "Not set"}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Authentication Success Rate">
          <div className="ring-wrap">
            <div className="ring big">
              <div className="ring-inner">
                <div className="ring-num">{data.successRate}%</div>
                <div className="ring-label">Success</div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Logins by Method (This Month)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.usageByMethod}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="method" stroke="#6b7488" fontSize={12} />
              <YAxis stroke="#6b7488" fontSize={12} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="logins" fill="#ff5fa2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Why Biometrics Matter">
          <ul className="cat-list">
            <li><span className="dot blue" />Can't be phished like a password</li>
            <li><span className="dot pink" />Nothing to forget or write down</li>
            <li><span className="dot blue" />Sign-in takes under 2 seconds</li>
            <li><span className="dot pink" />Pairs with device-level encryption</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Recent Biometric Login Attempts">
        <table className="data-table">
          <thead><tr><th>User</th><th>Method</th><th>Device</th><th>Result</th><th>Time</th></tr></thead>
          <tbody>
            {data.recentAttempts.map((a, i) => (
              <tr key={i}>
                <td>{a.user}</td>
                <td>{a.method}</td>
                <td>{a.device}</td>
                <td><span className={`status-pill ${a.result === "Success" ? "ok" : "bad"}`}>{a.result}</span></td>
                <td className="muted">{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Learn More — Biometric Security">
        <div className="resource-list">
          <a href="https://webauthn.guide/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Fingerprint size={16} />
            <div><b>WebAuthn Guide</b><span>How real passwordless biometric login actually works</span></div>
          </a>
          <a href="https://www.w3.org/TR/webauthn-2/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <ShieldCheck size={16} />
            <div><b>W3C WebAuthn Specification</b><span>The official web standard behind Face ID / fingerprint login on the web</span></div>
          </a>
        </div>
      </Panel>

      <Panel title="Quick Facts — Biometric Auth">
        <div className="mini-module-grid">
          <div className="mini-module"><Fingerprint size={18} /> No two fingerprints are truly identical — even twins differ</div>
          <div className="mini-module"><ScanFace size={18} /> Face ID checks 30,000+ infrared points on your face</div>
          <div className="mini-module"><Lock size={18} /> Biometric data never leaves your device in WebAuthn</div>
        </div>
      </Panel>

      <VibeLine icon={Sparkles}>
        Passwords: "iloveyou123". Your face: never been cracked once. We rest our case.
      </VibeLine>

      <TipCallout icon={Fingerprint} title="Real talk: what's live here vs. what's next">
        Enrollment status and attempt history on this page are still sample data —
        real biometric tracking needs WebAuthn wired in, which logs actual Face ID /
        fingerprint attempts per user. Once that lands, this page flips to genuinely
        live data exactly like the Dashboard and Risk pages already have.
      </TipCallout>

      <Panel title="Why Your Face Beats Your Password">
        <ul className="timeline-list">
          <li><Skull size={16} /> <div><b>The old way</b><span>"Password123!" reused across 6 accounts, written on a sticky note, phished in 2019.</span></div></li>
          <li><ScanFace size={16} /> <div><b>The new way</b><span>Your device checks your face locally — nothing biometric ever leaves your phone.</span></div></li>
          <li><Lock size={16} /> <div><b>The result</b><span>Nothing to leak in a breach, nothing to forget, nothing to phish.</span></div></li>
        </ul>
      </Panel>

      <VibeLine icon={Ghost}>
        Fun fact: your face is the one password no data breach has ever leaked. Keep it that way.
      </VibeLine>
    </>
  );
}

/* ---------------------------- AI Threat Detection page ---------------------------- */
function AiThreatPage() {
  const fallback = {
    modelsRunning: ["Anomaly Detection Model", "Behavioral Baseline Engine", "Network Traffic Classifier", "Insider Threat Watcher"],
    detectionsToday: { high: 6, medium: 14, falsePositivesFiltered: 41, autoResolved: 9 },
    anomalyTypes: anomalyTypeData,
    liveFeed: [
      { name: "Unusual outbound traffic spike", confidence: 91 },
      { name: "Credential stuffing pattern detected", confidence: 84 },
      { name: "Privilege escalation attempt", confidence: 76 },
      { name: "Off-hours admin access", confidence: 63 },
    ],
  };
  const { data, isLive } = useDashboardData("ai-threat", fallback);
  const modelIcons = [Cpu, Radar, Activity, Eye];
  const d = data.detectionsToday;

  return (
    <>
      <PageIntro
        eyebrow="MODULE 02"
        tagline="Our AI doesn't sleep, doesn't blink, and definitely doesn't take a coffee break — unlike your night-shift security guard."
      />

      <TipCallout icon={Cpu} title="What's a 'confidence score'?">
        When our models flag something, they also say how sure they are. 90%+ means
        "drop what you're doing." Under 60% usually means "worth a glance, probably fine."
        Think of it like a weather forecast, but for hackers instead of rain.
        <LiveBadge isLive={isLive} />
      </TipCallout>

      <div className="grid-2">
        <Panel title="Model Status">
          <div className="model-status">
            {data.modelsRunning.map((name, i) => {
              const Icon = modelIcons[i] || Cpu;
              return (
                <div className="model-row" key={name}>
                  <Icon size={16} /> {name} <span className="tag on">Running</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Detections Today">
          <div className="stat-grid single-row">
            <StatCard icon={AlertTriangle} label="High Confidence" value={d.high} tone="pink" />
            <StatCard icon={Activity} label="Medium Confidence" value={d.medium} tone="blue" />
          </div>
          <div className="stat-grid single-row" style={{ marginTop: 12 }}>
            <StatCard icon={CheckCircle2} label="False Positives Filtered" value={d.falsePositivesFiltered} tone="blue" />
            <StatCard icon={Zap} label="Auto-Resolved" value={d.autoResolved} tone="pink" />
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Anomaly Types (This Week)">
          <div className="pie-row">
            <MiniPie data={data.anomalyTypes} height={180} />
            <PieLegend data={data.anomalyTypes} />
          </div>
        </Panel>

        <Panel title="How AI Threat Detection Works">
          <ul className="cat-list">
            <li><span className="dot blue" />1. Learns what "normal" looks like for your org</li>
            <li><span className="dot pink" />2. Flags anything that deviates from that baseline</li>
            <li><span className="dot blue" />3. Scores it by confidence and severity</li>
            <li><span className="dot pink" />4. Routes high-confidence alerts to your team instantly</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Live Anomaly Feed">
        <ul className="anomaly-list">
          {data.liveFeed.map((a, i) => (
            <li key={i}>
              <div className="anomaly-name">{a.name}</div>
              <div className="risk-bar wide">
                <div className="risk-fill" style={{ width: `${a.confidence}%` }} />
              </div>
              <span className="anomaly-score">{a.confidence}%</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Learn More — Threat Detection">
        <div className="resource-list">
          <a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Radar size={16} />
            <div><b>MITRE ATT&CK Framework</b><span>Real-world adversary tactics and techniques, used industry-wide</span></div>
          </a>
          <a href="https://www.kaggle.com/datasets?search=cybersecurity+anomaly" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Cpu size={16} />
            <div><b>Anomaly Detection Datasets</b><span>Public datasets used to train real intrusion-detection models</span></div>
          </a>
        </div>
      </Panel>

      <Panel title="Quick Facts — AI Threat Detection">
        <div className="mini-module-grid">
          <div className="mini-module"><Cpu size={18} /> Models re-score every session in milliseconds</div>
          <div className="mini-module"><Radar size={18} /> Baselines update continuously as behavior evolves</div>
          <div className="mini-module"><Eye size={18} /> Insider threats are statistically harder to catch than outsiders</div>
        </div>
      </Panel>

      <VibeLine icon={Zap}>
        Plot twist: most breaches aren't Hollywood hackers. They're one tired employee clicking "Enable Macros."
      </VibeLine>

      <TipCallout icon={Cpu} title="Real talk: AI vs. reality">
        Detections and the live feed above are pulled from your real Threat
        collection — the same threats generated from brute-force attempts,
        role-mismatch logins, and malicious URL scans elsewhere in the app.
        "Model Status" is illustrative — right now it's fast rule-based detection,
        not literal neural networks, doing the same job a model eventually would.
      </TipCallout>

      <Panel title="Rule-Based Today, ML-Powered Tomorrow">
        <ul className="timeline-list">
          <li><Radar size={16} /> <div><b>Today</b><span>Clear thresholds — 3 failed logins, a wrong role, a bad URL — trigger a real threat.</span></div></li>
          <li><Cpu size={16} /> <div><b>Next</b><span>Swap thresholds for a trained model that learns your org's normal behavior.</span></div></li>
          <li><Sparkles size={16} /> <div><b>Later</b><span>The AI assistant reads this same data to explain alerts in plain English — Phase 2 of the roadmap.</span></div></li>
        </ul>
      </Panel>

      <VibeLine icon={Skull}>
        TL;DR: if a hacker tries something sketchy, our AI notices before your coffee gets cold.
      </VibeLine>
    </>
  );
}

/* ---------------------------- Risk / Threat Intel page ---------------------------- */
function RiskPage() {
  const fallback = {
    orgRiskScore: 72,
    topCategories: [
      { name: "Exposed credentials", count: 18 }, { name: "Unpatched services", count: 12 },
      { name: "Misconfigured access", count: 9 }, { name: "Third-party risk", count: 6 },
      { name: "Weak password policies", count: 5 }, { name: "Unmonitored shadow IT", count: 4 },
    ],
    riskByDept: riskByDeptData,
    globalIntelFeed: [
      { text: "New CVE affecting exposed VPN endpoints", time: "18m ago" },
      { text: "Threat actor group activity increased in APAC region", time: "1h ago" },
      { text: "Phishing campaign impersonating internal IT detected", time: "3h ago" },
    ],
  };
  const { data, isLive } = useDashboardData("risk", fallback);

  return (
    <>
      <PageIntro
        eyebrow="MODULE 03"
        tagline="Risk score: basically a credit score, except instead of buying a house you're avoiding getting hacked."
      />

      <TipCallout icon={Radar} title="What is a risk score, really?">
        We look at exposed credentials, outdated software, misconfigured permissions,
        and recent anomalies, then boil it down into one number from 0–100. Under 40 is
        chill. Over 70 means someone should probably look at this today, not next sprint.
        <LiveBadge isLive={isLive} />
      </TipCallout>

      <div className="grid-2">
        <Panel title="Organization Risk Score">
          <div className="ring-wrap">
            <div className="ring big danger">
              <div className="ring-inner">
                <div className="ring-num">{data.orgRiskScore}</div>
                <div className="ring-label">of 100</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Top Risk Categories">
          <ul className="cat-list">
            {data.topCategories.map((c, i) => (
              <li key={c.name}><span className={`dot ${i % 2 === 0 ? "pink" : "blue"}`} />{c.name} <b>{c.count}</b></li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Risk Score by Department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.riskByDept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#6b7488" fontSize={12} domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" stroke="#6b7488" fontSize={12} width={80} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="risk" fill="#5da9ff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Global Threat Intelligence Feed">
          <ul className="activity-list">
            {data.globalIntelFeed.map((f, i) => (
              <li key={i}><span className={`dot ${i % 2 === 0 ? "pink" : "blue"}`} /> {f.text} <span className="time">{f.time}</span></li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Learn More — Risk & Threat Intelligence">
        <div className="resource-list">
          <a href="https://www.nist.gov/cyberframework" target="_blank" rel="noopener noreferrer" className="resource-link">
            <BarChart3 size={16} />
            <div><b>NIST Cybersecurity Framework</b><span>Industry-standard model for identifying and managing risk</span></div>
          </a>
          <a href="https://cve.mitre.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <AlertTriangle size={16} />
            <div><b>CVE Database</b><span>The public catalog of known vulnerabilities referenced industry-wide</span></div>
          </a>
        </div>
      </Panel>

      <Panel title="Quick Facts — Risk & Intelligence">
        <div className="mini-module-grid">
          <div className="mini-module"><Radar size={18} /> A risk score is a snapshot, not a permanent grade — it moves daily</div>
          <div className="mini-module"><AlertTriangle size={18} /> Most breaches trace back to reused passwords</div>
          <div className="mini-module"><ShieldCheck size={18} /> Patch cycles under 30 days cut exposure dramatically</div>
        </div>
      </Panel>

      <VibeLine icon={Skull}>
        A 72 risk score isn't "we're doomed." It's "someone should open a ticket before lunch."
      </VibeLine>

      <TipCallout icon={Radar} title="Real talk: how the score is actually calculated">
        The org risk score is computed fresh on every single request — open threats
        weighted by severity, plus how much of the last 7 days' logins failed. Top
        Risk Categories are real counts by threat type. Risk by Department is still
        sample — it'd need a "department" field on accounts to be genuinely tracked.
      </TipCallout>

      <Panel title="Reading the Score Like a Pro">
        <ul className="timeline-list">
          <li><CheckCircle2 size={16} /> <div><b>0–39</b><span>Chill. Routine housekeeping, nothing urgent.</span></div></li>
          <li><AlertTriangle size={16} /> <div><b>40–69</b><span>Worth a look this week — not a fire drill, but don't ignore it either.</span></div></li>
          <li><Flag size={16} /> <div><b>70–100</b><span>Someone should be looking at this today, not "eventually."</span></div></li>
        </ul>
      </Panel>

      <VibeLine icon={Flag}>
        Finance's risk score is giving "left the front door unlocked" energy. Someone loop them in.
      </VibeLine>
    </>
  );
}

/* ---------------------------- Real-Time Monitoring page ---------------------------- */
function MonitoringPage() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 1200);
    return () => clearInterval(t);
  }, []);

  const fallback = {
    stats: { liveConnections: 3842, endpointsOnline: 1190, endpointsTotal: 1204, alertsLastHour: 7, avgResponseTime: 1.4 },
    connectionsLastHour: connectionsData,
    activeAlerts: [
      { text: "Endpoint WKSTN-042 disconnected unexpectedly", time: "now" },
      { text: "Firewall rule triggered on 10.0.2.8", time: "3m ago" },
      { text: "Scheduled scan completed on all servers", time: "12m ago" },
    ],
  };
  const { data, isLive } = useDashboardData("monitoring", fallback);
  const s = data.stats;

  return (
    <>
      <PageIntro
        eyebrow="MODULE 04"
        tagline="Faster reflexes than your WiFi at 2am — watching every connection, endpoint, and packet in real time."
      />

      <TipCallout icon={Activity} title="What am I looking at here?">
        This page is the live pulse of your entire network. "Endpoints" are devices,
        "connections" are active sessions, and the bar animation below is a (simulated)
        heartbeat of overall traffic. If it flatlines, something's wrong. If it's just
        moving, you're good.
        <LiveBadge isLive={isLive} />
      </TipCallout>

      <div className="stat-grid">
        <StatCard icon={Wifi} label="Live Connections" value={s.liveConnections?.toLocaleString()} tone="blue" />
        <StatCard icon={Monitor} label="Endpoints Online" value={`${s.endpointsOnline} / ${s.endpointsTotal}`} tone="blue" />
        <StatCard icon={AlertTriangle} label="Alerts Last Hour" value={s.alertsLastHour} tone="pink" />
        <StatCard icon={Activity} label="Avg Response Time" value={`${s.avgResponseTime}s`} tone="pink" />
        <StatCard icon={TrendingUp} label="Bandwidth Usage" value="68%" tone="blue" />
        <StatCard icon={Globe} label="Regions Monitored" value="14" tone="pink" />
      </div>

      <div className="grid-2">
        <Panel title="Connections (Last Hour)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.connectionsLastHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#6b7488" fontSize={12} />
              <YAxis stroke="#6b7488" fontSize={12} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="connections" stroke="#ff5fa2" fill="rgba(255,95,162,0.18)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title={`Live System Pulse ${pulse % 2 === 0 ? "\u25CF" : "\u25CB"}`}>
          <div className="pulse-bars">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="pulse-bar"
                style={{ height: `${20 + ((i * 13 + pulse * 7) % 60)}px` }}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Active Alerts">
        <ul className="activity-list">
          {data.activeAlerts.map((a, i) => (
            <li key={i}><span className={`dot ${i % 2 === 0 ? "pink" : "blue"}`} /> {a.text} <span className="time">{a.time}</span></li>
          ))}
        </ul>
      </Panel>

      <Panel title="Learn More — Network Monitoring">
        <div className="resource-list">
          <a href="https://www.cisa.gov/topics/cybersecurity-best-practices" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Activity size={16} />
            <div><b>CISA Best Practices</b><span>Guidance on continuous monitoring for organizations</span></div>
          </a>
          <a href="https://www.wireshark.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Globe size={16} />
            <div><b>Wireshark</b><span>The real-world tool most SOC teams use for live traffic analysis</span></div>
          </a>
        </div>
      </Panel>

      <Panel title="Quick Facts — Real-Time Monitoring">
        <div className="mini-module-grid">
          <div className="mini-module"><Activity size={18} /> SOC teams watch traffic patterns, not just individual packets</div>
          <div className="mini-module"><Wifi size={18} /> A sudden traffic spike is often the first sign of trouble</div>
          <div className="mini-module"><Globe size={18} /> Global monitoring means someone's always technically "on shift"</div>
        </div>
      </Panel>

      <VibeLine icon={Rocket}>
        This page never sleeps. Unlike whoever's supposed to be watching it at 3am.
      </VibeLine>

      <TipCallout icon={Activity} title="Real talk: what's actually live">
        "Alerts Last Hour" and the active alerts list are real, pulled straight from
        threats created in the last hour. Live Connections, Endpoints Online, and
        Bandwidth Usage are still sample values — those need real device/session
        tracking, a natural next step as this grows past a student project.
      </TipCallout>

      <Panel title="Why 'Real-Time' Actually Matters">
        <ul className="timeline-list">
          <li><Zap size={16} /> <div><b>The gap</b><span>Most breaches aren't caught in the moment — they're found weeks later in an audit.</span></div></li>
          <li><Eye size={16} /> <div><b>The fix</b><span>Live monitoring shrinks "weeks later" down to "this hour."</span></div></li>
          <li><Rocket size={16} /> <div><b>The payoff</b><span>Faster detection means faster response, means less damage done.</span></div></li>
        </ul>
      </Panel>

      <VibeLine icon={Zap}>
        1.4 second response time. Your microwave takes longer to reheat leftovers.
      </VibeLine>
    </>
  );
}

/* ---------------------------- Reports page ---------------------------- */
function downloadCsv(filename, headers, rows) {
  const csvLines = [headers.join(",")];
  rows.forEach((row) => {
    csvLines.push(headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","));
  });
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const fallback = {
    incidentsByMonth: reportData,
    incidentTypes: incidentTypeData,
    downloadableReports: [
      { name: "Monthly Security Summary — June", size: "2.4 MB" },
      { name: "Incident Response Log — Q2", size: "1.1 MB" },
      { name: "Vulnerability Assessment Report", size: "3.8 MB" },
      { name: "Biometric Access Audit — Q2", size: "0.9 MB" },
      { name: "Executive Risk Briefing — July", size: "1.6 MB" },
    ],
  };
  const { data, isLive } = useDashboardData("reports", fallback);

  const exportIncidentsCsv = () => {
    downloadCsv("cyberintel-incidents-by-month.csv", ["month", "incidents"], data.incidentsByMonth);
  };
  const exportTypesCsv = () => {
    downloadCsv("cyberintel-incident-types.csv", ["name", "value"], data.incidentTypes);
  };

  return (
    <>
      <PageIntro
        eyebrow="MODULE 05"
        tagline="Reports so clean your professor might actually believe you built this whole platform in a weekend. (We won't tell.)"
      />

      <TipCallout icon={BarChart3} title="How to actually read these reports">
        Start with the chart — it tells you the trend. Then check the downloadable
        list below for the full detail if something needs a deeper look or you need
        proof for a submission, audit, or that one professor who wants receipts.
        <LiveBadge isLive={isLive} />
      </TipCallout>

      <div className="grid-2">
        <Panel
          title="Incidents by Month"
          action={<button className="icon-btn" title="Export as CSV" onClick={exportIncidentsCsv}><Download size={15} /></button>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.incidentsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#6b7488" fontSize={12} />
              <YAxis stroke="#6b7488" fontSize={12} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="incidents" fill="#5da9ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="Incident Types Breakdown"
          action={<button className="icon-btn" title="Export as CSV" onClick={exportTypesCsv}><Download size={15} /></button>}
        >
          <div className="pie-row">
            <MiniPie data={data.incidentTypes} height={180} />
            <PieLegend data={data.incidentTypes} />
          </div>
        </Panel>
      </div>

      <Panel title="Downloadable Reports">
        <button
          className="btn-outline active"
          style={{ marginBottom: 14, padding: "10px 20px", width: "fit-content" }}
          onClick={async () => {
            const token = localStorage.getItem("cyberintel_token");
            const res = await fetch(`${API_BASE_URL}/api/reports/download-pdf`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "cyberintel-security-report.pdf";
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={15} style={{ marginRight: 6 }} /> Download Real Report (PDF)
        </button>
        <ul className="report-list">
          {data.downloadableReports.map((r, i) => (
            <li key={i}>
              <div>
                <div className="report-name">{r.name}</div>
                <div className="muted small">{r.size} · PDF</div>
              </div>
              <button className="icon-btn"><Download size={16} /></button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Learn More — Security Reporting">
        <div className="resource-list">
          <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <ShieldCheck size={16} />
            <div><b>OWASP Top 10</b><span>The most commonly reported categories of security risk</span></div>
          </a>
          <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Search size={16} />
            <div><b>Have I Been Pwned</b><span>Check real breach exposure — the inspiration for our reporting module</span></div>
          </a>
        </div>
      </Panel>

      <Panel title="Quick Facts — Reporting">
        <div className="mini-module-grid">
          <div className="mini-module"><BarChart3 size={18} /> Good reports answer "so what?" not just "what happened"</div>
          <div className="mini-module"><Download size={18} /> Exportable logs matter for real audits and compliance</div>
          <div className="mini-module"><Clock size={18} /> Trends over months matter more than any single spike</div>
        </div>
      </Panel>

      <VibeLine icon={TrendingUp}>
        Charts don't lie, but they will make you look way more organized than you actually are.
      </VibeLine>

      <TipCallout icon={BarChart3} title="Real talk: what's in these charts">
        Incidents by Month and the type breakdown are calculated from your real
        Threat records over the last 6 months — genuinely aggregated, not typed in
        by hand. The downloadable report files are still placeholders; real PDF
        generation is next on the roadmap.
      </TipCallout>

      <Panel title="Why Reports Matter More Than Dashboards">
        <ul className="timeline-list">
          <li><Eye size={16} /> <div><b>Dashboards</b><span>Great for "what's happening right now."</span></div></li>
          <li><TrendingUp size={16} /> <div><b>Reports</b><span>Great for "is this getting better or worse over time" — the question that actually matters.</span></div></li>
          <li><Download size={16} /> <div><b>Exports</b><span>Turn a screen into proof — for audits, professors, or your own peace of mind.</span></div></li>
        </ul>
      </Panel>

      <VibeLine icon={PartyPopper}>
        Somewhere, a professor is about to be very impressed. You're welcome.
      </VibeLine>
    </>
  );
}

/* ---------------------------- Static info pages ---------------------------- */
function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="THE PROJECT"
        tagline="A final-year cybersecurity major project — built to prove that enterprise-grade security tooling can be genuinely usable, not just technically impressive."
      />

      <Panel title="What is CyberIntel?">
        <p className="info-body">
          CyberIntel is a unified cybersecurity intelligence platform combining
          biometric authentication, AI-driven threat detection, real-time monitoring,
          and risk analysis into a single console. It was designed and built as a
          final-year major project by three Cybersecurity undergraduate students,
          with the goal of demonstrating a realistic, end-to-end security product —
          not a mockup, but a working system with a real backend, real authentication,
          and a real AI assistant layered on top.
        </p>
      </Panel>

      <Panel title="Why We Built This">
        <ul className="cat-list">
          <li><span className="dot blue" />Most academic security projects stop at a login page — we wanted a full working platform</li>
          <li><span className="dot pink" />To apply full-stack architecture end-to-end: frontend, backend, authentication, AI</li>
          <li><span className="dot blue" />To demonstrate that strong security doesn't have to mean poor usability</li>
          <li><span className="dot pink" />To build something genuinely presentable for placements and portfolios, not just a submission</li>
        </ul>
      </Panel>

      <Panel title="Core Modules">
        <div className="mini-module-grid">
          <div className="mini-module"><ScanFace size={18} /> Biometric Authentication</div>
          <div className="mini-module"><Cpu size={18} /> AI-Based Threat Detection</div>
          <div className="mini-module"><Radar size={18} /> Threat Intelligence & Risk</div>
          <div className="mini-module"><Activity size={18} /> Real-Time Monitoring</div>
          <div className="mini-module"><BarChart3 size={18} /> Security Dashboard & Reports</div>
        </div>
      </Panel>

      <Panel title="Tech Stack">
        <div className="mini-module-grid">
          <div className="mini-module"><Code2 size={18} /> React + Vite (Frontend)</div>
          <div className="mini-module"><Code2 size={18} /> Node.js + Express (Backend)</div>
          <div className="mini-module"><Code2 size={18} /> MongoDB Atlas (Database)</div>
          <div className="mini-module"><Lock size={18} /> JWT + OTP + bcrypt (Auth)</div>
          <div className="mini-module"><Fingerprint size={18} /> WebAuthn (Biometric Login)</div>
          <div className="mini-module"><Sparkles size={18} /> Gemini API (AI Assistant)</div>
        </div>
      </Panel>

      <Panel title="Project Timeline">
        <ul className="timeline-list">
          <li><Puzzle size={16} /> <div><b>Research & Planning</b><span>Scoping the 5 modules and studying real-world security dashboards</span></div></li>
          <li><Code2 size={16} /> <div><b>Frontend Build</b><span>Landing page, authentication flow, dashboard shell, AI widget</span></div></li>
          <li><Lock size={16} /> <div><b>Backend & Authentication</b><span>REST APIs, MongoDB, JWT, email OTP verification</span></div></li>
          <li><Sparkles size={16} /> <div><b>AI Integration</b><span>Connecting the assistant to real application data</span></div></li>
          <li><Rocket size={16} /> <div><b>Testing & Final Presentation</b><span>End-to-end testing and project defense</span></div></li>
        </ul>
      </Panel>

      <Panel title="Learn More — External Resources">
        <p className="info-body" style={{ marginBottom: 14 }}>
          CyberIntel's design draws on real, publicly available cybersecurity frameworks.
          These are genuinely useful if you want to understand the concepts behind this project:
        </p>
        <div className="resource-list">
          <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <ShieldCheck size={16} />
            <div><b>OWASP Top 10</b><span>The most critical web application security risks</span></div>
          </a>
          <a href="https://www.nist.gov/cyberframework" target="_blank" rel="noopener noreferrer" className="resource-link">
            <BarChart3 size={16} />
            <div><b>NIST Cybersecurity Framework</b><span>Industry-standard framework for managing security risk</span></div>
          </a>
          <a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Radar size={16} />
            <div><b>MITRE ATT&CK</b><span>A global knowledge base of real attacker tactics and techniques</span></div>
          </a>
          <a href="https://www.cisa.gov/topics/cybersecurity-best-practices" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Info size={16} />
            <div><b>CISA Best Practices</b><span>U.S. government cybersecurity guidance for organizations</span></div>
          </a>
          <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <AlertTriangle size={16} />
            <div><b>Have I Been Pwned</b><span>Check if your email has appeared in a known data breach</span></div>
          </a>
          <a href="https://webauthn.guide/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Fingerprint size={16} />
            <div><b>WebAuthn Guide</b><span>How real biometric web authentication works under the hood</span></div>
          </a>
        </div>
      </Panel>
    </>
  );
}

function UsersPage() {
  return (
    <>
      <PageIntro
        eyebrow="WHO'S IN HERE"
        tagline="Every account type is scoped to what that person actually needs to see and do."
      />

      <Panel title="Who Uses CyberIntel">
        <p className="info-body">
          Security admins monitor org-wide risk and manage access. Analysts investigate
          flagged anomalies and threat intel. Individual users manage their own
          biometric credentials, review their login history, and respond to alerts on
          their own accounts. Everyone gets the same clean dashboard — just scoped to
          what they actually need to see. Roles are enforced on the backend, not just
          hidden in the UI, so access is genuinely restricted, not just visually.
        </p>
      </Panel>

      <div className="grid-2">
        <Panel title="Security Admin">
          <div className="persona-card">
            <UserCog size={22} />
            <p>Full visibility across every module. Can promote other accounts to
            Admin or Hacker roles, reviews org-wide risk score, manages access.</p>
          </div>
        </Panel>
        <Panel title="Security Analyst">
          <div className="persona-card">
            <Radar size={22} />
            <p>Lives in the AI Threat Detection and Risk pages. Investigates anomalies,
            triages alerts, writes up incident notes.</p>
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Individual User">
          <div className="persona-card">
            <ScanFace size={22} />
            <p>Manages their own Face ID / fingerprint enrollment, checks their login
            history, and gets notified if something looks off with their account. The
            default role for every new signup.</p>
          </div>
        </Panel>
        <Panel title="Ethical Hacker / Red Team">
          <div className="persona-card">
            <Ghost size={22} />
            <p>Uses the "Hacker Login" path to stress-test the platform, hunting for
            gaps before real attackers do. Granted only by an existing admin.</p>
          </div>
        </Panel>
      </div>

      <Panel title="A Day in the Life">
        <p className="info-body">
          8:45 AM — an analyst gets pinged about an impossible-travel login. 9:02 AM —
          they check the AI Threat page, confidence score reads 88%. 9:05 AM — they lock
          the account and message the user. 9:10 AM — turns out it was just someone on a
          VPN. False alarm, logged, dashboard updated. That's the whole loop.
        </p>
      </Panel>

      <Panel title="Learn More — Identity & Access Resources">
        <div className="resource-list">
          <a href="https://en.wikipedia.org/wiki/Role-based_access_control" target="_blank" rel="noopener noreferrer" className="resource-link">
            <UserCog size={16} />
            <div><b>Role-Based Access Control (RBAC)</b><span>The access model CyberIntel's roles are based on</span></div>
          </a>
          <a href="https://www.cisa.gov/resources-tools/resources/zero-trust-maturity-model" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Lock size={16} />
            <div><b>Zero Trust Maturity Model</b><span>CISA's guide to "never trust, always verify" security</span></div>
          </a>
        </div>
      </Panel>

      <VibeLine icon={HeartHandshake}>
        No matter your role, we made sure nobody needs a manual just to find the logout button.
      </VibeLine>
    </>
  );
}

function BuildersPage() {
  return (
    <>
      <PageIntro
        eyebrow="BEHIND THE SCENES"
        tagline="Three Cybersecurity students, one final-year major project, and a lot of debugging."
      />

      <Panel title="Built By">
        <p className="info-body">
          CyberIntel is the final-year major project of three Cybersecurity
          undergraduate students, built end to end — from architecture and
          authentication systems to AI-assisted threat analysis and the interface
          itself.
        </p>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">AN</div>
            <div><b>Aliya Nishath</b><span>Cybersecurity Student</span></div>
          </div>
          <div className="team-card">
            <div className="team-avatar">V</div>
            <div><b>Varshini</b><span>Cybersecurity Student</span></div>
          </div>
          <div className="team-card">
            <div className="team-avatar">A</div>
            <div><b>Ashraf</b><span>Cybersecurity Student</span></div>
          </div>
        </div>
      </Panel>

      <Panel title="Skills Exercised">
        <div className="mini-module-grid">
          <div className="mini-module"><Code2 size={18} /> Frontend Architecture</div>
          <div className="mini-module"><Lock size={18} /> Authentication & Security</div>
          <div className="mini-module"><Sparkles size={18} /> AI Integration</div>
          <div className="mini-module"><BarChart3 size={18} /> Data Visualization</div>
          <div className="mini-module"><Briefcase size={18} /> Project Planning</div>
          <div className="mini-module"><ShieldCheck size={18} /> Applied Cybersecurity Concepts</div>
        </div>
      </Panel>

      <Panel title="The Build Journey">
        <ul className="cat-list">
          <li><span className="dot blue" />Started with a name, a color palette, and a clear 5-module scope</li>
          <li><span className="dot pink" />Iterated on the sidebar and auth flow until it felt production-ready</li>
          <li><span className="dot blue" />Learned that "final" folder structures are rarely actually final</li>
          <li><span className="dot pink" />Connected a real backend, real database, and real AI — not mockups</li>
        </ul>
      </Panel>

      <Panel title="Acknowledgments">
        <p className="info-body">
          Thanks to our project guide and mentors for their direction throughout, and
          to the open-source cybersecurity community whose documentation — OWASP,
          MITRE, and NIST among others — shaped how we approached this project.
        </p>
      </Panel>

      <VibeLine icon={GraduationCap}>
        Three students, one dashboard, zero passwords stored in plain text.
      </VibeLine>
    </>
  );
}

function GoalPage() {
  return (
    <>
      <PageIntro
        eyebrow="THE MISSION"
        tagline="Making enterprise-grade cybersecurity concepts approachable, demonstrable, and genuinely functional."
      />

      <Panel title="Our Mission">
        <p className="info-body">
          To prove that enterprise-grade security concepts — biometric authentication,
          live threat detection, risk scoring — can be packaged into a single,
          approachable dashboard, without needing a dozen disconnected tools to get a
          clear security picture. This project is our way of demonstrating applied
          cybersecurity knowledge through a real, working system rather than a
          purely theoretical submission.
        </p>
      </Panel>

      <Panel title="The Problem We're Solving">
        <p className="info-body">
          Most security tools are either powerful but painful to use, or simple but
          shallow. Teams end up juggling several disconnected logins just to answer
          one question: "are we okay right now?" CyberIntel is our attempt to answer
          that in one glance, while still reflecting real security engineering
          practices underneath.
        </p>
      </Panel>

      <Panel title="Objectives">
        <ul className="cat-list">
          <li><span className="dot blue" />Unify authentication, detection, and reporting in one place</li>
          <li><span className="dot pink" />Make security data readable by non-experts, not just analysts</li>
          <li><span className="dot blue" />Demonstrate real AI-assisted triage grounded in actual application data</li>
          <li><span className="dot pink" />Implement genuine biometric authentication via WebAuthn, not a simulation</li>
          <li><span className="dot blue" />Ship something that works end-to-end, suitable for both academic evaluation and a portfolio</li>
        </ul>
      </Panel>

      <Panel title="What Success Looks Like">
        <div className="mini-module-grid">
          <div className="mini-module"><MapPin size={18} /> A clear, working live demo</div>
          <div className="mini-module"><Target size={18} /> All 5 modules connected to real data</div>
          <div className="mini-module"><Sparkles size={18} /> AI assistant answering with real application context</div>
          <div className="mini-module"><TrendingUp size={18} /> A project worth showing in interviews</div>
        </div>
      </Panel>

      <Panel title="What's Next">
        <p className="info-body">
          Real threat and login data models, a calculated (not hardcoded) risk score,
          an AI assistant grounded in real user data, and WebAuthn-based biometric
          login. The frontend and core backend were phase one — this is where it
          becomes a genuinely intelligent system.
        </p>
      </Panel>

      <VibeLine icon={Target}>
        Goal: fewer breaches, fewer headaches, and a dashboard people actually want to open.
      </VibeLine>
    </>
  );
}

/* ---------------------------- Profile page ---------------------------- */
function ProfilePage() {
  const navigate = useNavigate();
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem("cyberintel_user")) || {};
    } catch {
      return {};
    }
  })();

  const [fullName, setFullName] = useState(stored.fullName || "");
  const [phone, setPhone] = useState(stored.phone || "");
  const [status, setStatus] = useState(null); // { type: 'ok' | 'err', text }
  const [saving, setSaving] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null); // real data from /api/auth/me

  useEffect(() => {
    const token = localStorage.getItem("cyberintel_token");
    if (!token) return;
    fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAccountInfo(data.user || null))
      .catch(() => setAccountInfo(null));
  }, []);

  const initials = (fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("cyberintel_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const updatedUser = { ...stored, fullName: data.user.fullName, phone: data.user.phone };
      localStorage.setItem("cyberintel_user", JSON.stringify(updatedUser));
      setStatus({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setStatus({ type: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const [biometricStatus, setBiometricStatus] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  const handleEnrollBiometric = async () => {
    setEnrolling(true);
    setBiometricStatus(null);
    try {
      const token = localStorage.getItem("cyberintel_token");
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const optionsRes = await fetch(`${API_BASE_URL}/api/webauthn/register-options`, {
        headers: authHeader,
      });
      const options = await optionsRes.json();
      if (!optionsRes.ok) throw new Error(options.message || "Could not start enrollment");

      // Real browser/OS prompt — Face ID, Touch ID, Windows Hello
      const regResponse = await startRegistration(options);

      const verifyRes = await fetch(`${API_BASE_URL}/api/webauthn/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ response: regResponse }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.message || "Enrollment failed");

      setBiometricStatus({ type: "ok", text: "Biometric login enrolled — try it next time you log in." });
      setAccountInfo((a) => ({ ...a, webauthn: { credentialID: "enrolled" } }));
    } catch (err) {
      setBiometricStatus({
        type: "err",
        text: err.message?.includes("NotAllowedError") ? "Enrollment was cancelled" : err.message,
      });
    } finally {
      setEnrolling(false);
    }
  };

  const joinedDate = accountInfo?.createdAt
    ? new Date(accountInfo.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <>
      <PageIntro
        eyebrow="ACCOUNT"
        tagline="Update the details tied to your CyberIntel account."
      />

      <div className="grid-2">
        <Panel title="Profile">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div className="team-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{stored.fullName || "Your account"}</div>
              <div className="muted small">{stored.email}</div>
              <span className="tag on" style={{ marginTop: 6, display: "inline-block", textTransform: "capitalize" }}>
                {stored.role || "user"}
              </span>
            </div>
          </div>

          <div className="form-field">
            <label>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="form-field">
            <label>Phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
          </div>
          <div className="form-field">
            <label>Email (can't be changed here)</label>
            <input value={stored.email || ""} disabled />
          </div>

          {status && (
            <p className="muted" style={{ color: status.type === "ok" ? "#7fd68a" : "#ff8fc0", marginTop: 4 }}>
              {status.text}
            </p>
          )}

          <button className="btn-outline active" style={{ marginTop: 14, width: "fit-content", padding: "10px 20px" }} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </Panel>

        <Panel title="Account Security">
          <ul className="cat-list">
            <li>
              <span className={`dot ${accountInfo?.isVerified ? "blue" : "pink"}`} />
              Email verified <b>{accountInfo ? (accountInfo.isVerified ? "Yes" : "No") : "..."}</b>
            </li>
            <li><span className="dot blue" />Member since <b>{joinedDate}</b></li>
            <li><span className="dot pink" />Role <b style={{ textTransform: "capitalize" }}>{stored.role || "user"}</b></li>
            <li><span className="dot blue" />Account ID <b style={{ fontSize: 11 }}>{stored.id || "—"}</b></li>
          </ul>
          <button
            className="btn-outline"
            style={{ marginTop: 16, width: "fit-content", padding: "9px 18px" }}
            onClick={() => navigate("/auth")}
          >
            Change Password
          </button>
        </Panel>
      </div>

      <Panel title="Biometric Login">
        <p className="info-body" style={{ marginBottom: 14 }}>
          Enroll your device's Face ID, Touch ID, or Windows Hello for passwordless
          sign-in. This uses the real WebAuthn standard — nothing biometric ever
          leaves your device or touches CyberIntel's servers.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={`tag ${accountInfo?.webauthn?.credentialID ? "on" : "off"}`}>
            {accountInfo?.webauthn?.credentialID ? "Enrolled" : "Not enrolled"}
          </span>
          <button className="btn-outline active" style={{ padding: "9px 18px" }} onClick={handleEnrollBiometric} disabled={enrolling}>
            <Fingerprint size={15} style={{ marginRight: 6 }} />
            {enrolling ? "Waiting for prompt..." : accountInfo?.webauthn?.credentialID ? "Re-enroll" : "Enroll Biometric Login"}
          </button>
        </div>
        {biometricStatus && (
          <p className="muted" style={{ color: biometricStatus.type === "ok" ? "#7fd68a" : "#ff8fc0", marginTop: 10 }}>
            {biometricStatus.text}
          </p>
        )}
      </Panel>

      <Panel title="About Your Role">
        <p className="info-body">
          {stored.role === "admin" &&
            "As an Admin, you have full visibility across every module and can promote other accounts to Admin or Hacker roles."}
          {stored.role === "hacker" &&
            "As a Hacker (Red Team) account, you're meant to stress-test CyberIntel and look for gaps before real attackers do."}
          {stored.role === "analyst" &&
            "As an Analyst, you focus on investigating flagged anomalies and threat intelligence."}
          {(!stored.role || stored.role === "user") &&
            "As a standard User, you manage your own biometric credentials, review your login history, and get notified if something looks off with your account."}
        </p>
      </Panel>
    </>
  );
}

/* ---------------------------- URL Threat Scanner page ---------------------------- */
function UrlScannerPage() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = () => {
    const token = localStorage.getItem("cyberintel_token");
    fetch(`${API_BASE_URL}/api/threats/scan-history`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setHistory(data.scans || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleScan = async () => {
    if (!url.trim() || scanning) return;
    setScanning(true);
    setError("");
    setResult(null);
    try {
      const token = localStorage.getItem("cyberintel_token");
      const res = await fetch(`${API_BASE_URL}/api/threats/scan-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Scan failed");
      setResult(data);
      if (data.threatCreated) loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const verdictStyle = {
    safe: { color: "#7fd68a", icon: CheckCircle2, label: "Safe" },
    suspicious: { color: "#ffb84d", icon: AlertTriangle, label: "Suspicious" },
    malicious: { color: "#ff5fa2", icon: XCircle, label: "Malicious" },
  };

  return (
    <>
      <PageIntro
        eyebrow="ENHANCEMENT MODULE"
        tagline="Paste any URL and get a real risk assessment — this is CyberIntel's built-in evolution of a suspicious web threat detection system, not a bolted-on extra."
      />

      <TipCallout icon={ScanSearch} title="How this actually works">
        Every scan runs a real heuristic engine checking for HTTPS usage, IP-based
        URLs, link shorteners, risky TLDs, phishing keywords, and brand impersonation.
        Anything flagged suspicious or malicious gets logged as a real{" "}
        <b style={{ color: "#eef2fb" }}>Threat</b> record — feeding directly into your
        Dashboard and Risk pages, exactly like a real detection pipeline would.
      </TipCallout>

      <Panel title="Scan a URL">
        <div style={{ display: "flex", gap: 10 }}>
          <div className="field-inline">
            <LinkIcon size={16} />
            <input
              placeholder="https://example.com/some-link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <button className="btn-outline active" style={{ padding: "0 22px", whiteSpace: "nowrap" }} onClick={handleScan} disabled={scanning}>
            {scanning ? "Scanning..." : "Scan URL"}
          </button>
        </div>
        {error && <p className="muted" style={{ color: "#ff8fc0", marginTop: 10 }}>{error}</p>}

        {result && (
          <div className="scan-result" style={{ borderColor: verdictStyle[result.verdict].color }}>
            <div className="scan-result-head">
              {React.createElement(verdictStyle[result.verdict].icon, { size: 20, color: verdictStyle[result.verdict].color })}
              <div>
                <div style={{ fontWeight: 700, color: verdictStyle[result.verdict].color }}>
                  {verdictStyle[result.verdict].label} — Risk Score {result.score}/100
                </div>
                <div className="muted small">{result.url}</div>
              </div>
            </div>
            <ul className="cat-list" style={{ marginTop: 12 }}>
              {result.reasons.map((r, i) => (
                <li key={i}><span className={`dot ${result.verdict === "safe" ? "blue" : "pink"}`} />{r}</li>
              ))}
            </ul>
            {result.threatCreated && (
              <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
                This scan was logged as a real Threat — check your Dashboard or Risk page.
              </p>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Recent Scans">
        {historyLoading && <p className="muted">Loading...</p>}
        {!historyLoading && history.length === 0 && (
          <p className="muted">No suspicious or malicious URLs scanned yet — try one above.</p>
        )}
        {!historyLoading && history.length > 0 && (
          <table className="data-table">
            <thead><tr><th>URL</th><th>Verdict</th><th>Score</th><th>Scanned</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.url}</td>
                  <td><span className={`status-pill ${h.verdict === "malicious" ? "bad" : "ok"}`}>{h.verdict}</span></td>
                  <td>{h.score}/100</td>
                  <td className="muted">{new Date(h.scannedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Detection Signals We Check">
        <div className="mini-module-grid">
          <div className="mini-module"><Lock size={18} /> HTTPS encryption presence</div>
          <div className="mini-module"><Globe size={18} /> Raw IP addresses instead of domains</div>
          <div className="mini-module"><LinkIcon size={18} /> Link shorteners hiding real destinations</div>
          <div className="mini-module"><AlertTriangle size={18} /> High-risk TLDs (.xyz, .top, .zip...)</div>
          <div className="mini-module"><Ghost size={18} /> Phishing-style wording in the URL</div>
          <div className="mini-module"><ShieldCheck size={18} /> Brand impersonation attempts</div>
        </div>
      </Panel>

      <VibeLine icon={ScanSearch}>
        This is the "mini project, but make it real" upgrade — same idea, actual working detection.
      </VibeLine>
    </>
  );
}


/* ---------------------------- Admin Panel page ---------------------------- */
function AdminPanelPage() {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("cyberintel_user")) || {};
    } catch {
      return {};
    }
  })();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingEmail, setSavingEmail] = useState(null);
  const [statusByEmail, setStatusByEmail] = useState({});

  const [threats, setThreats] = useState([]);
  const [threatsLoading, setThreatsLoading] = useState(true);
  const [savingThreatId, setSavingThreatId] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("cyberintel_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadUsers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/auth/users`, { headers: authHeaders() })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load users");
        setUsers(data.users || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadThreats = () => {
    setThreatsLoading(true);
    fetch(`${API_BASE_URL}/api/threats/all`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setThreats(data.threats || []))
      .catch(() => setThreats([]))
      .finally(() => setThreatsLoading(false));
  };

  useEffect(() => {
    loadUsers();
    loadThreats();
  }, []);

  const handlePromote = async (email, newRole) => {
    setSavingEmail(email);
    setStatusByEmail((s) => ({ ...s, [email]: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/promote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ targetEmail: email, newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setUsers((list) => list.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
      setStatusByEmail((s) => ({ ...s, [email]: { type: "ok", text: "Updated" } }));
    } catch (err) {
      setStatusByEmail((s) => ({ ...s, [email]: { type: "err", text: err.message } }));
    } finally {
      setSavingEmail(null);
    }
  };

  const handleUnblock = async (email) => {
    setSavingEmail(email);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/unblock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ targetEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unblock failed");
      setUsers((list) => list.map((u) => (u.email === email ? { ...u, isBlocked: false } : u)));
      setStatusByEmail((s) => ({ ...s, [email]: { type: "ok", text: "Unblocked" } }));
    } catch (err) {
      setStatusByEmail((s) => ({ ...s, [email]: { type: "err", text: err.message } }));
    } finally {
      setSavingEmail(null);
    }
  };

  const handleResolve = async (id, action) => {
    setSavingThreatId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/threats/${id}/${action}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");
      setThreats((list) => list.map((t) => (t._id === id ? { ...t, status: data.threat.status } : t)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingThreatId(null);
    }
  };

  if (currentUser.role !== "admin") {
    return (
      <>
        <PageIntro eyebrow="ADMIN ONLY" tagline="This page is restricted." />
        <TipCallout icon={ShieldCheck} title="Admins only">
          Your account role is "{currentUser.role || "user"}" — only Admin accounts can
          view or manage users here. This isn't just hidden in the menu; the backend
          rejects this request too.
        </TipCallout>
      </>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="ADMIN ONLY"
        tagline="Promote/demote roles, resolve real threats, and unblock accounts the system auto-locked."
      />

      <TipCallout icon={UserCog} title="How this works">
        Every account starts as "user." When someone fails a password 3 times in 15
        minutes, CyberIntel doesn't just log it — it actually blocks the account.
        This page is where you undo that if it was a false alarm, and where you mark
        real threats as handled instead of letting them sit open forever.
      </TipCallout>

      {error && <p className="muted" style={{ color: "#ff8fc0" }}>{error}</p>}

      <Panel
        title={`All Accounts (${users.length})`}
        action={<button className="icon-btn" onClick={loadUsers} title="Refresh"><Activity size={15} /></button>}
      >
        {loading && <p className="muted">Loading...</p>}
        {!loading && users.length === 0 && <p className="muted">No accounts found.</p>}
        {!loading && users.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.isBlocked ? (
                      <span className="status-pill bad">Blocked</span>
                    ) : (
                      <span className={`status-pill ${u.isVerified ? "ok" : "bad"}`}>{u.isVerified ? "Active" : "Unverified"}</span>
                    )}
                  </td>
                  <td><span className="tag on" style={{ textTransform: "capitalize" }}>{u.role}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <select
                        defaultValue={u.role}
                        disabled={savingEmail === u.email}
                        onChange={(e) => handlePromote(u.email, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="analyst">Analyst</option>
                        <option value="hacker">Hacker</option>
                        <option value="admin">Admin</option>
                      </select>
                      {u.isBlocked && (
                        <button
                          className="btn-outline active"
                          style={{ padding: "5px 12px", fontSize: 12 }}
                          disabled={savingEmail === u.email}
                          onClick={() => handleUnblock(u.email)}
                        >
                          Unblock
                        </button>
                      )}
                      {statusByEmail[u.email] && (
                        <span style={{ fontSize: 11, color: statusByEmail[u.email].type === "ok" ? "#7fd68a" : "#ff8fc0" }}>
                          {statusByEmail[u.email].text}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel
        title={`Threats (${threats.filter((t) => t.status === "open").length} open)`}
        action={<button className="icon-btn" onClick={loadThreats} title="Refresh"><Activity size={15} /></button>}
      >
        {threatsLoading && <p className="muted">Loading...</p>}
        {!threatsLoading && threats.length === 0 && <p className="muted">No threats recorded yet.</p>}
        {!threatsLoading && threats.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Threat</th><th>Type</th><th>Severity</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {threats.map((t) => (
                <tr key={t._id}>
                  <td style={{ maxWidth: 260 }}>{t.title}</td>
                  <td className="muted">{t.type}</td>
                  <td><span className={`status-pill ${t.severity === "high" ? "bad" : "ok"}`}>{t.severity}</span></td>
                  <td><span className={`status-pill ${t.status === "open" ? "bad" : "ok"}`}>{t.status}</span></td>
                  <td>
                    {t.status === "open" ? (
                      <button
                        className="btn-outline active"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                        disabled={savingThreatId === t._id}
                        onClick={() => handleResolve(t._id, "resolve")}
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        className="btn-outline"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                        disabled={savingThreatId === t._id}
                        onClick={() => handleResolve(t._id, "reopen")}
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <VibeLine icon={ShieldCheck}>
        With great "Admin" dropdown power comes great responsibility. Use it wisely.
      </VibeLine>
    </>
  );
}


const PAGES = {
  overview: { title: "Dashboard", component: OverviewPage },
  biometric: { title: "Biometric Authentication", component: BiometricPage },
  "threat-map": { title: "3D Global Threat Matrix", component: GlobalThreatMapPage },
  "cyber-duel": { title: "AI Cyber Duel Arena (Red vs. Blue)", component: CyberDuelArenaPage },
  "ai-threat": { title: "AI Threat Detection", component: AiThreatPage },
  "url-scanner": { title: "URL Threat Scanner", component: UrlScannerPage },
  "breach-checker": { title: "Data Leak & Account Breach Checker", component: BreachCheckerPage },
  "security-headers": { title: "HTTP Security Headers & SSL Posture", component: SecurityHeadersPage },
  playbooks: { title: "SOC Incident Response Playbooks", component: PlaybooksPage },
  reports: { title: "Security Reports", component: ReportsPage },
  "admin-panel": { title: "Admin Panel", component: AdminPanelPage },
  about: { title: "About the Project", component: AboutPage },
  users: { title: "Users", component: UsersPage },
  builders: { title: "Builders", component: BuildersPage },
  goal: { title: "Goal of the Project", component: GoalPage },
  profile: { title: "My Profile", component: ProfilePage },
};

// Plays a continuous rising/falling siren (like a real alarm) for ~8 seconds,
// using the Web Audio API's frequency ramp — no sound file needed.
function playAlertSiren() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const sweepDuration = 0.6; // one up-down cycle
    const totalDuration = 8; // total siren length in seconds
    const cycles = Math.floor(totalDuration / sweepDuration);

    osc.frequency.setValueAtTime(500, now);
    for (let i = 0; i < cycles; i++) {
      const t1 = now + i * sweepDuration;
      const t2 = t1 + sweepDuration / 2;
      const t3 = t1 + sweepDuration;
      osc.frequency.linearRampToValueAtTime(1100, t2);
      osc.frequency.linearRampToValueAtTime(500, t3);
    }

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.setValueAtTime(0.12, now + totalDuration - 0.3);
    gain.gain.linearRampToValueAtTime(0, now + totalDuration);

    osc.start(now);
    osc.stop(now + totalDuration);
  } catch (err) {
    console.error("Couldn't play alert siren:", err.message);
  }
}

// Polls the overview endpoint every 3s (fast, so a new threat is caught
// almost immediately) and compares the active-threat count to the last
// known value. A genuine increase triggers a real alert: an 8-second siren
// plus a red flash around the screen edges lasting 30 seconds.
function useThreatAlerts() {
  const [flashing, setFlashing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevCountRef = useRef(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const token = localStorage.getItem("cyberintel_token");
        const res = await fetch("http://localhost:5000/api/dashboard/overview", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const count = data?.stats?.activeThreats;
        if (typeof count !== "number") return;

        if (prevCountRef.current !== null && count > prevCountRef.current) {
          setFlashing(true);
          if (soundEnabled) playAlertSiren();
          setTimeout(() => setFlashing(false), 30000);
        }
        prevCountRef.current = count;
      } catch {
        // Silently skip a failed poll — don't spam errors for a background check
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  return { flashing, soundEnabled, setSoundEnabled };
}

function ThreatFlashOverlay({ active }) {
  if (!active) return null;
  return <div className="threat-flash-overlay" />;
}


export default function App() {
  const [active, setActive] = useState("overview");
  const currentPage = PAGES[active] || PAGES.overview || { title: "Dashboard", component: OverviewPage };
  const Current = currentPage.component || OverviewPage;
  const { flashing, soundEnabled, setSoundEnabled } = useThreatAlerts();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const contentEl = document.querySelector(".content");
    if (contentEl) contentEl.scrollTop = 0;
  }, [active]);

  return (
    <div className="dash-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .dash-root {
          display: flex; min-height: 100vh; background: #05060a; color: #eef2fb;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative; overflow: hidden;
        }
        h1, h2, h3, .panel-title, .stat-value, .brand-text, .page-tagline + h2 {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .brand-accent { color: #ff5fa2; }

        /* ---------- threat alert flash ---------- */
        .threat-flash-overlay {
          position: fixed; inset: 0; z-index: 999; pointer-events: none;
          animation: threat-flash 1.1s ease-in-out infinite;
        }
        @keyframes threat-flash {
          0%, 100% { box-shadow: inset 0 0 0px rgba(255,45,90,0); }
          50% { box-shadow: inset 0 0 140px rgba(255,45,90,0.85); }
        }

        /* ---------- ambient background ---------- */
        .ambient-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .ambient-glow { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.25; }
        .ambient-glow.blue { width: 520px; height: 520px; background: #3a7bff; top: -160px; left: 10%; }
        .ambient-glow.pink { width: 460px; height: 460px; background: #ff2f8f; bottom: -160px; right: 6%; }
        .particle-field { position: absolute; inset: 0; width: 100%; height: 100%; }
        .scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px);
          mix-blend-mode: overlay;
        }
        .dash-shooting-star {
          position: absolute; left: -10%; width: 3px; height: 3px; border-radius: 50%;
          background: #fff; box-shadow: 0 0 6px 2px rgba(255,255,255,0.7);
          animation-name: dash-shoot; animation-timing-function: linear; animation-iteration-count: infinite;
        }
        .dash-shooting-star::before {
          content: ""; position: absolute; top: 50%; right: 0; width: 80px; height: 1px;
          background: linear-gradient(to left, rgba(255,255,255,0.8), transparent); transform: translateY(-50%);
        }
        @keyframes dash-shoot {
          0% { transform: translate(0,0); opacity: 0; }
          5% { opacity: 1; }
          100% { transform: translate(130vw, 50px); opacity: 0; }
        }

        /* ---------- sidebar ---------- */
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 40;
          width: 72px; background: rgba(10,12,22,0.85); backdrop-filter: blur(14px);
          border-right: 1px solid rgba(255,255,255,0.07);
          padding: 16px 12px; display: flex; flex-direction: column; gap: 14px;
          transition: width 0.2s ease, box-shadow 0.2s ease;
          overflow-y: auto; overflow-x: hidden; white-space: nowrap;
          scrollbar-width: thin; scrollbar-color: rgba(93,169,255,0.2) transparent;
        }
        .sidebar::-webkit-scrollbar { width: 4px; }
        .sidebar::-webkit-scrollbar-track { background: transparent; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(93,169,255,0.2); border-radius: 4px; }
        .sidebar::-webkit-scrollbar-thumb:hover { background: rgba(93,169,255,0.4); }
        .sidebar.expanded {
          width: 240px;
          box-shadow: 12px 0 40px rgba(0,0,0,0.5);
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px;
          cursor: pointer; padding: 4px 6px;
        }
        .nav-group-label {
          font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em;
          color: #6b7488; margin: 4px 8px 8px;
          opacity: 0; transition: opacity 0.15s ease;
        }
        .sidebar.expanded .nav-group-label { opacity: 1; transition-delay: 0.05s; }
        .brand-text, .nav-label {
          opacity: 0; transition: opacity 0.15s ease;
        }
        .sidebar.expanded .brand-text, .sidebar.expanded .nav-label {
          opacity: 1; transition-delay: 0.05s;
        }
        .nav-group { display: flex; flex-direction: column; gap: 3px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px; background: none; border: none; text-align: left;
          color: #9aa4bd; padding: 10px 10px; border-radius: 10px; cursor: pointer; font-size: 13.5px;
          transition: background 0.15s ease, color 0.15s ease; white-space: nowrap; overflow: hidden;
        }
        .nav-item svg {
          flex-shrink: 0; min-width: 18px; min-height: 18px; width: 18px; height: 18px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.04); color: #fff; }
        .nav-item.active {
          background: linear-gradient(135deg, rgba(255,95,162,0.18), rgba(93,169,255,0.18));
          color: #fff; border: 1px solid rgba(93,169,255,0.35);
          box-shadow: 0 0 18px rgba(93,169,255,0.15), inset 0 0 12px rgba(255,95,162,0.08);
        }

        /* ---------- main ---------- */
        .main { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; min-width: 0; margin-left: 72px; }
        .topbar {
          position: relative; z-index: 500;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(5,6,10,0.5); backdrop-filter: blur(10px);
        }
        .topbar h2 { font-size: 19px; margin: 0; }
        .topbar-right { position: relative; z-index: 510; display: flex; align-items: center; gap: 14px; }
        .search-wrap { position: relative; z-index: 520; }
        .search-box {
          display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px; width: 260px;
          color: #6b7488;
        }
        .search-box input { background: none; border: none; outline: none; color: #eef2fb; font-size: 13px; width: 100%; }
        .search-hint {
          position: absolute; top: 40px; left: 0; font-size: 11.5px; color: #ff8fc0;
          background: #0d0f1a; border: 1px solid rgba(255,95,162,0.3); border-radius: 8px;
          padding: 6px 10px; white-space: nowrap; z-index: 9999;
        }
        .notif-wrap { position: relative; z-index: 520; }
        .notif-badge-dot {
          position: absolute; top: 6px; right: 6px; width: 7px; height: 7px;
          background: #ff5fa2; border-radius: 50%; box-shadow: 0 0 8px #ff5fa2;
        }
        .notif-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0; width: 340px;
          background: rgba(13, 15, 26, 0.98); backdrop-filter: blur(20px);
          border: 1px solid rgba(93, 169, 255, 0.28); border-radius: 14px;
          padding: 0; box-shadow: 0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(93,169,255,0.12);
          z-index: 9999; overflow: hidden;
          animation: notifSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* ---------- Voice Briefing & ELI5 Styles ---------- */
        .btn-briefing {
          background: rgba(93, 169, 255, 0.12);
          border: 1px solid rgba(93, 169, 255, 0.3);
          color: #5da9ff; padding: 7px 12px; border-radius: 9px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.15s ease;
        }
        .btn-briefing:hover {
          background: rgba(93, 169, 255, 0.22); color: #fff;
          border-color: #5da9ff; box-shadow: 0 0 12px rgba(93, 169, 255, 0.3);
        }
        .btn-briefing.playing {
          background: rgba(255, 71, 87, 0.2); border-color: #ff4757; color: #ff4757;
        }
        .briefing-hud-bar {
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, rgba(93, 169, 255, 0.15), rgba(255, 95, 162, 0.15));
          border-bottom: 1px solid rgba(93, 169, 255, 0.35);
          padding: 12px 28px; gap: 16px; position: relative; z-index: 490;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          animation: slideDownBriefing 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDownBriefing {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .briefing-hud-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .audio-waves-container { display: flex; align-items: center; gap: 3px; height: 16px; }
        .audio-wave-bar {
          width: 3px; background: #5da9ff; border-radius: 2px;
          animation: audioBounce 0.8s ease-in-out infinite alternate;
        }
        .audio-wave-bar:nth-child(1) { height: 6px; animation-delay: 0.1s; }
        .audio-wave-bar:nth-child(2) { height: 16px; animation-delay: 0.3s; }
        .audio-wave-bar:nth-child(3) { height: 10px; animation-delay: 0.2s; }
        .audio-wave-bar:nth-child(4) { height: 14px; animation-delay: 0.4s; }
        @keyframes audioBounce {
          0% { height: 4px; }
          100% { height: 16px; }
        }
        .briefing-title { font-size: 12px; font-weight: 700; color: #5da9ff; text-transform: uppercase; letter-spacing: 0.05em; }
        .briefing-subtitle { font-size: 13px; color: #eef2fb; line-height: 1.4; margin-top: 2px; }
        .btn-stop-briefing {
          background: rgba(255, 71, 87, 0.15); border: 1px solid rgba(255, 71, 87, 0.4);
          color: #ff4757; font-size: 12px; font-weight: 700; padding: 6px 12px;
          border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;
          white-space: nowrap; transition: all 0.15s ease;
        }
        .btn-stop-briefing:hover { background: rgba(255, 71, 87, 0.25); color: #fff; }
        .eli5-toggle-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #9aa4bd; padding: 5px 12px; border-radius: 999px;
          font-size: 11.5px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s ease;
        }
        .eli5-toggle-btn.active {
          background: linear-gradient(135deg, rgba(255, 95, 162, 0.2), rgba(93, 169, 255, 0.2));
          border-color: #5da9ff; color: #fff; box-shadow: 0 0 14px rgba(93, 169, 255, 0.25);
        }
        .eli5-analogy-box {
          background: rgba(93, 169, 255, 0.08); border-left: 3px solid #5da9ff;
          border-radius: 0 8px 8px 0; padding: 8px 12px; margin-top: 6px; width: 100%;
          font-size: 12px; color: #cdd4e6; line-height: 1.45;
        }
        .btn-mini-speaker {
          background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
          color: #9aa4bd; cursor: pointer; width: 22px; height: 22px; border-radius: 6px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: all 0.15s ease;
        }
        .btn-mini-speaker:hover { color: #5da9ff; border-color: #5da9ff; background: rgba(93, 169, 255, 0.1); }

        @keyframes notifSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          font-size: 13px; font-weight: 700; color: #fff;
        }
        .notif-count-chip {
          font-size: 11px; font-weight: 600; color: #5da9ff;
          background: rgba(93,169,255,0.12); padding: 2px 8px; border-radius: 999px;
          border: 1px solid rgba(93,169,255,0.25);
        }
        .notif-list-body {
          max-height: 280px; overflow-y: auto; padding: 6px;
          scrollbar-width: thin; scrollbar-color: rgba(93,169,255,0.3) transparent;
        }
        .notif-list-body::-webkit-scrollbar { width: 4px; }
        .notif-list-body::-webkit-scrollbar-track { background: transparent; }
        .notif-list-body::-webkit-scrollbar-thumb { background: rgba(93,169,255,0.3); border-radius: 4px; }
        .notif-list-body::-webkit-scrollbar-thumb:hover { background: rgba(93,169,255,0.5); }
        .notif-empty { font-size: 12.5px; color: #6b7488; padding: 24px; text-align: center; }
        .notif-item {
          display: flex; gap: 10px; padding: 10px 12px; border-radius: 10px;
          align-items: flex-start; transition: background 0.15s ease;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: rgba(93,169,255,0.08); }
        .notif-text { font-size: 12.5px; color: #eef2fb; line-height: 1.4; word-break: break-word; }
        .notif-time { font-size: 11px; color: #6b7488; margin-top: 3px; font-weight: 500; }
        .icon-btn {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #9aa4bd;
          width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .icon-btn:hover { color: #fff; border-color: #5da9ff; }
        .profile-wrap { position: relative; z-index: 520; }
        .profile { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .profile-menu {
          position: absolute; top: calc(100% + 10px); right: 0; background: #0d0f1a;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 6px;
          min-width: 120px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 9999;
        }
        .profile-menu button {
          width: 100%; text-align: left; background: none; border: none; color: #ff8fc0;
          padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .profile-menu button:hover { background: rgba(255,95,162,0.1); }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #ff5fa2, #5da9ff);
          display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #05060a;
        }
        .profile-name { font-size: 13px; font-weight: 600; }
        .profile-role { font-size: 11px; color: #6b7488; }

        .content { padding: 26px 28px 60px; display: flex; flex-direction: column; gap: 20px; }

        /* ---------- page intro ---------- */
        .page-intro { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
        .eyebrow-chip {
          display: inline-flex; width: fit-content; font-size: 11px; letter-spacing: 0.12em; font-weight: 700;
          color: #ff8fc0; background: rgba(255,95,162,0.1); border: 1px solid rgba(255,95,162,0.3);
          padding: 5px 12px; border-radius: 999px; text-transform: uppercase;
        }
        .page-tagline { color: #9aa4bd; font-size: 14.5px; line-height: 1.6; max-width: 720px; }

        /* ---------- tip callout ---------- */
        .tip-callout {
          display: flex; gap: 12px; background: rgba(93,169,255,0.06); border: 1px solid rgba(93,169,255,0.25);
          border-radius: 14px; padding: 16px 18px;
        }
        .tip-icon {
          width: 30px; height: 30px; border-radius: 8px; background: rgba(93,169,255,0.15); color: #7cbaff;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tip-title { font-size: 13.5px; font-weight: 700; margin-bottom: 4px; }
        .tip-callout p { font-size: 13px; color: #9aa4bd; line-height: 1.6; margin: 0; }

        /* ---------- vibe line ---------- */
        .vibe-line {
          display: flex; align-items: center; gap: 8px; color: #ff8fc0; font-size: 13px; font-weight: 600;
          padding: 4px 4px 20px;
        }

        /* ---------- stat cards ---------- */
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .stat-grid.single-row { grid-template-columns: repeat(2, 1fr); }
        .stat-card {
          background: rgba(255,255,255,0.025); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 14px; position: relative;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-3px); border-color: rgba(93,169,255,0.4); box-shadow: 0 12px 30px rgba(93,169,255,0.12); }
        .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.blue { background: rgba(93,169,255,0.12); color: #7cbaff; }
        .stat-icon.pink { background: rgba(255,95,162,0.12); color: #ff8fc0; }
        .stat-value { font-size: 20px; font-weight: 700; }
        .stat-label { font-size: 12px; color: #9aa4bd; }
        .stat-delta { position: absolute; top: 14px; right: 14px; font-size: 11px; font-weight: 600; }
        .stat-delta.blue { color: #7cbaff; }
        .stat-delta.pink { color: #ff8fc0; }

        /* ---------- panels ---------- */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .panel {
          background: rgba(255,255,255,0.025); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .panel-title { font-size: 14px; font-weight: 600; color: #eef2fb; }

        .activity-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; font-size: 13.5px; color: #cdd4e6; }
        .activity-list li { display: flex; align-items: center; gap: 10px; }
        .activity-list .time { margin-left: auto; color: #6b7488; font-size: 11.5px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dot.blue { background: #5da9ff; }
        .dot.pink { background: #ff5fa2; }

        .data-table, table.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .data-table th { text-align: left; color: #9aa4bd; font-size: 11px; text-transform: uppercase; padding: 8px 10px; letter-spacing: 0.04em; }
        .data-table td { padding: 10px; border-top: 1px solid rgba(255,255,255,0.06); color: #cdd4e6; }
        .status-pill { font-size: 11px; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
        .status-pill.ok { background: rgba(93,169,255,0.15); color: #7cbaff; }
        .status-pill.bad { background: rgba(255,95,162,0.15); color: #ff8fc0; }
        .role-select {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          color: #eef2fb; font-size: 12px; border-radius: 8px; padding: 6px 8px;
          outline: none; cursor: pointer;
        }
        .role-select:focus { border-color: #5da9ff; }
        .muted { color: #6b7488; }
        .muted.small { font-size: 11.5px; }

        .method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .method-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12.5px;
        }
        .tag { font-size: 10.5px; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
        .tag.on { background: rgba(93,169,255,0.15); color: #7cbaff; }
        .tag.off { background: rgba(255,255,255,0.06); color: #6b7488; }

        .ring-wrap { display: flex; align-items: center; justify-content: center; padding: 12px 0; }
        .ring.big { width: 140px; height: 140px; border-radius: 50%; background: conic-gradient(#5da9ff 0turn, rgba(255,255,255,0.08) 0.75turn); display: flex; align-items: center; justify-content: center; }
        .ring.big.danger { background: conic-gradient(#ff5fa2 0turn, rgba(255,255,255,0.08) 0.72turn); }
        .ring-inner { width: 100px; height: 100px; border-radius: 50%; background: #05060a; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ring-num { font-size: 26px; font-weight: 700; }
        .ring-label { font-size: 11px; color: #9aa4bd; }

        .cat-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13.5px; color: #cdd4e6; }
        .cat-list li { display: flex; align-items: center; gap: 8px; }
        .cat-list b { margin-left: auto; }

        .model-status { display: flex; flex-direction: column; gap: 12px; }
        .model-row { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #cdd4e6; }
        .model-row .tag { margin-left: auto; }

        .anomaly-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
        .anomaly-list li { display: flex; align-items: center; gap: 12px; font-size: 13px; }
        .anomaly-name { flex: 1; color: #cdd4e6; }
        .risk-bar { width: 140px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
        .risk-bar.wide { width: 200px; }
        .risk-fill { height: 100%; background: linear-gradient(90deg, #5da9ff, #ff5fa2); }
        .anomaly-score { color: #9aa4bd; font-size: 12px; width: 34px; text-align: right; }

        .pulse-bars { display: flex; align-items: flex-end; gap: 4px; height: 90px; }
        .pulse-bar { flex: 1; background: linear-gradient(180deg, #5da9ff, #ff5fa2); border-radius: 3px; transition: height 0.6s ease; }

        .report-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .report-list li {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 12px 14px;
        }
        .report-name { font-size: 13.5px; color: #eef2fb; }

        .info-body { color: #9aa4bd; font-size: 14px; line-height: 1.8; max-width: 720px; }

        .glossary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .glossary-grid b { font-size: 13.5px; color: #eef2fb; }
        .glossary-grid p { font-size: 12.5px; color: #9aa4bd; line-height: 1.6; margin: 4px 0 0; }

        .pie-row { display: flex; align-items: center; gap: 20px; }
        .pie-legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: #cdd4e6; flex: 1; }
        .pie-legend li { display: flex; align-items: center; gap: 8px; }
        .pie-legend b { margin-left: auto; }
        .pie-legend .dot { width: 9px; height: 9px; border-radius: 50%; }

        .mini-module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .mini-module {
          display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #cdd4e6;
        }

        .timeline-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
        .timeline-list li { display: flex; gap: 12px; align-items: flex-start; color: #7cbaff; }
        .timeline-list li div { display: flex; flex-direction: column; gap: 2px; }
        .timeline-list li b { color: #eef2fb; font-size: 13.5px; }
        .timeline-list li span { color: #9aa4bd; font-size: 12.5px; }

        .persona-card { display: flex; flex-direction: column; gap: 10px; color: #7cbaff; }
        .persona-card p { color: #9aa4bd; font-size: 13.5px; line-height: 1.7; margin: 0; }

        .form-field { margin-bottom: 14px; }
        .form-field label { display: block; font-size: 11.5px; color: #9aa4bd; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .form-field input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 11px 13px; color: #eef2fb; font-size: 13.5px; outline: none;
        }
        .form-field input:focus { border-color: #5da9ff; }
        .form-field input:disabled { opacity: 0.5; cursor: not-allowed; }

        .field-inline {
          flex: 1; display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 0 14px; color: #6b7488;
        }
        .field-inline input {
          background: none; border: none; outline: none; color: #eef2fb;
          font-size: 13.5px; width: 100%; padding: 11px 0;
        }
        .scan-result {
          margin-top: 18px; padding: 16px; border-radius: 12px;
          background: rgba(255,255,255,0.02); border: 1px solid;
        }
        .scan-result-head { display: flex; align-items: center; gap: 12px; }

        .resource-list { display: flex; flex-direction: column; gap: 10px; }
        .resource-link {
          display: flex; align-items: center; gap: 12px; text-decoration: none;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 13px 16px; color: #7cbaff;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
        }
        .resource-link:hover { border-color: #5da9ff; background: rgba(93,169,255,0.06); transform: translateX(2px); }
        .resource-link b { color: #eef2fb; font-size: 13.5px; display: block; }
        .resource-link span { color: #9aa4bd; font-size: 12px; }

        .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px; }
        .team-card {
          display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;
        }
        .team-avatar {
          width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff); display: flex;
          align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #05060a;
        }
        .team-card b { display: block; font-size: 13.5px; color: #eef2fb; }
        .team-card span { font-size: 11.5px; color: #9aa4bd; }

        /* ---------- Cyber Tools Styles ---------- */
        .tab-pill-bar { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .tab-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #9aa4bd; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 10px;
          cursor: pointer; transition: all 0.15s ease;
        }
        .tab-pill:hover { color: #fff; background: rgba(255,255,255,0.06); border-color: rgba(93,169,255,0.3); }
        .tab-pill.active {
          background: linear-gradient(135deg, rgba(93,169,255,0.18), rgba(255,95,162,0.18));
          color: #fff; border-color: #5da9ff; box-shadow: 0 0 16px rgba(93,169,255,0.15);
        }

        .tag-chip {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #9aa4bd; font-size: 11.5px; padding: 4px 10px; border-radius: 999px;
          cursor: pointer; transition: all 0.15s ease;
        }
        .tag-chip:hover, .tag-chip.active { color: #5da9ff; border-color: #5da9ff; background: rgba(93,169,255,0.1); }

        .breach-banner {
          border-radius: 14px; padding: 18px; border: 1px solid;
          background: rgba(255,255,255,0.02);
        }
        .breach-banner.danger {
          border-color: rgba(255,95,162,0.4); background: rgba(255,45,90,0.06);
          box-shadow: 0 0 30px rgba(255,45,90,0.1);
        }
        .breach-banner.clean {
          border-color: rgba(127,214,138,0.4); background: rgba(127,214,138,0.06);
        }
        .breach-icon {
          width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .breach-icon.danger { background: rgba(255,95,162,0.15); color: #ff5fa2; }
        .breach-icon.clean { background: rgba(127,214,138,0.15); color: #7fd68a; }

        .breach-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
        .breach-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px; display: flex; flex-direction: column;
        }
        .breach-avatar {
          width: 32px; height: 32px; border-radius: 8px; background: rgba(93,169,255,0.15);
          color: #7cbaff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;
        }

        .rec-card {
          display: flex; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 12px 14px; align-items: flex-start;
        }
        .rec-priority {
          font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.04em;
        }
        .rec-priority.critical { background: rgba(255,45,90,0.2); color: #ff5fa2; border: 1px solid rgba(255,45,90,0.4); }
        .rec-priority.high { background: rgba(255,184,77,0.2); color: #ffb84d; border: 1px solid rgba(255,184,77,0.4); }
        .rec-priority.medium { background: rgba(93,169,255,0.15); color: #7cbaff; border: 1px solid rgba(93,169,255,0.3); }

        .crack-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 4px;
        }

        /* Directory styles */
        .directory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
        .directory-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 18px; display: flex; flex-direction: column;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .directory-card:hover {
          transform: translateY(-2px); border-color: rgba(93,169,255,0.4);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .badge-pill {
          font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase;
        }
        .badge-pill.blue { background: rgba(93,169,255,0.15); color: #7cbaff; border: 1px solid rgba(93,169,255,0.3); }
        .trust-meter { text-align: right; display: flex; flex-direction: column; }
        .mini-bullet-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #cdd4e6; }
        .mini-bullet-list li { display: flex; align-items: center; gap: 6px; }
        .query-tag {
          font-size: 10.5px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 2px 7px; color: #9aa4bd;
        }
        .cost-tag { font-size: 11px; color: #7fd68a; font-weight: 600; }
        .btn-site-link {
          display: inline-flex; align-items: center; gap: 6px; background: rgba(93,169,255,0.1);
          color: #5da9ff; font-size: 12px; font-weight: 600; border: 1px solid rgba(93,169,255,0.25);
          padding: 6px 14px; border-radius: 8px; text-decoration: none; transition: all 0.15s ease;
        }
        .btn-site-link:hover { background: #5da9ff; color: #05060a; border-color: #5da9ff; }

        /* Security Headers Styles */
        .header-score-card {
          display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px;
        }
        .grade-badge {
          width: 56px; height: 56px; border-radius: 14px; border: 2px solid;
          display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800;
          background: rgba(255,255,255,0.03); flex-shrink: 0;
        }
        .header-item-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px;
        }
        .header-item-card.pass { border-left: 3px solid #7fd68a; }
        .header-item-card.fail { border-left: 3px solid #ff5fa2; }
        .importance-tag {
          font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; margin-left: 8px;
        }
        .importance-tag.critical { background: rgba(255,45,90,0.15); color: #ff5fa2; }
        .importance-tag.high { background: rgba(255,184,77,0.15); color: #ffb84d; }
        .importance-tag.medium { background: rgba(93,169,255,0.15); color: #7cbaff; }
        .raw-header-val {
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
          padding: 8px 10px; font-size: 12px; margin-top: 6px; word-break: break-all;
        }
        .raw-header-val code { color: #7cbaff; font-family: monospace; }
        .code-fix-box {
          background: rgba(93,169,255,0.04); border: 1px solid rgba(93,169,255,0.2); border-radius: 8px;
          padding: 10px 12px; margin-top: 8px;
        }
        .code-fix-box code { font-family: monospace; font-size: 12px; color: #eef2fb; display: block; }
        .copy-btn {
          background: none; border: none; color: #9aa4bd; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;
        }
        .copy-btn:hover { color: #fff; }

        /* Playbook styles */
        .phase-block { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; }
        .phase-title { font-size: 13.5px; font-weight: 700; color: #5da9ff; text-transform: uppercase; letter-spacing: 0.04em; }
        .task-row {
          display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px;
          cursor: pointer; transition: background 0.15s ease;
        }
        .task-row:hover { background: rgba(255,255,255,0.03); }
        .task-row.done { opacity: 0.7; }
        .checkbox-box {
          width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .checkbox-box.checked { background: #7fd68a; border-color: #7fd68a; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .stat-grid, .grid-2, .method-grid, .glossary-grid, .directory-grid { grid-template-columns: 1fr; }
          .search-box { display: none; }
          .pie-row { flex-direction: column; }
        }
      `}</style>

      <ThreatFlashOverlay active={flashing} />
      <AmbientBackground />

      <Sidebar active={active} setActive={setActive} />

      <div className="main">
        <Topbar title={currentPage.title} setActive={setActive} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />
        <div className="content">
          <Current />
        </div>
      </div>

      <AiChatWidget />
    </div>
  );
}