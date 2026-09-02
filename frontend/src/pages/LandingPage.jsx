import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint,
  Cpu,
  Radar,
  Activity,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Lock,
  Mail,
  User,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Settings,
  Search,
  KeyRound,
  Smartphone,
  ScanFace,
  Database,
  ShieldAlert,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.jsx";

/* ---------------------------------------------------------
   CyberIntel — Landing Page
   Palette: void-black / electric-blue / neon-pink / soft-white
--------------------------------------------------------- */

const NAV_MENUS = {
  Platform: [
    "Biometric Authentication",
    "AI Threat Detection",
    "Threat Intelligence & Risk",
    "Real-Time Monitoring",
  ],
  Solutions: ["For Enterprises", "For Government", "For Startups", "For Individuals"],
  Resources: ["Documentation", "Case Studies", "Blog", "API Reference"],
  Company: ["About the Project", "Builders", "Our Goal", "Contact Us"],
};

const FEATURES = [
  {
    icon: Database,
    title: "Data Leak & Account Breach Checker",
    desc: "Scan personal and corporate accounts across 15+ billion exposed credentials, evaluate exposure risk, and verify pwned passwords with zero-knowledge k-Anonymity.",
  },
  {
    icon: ScanFace,
    title: "Biometric WebAuthn Passkeys",
    desc: "Face ID, fingerprint, and Windows Hello sign-in that replaces fragile passwords with genuine cryptographic passkeys.",
  },
  {
    icon: Cpu,
    title: "AI-Based Threat Detection",
    desc: "Machine learning models score every event in real time, flagging anomalies before they become incidents.",
  },
  {
    icon: ShieldAlert,
    title: "Security Headers & Posture Analyzer",
    desc: "Audit HTTP defense headers (HSTS, CSP, X-Frame-Options) and inspect SSL configurations with instant remediation code.",
  },
  {
    icon: Radar,
    title: "Threat Intelligence & Risk Analysis",
    desc: "Correlated global threat feeds turn raw signals into a ranked, actionable risk picture for your systems.",
  },
  {
    icon: Activity,
    title: "Real-Time Monitoring & Alerts",
    desc: "Live telemetry across every endpoint, with alerts routed the moment something looks wrong.",
  },
];

const STEPS = [
  {
    icon: User,
    title: "Create your account",
    desc: "Sign up with your email or phone number. No clutter, no unnecessary fields — just what we need to protect you.",
  },
  {
    icon: Mail,
    title: "Verify with a one-time code",
    desc: "We send a 6-digit OTP to your email or phone. Enter it once and you're confirmed — no app installs required.",
  },
  {
    icon: Fingerprint,
    title: "Enable biometric login",
    desc: "Register a fingerprint or face scan so future sign-ins take under two seconds, from any device.",
  },
  {
    icon: KeyRound,
    title: "Forgot password? No problem",
    desc: "Request a reset, confirm the OTP sent to your inbox or phone, and set a new password in under a minute.",
  },
  {
    icon: LayoutDashboard,
    title: "Land on your dashboard",
    desc: "Every module — monitoring, threats, reports — is one click away from a single, unified control center.",
  },
];

/* ---------- animated particle network + shooting stars ---------- */
function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, particles;
    let animationId;

    const PARTICLE_COUNT = 70;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() > 0.5 ? "blue" : "pink",
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // update + draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === "blue" ? "rgba(93,169,255,0.85)" : "rgba(255,95,162,0.75)";
        ctx.fill();
      });

      // connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(93,169,255,${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(step);
    }

    init();
    step();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.9,
      }}
    />
  );
}

function ShootingStars() {
  const stars = [
    { top: "8%", delay: "0s", dur: "4.5s" },
    { top: "22%", delay: "1.8s", dur: "5.5s" },
    { top: "40%", delay: "3.2s", dur: "4s" },
    { top: "60%", delay: "0.6s", dur: "6s" },
    { top: "75%", delay: "2.6s", dur: "5s" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="shooting-star"
          style={{ top: s.top, animationDelay: s.delay, animationDuration: s.dur }}
        />
      ))}
    </div>
  );
}

/* ---------------------------- Nav ---------------------------- */
function NavBar() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  return (
    <header className="nav-wrap">
      <div className="nav-inner">
        <div className="brand">
          <ShieldCheck size={22} color="#5da9ff" />
          <span>
            Cyber<span className="brand-accent">Intel</span>
          </span>
        </div>

        <nav className="nav-menu">
          {Object.entries(NAV_MENUS).map(([label, items]) => (
            <div
              key={label}
              className="nav-item"
              onMouseEnter={() => setOpen(label)}
              onMouseLeave={() => setOpen(null)}
            >
              <button className="nav-btn">
                {label} <ChevronDown size={14} />
              </button>
              {open === label && (
                <div className="dropdown">
                  {items.map((it) => (
                    <div
                      key={it}
                      className="dropdown-item"
                      onClick={() => {
                        const internalMap = {
                          "About the Project": "/info/about",
                          "Builders": "/info/builders",
                          "Our Goal": "/info/goal",
                          "Contact Us": "/info/about",
                        };
                        const externalMap = {
                          "Documentation": "https://owasp.org/www-project-top-ten/",
                          "Case Studies": "https://attack.mitre.org/",
                          "Blog": "https://www.cisa.gov/topics/cybersecurity-best-practices",
                          "API Reference": "https://www.nist.gov/cyberframework",
                        };
                        if (externalMap[it]) {
                          window.open(externalMap[it], "_blank", "noopener,noreferrer");
                        } else {
                          navigate(internalMap[it] || "/auth");
                        }
                      }}
                    >
                      {it}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="nav-actions">
          <LanguageSelector />
          <a className="ghost-link" href="#" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>
            Hacker Login
          </a>
          <a className="ghost-link" href="#" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>
            Admin Login
          </a>
          <button className="btn-primary sm" onClick={() => navigate("/auth")}>
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* --------------------------- Hero --------------------------- */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <NetworkCanvas />
      <ShootingStars />
      <div className="hero-glow glow-blue" />
      <div className="hero-glow glow-pink" />

      <div className="hero-content">
        <div className="eyebrow">
          <Lock size={13} /> AI-POWERED CYBER DEFENSE
        </div>

        <h1 className="headline">
          Unlock the power of <span className="pill pill-blue">zero-trust</span> and
          intelligent <span className="pill pill-pink">threat detection</span> with
          CyberIntel, an <span className="pill pill-blue">advanced</span> security
          platform meticulously built to{" "}
          <span className="pill pill-pink">redefine</span> how your organization
          fights back.
        </h1>

        <p className="subtext">
          Biometric access, real-time monitoring, and AI-driven risk analysis — unified
          into a single console built for analysts, not just executives.
        </p>

        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => navigate("/auth")}>
            Create Account <ArrowRight size={16} />
          </button>
          <button className="btn-ghost" onClick={() => navigate("/auth")}>Watch Demo</button>
        </div>
      </div>

      <div className="hero-orb-wrap">
        <div className="orb">
          <ShieldCheck size={54} color="#eaf2ff" />
        </div>

        <div className="float-card card-1">
          <div className="float-icon blue">
            <Fingerprint size={18} />
          </div>
          <div>
            <div className="float-title">Biometric Access</div>
            <div className="float-desc">Face &amp; fingerprint sign-in, zero passwords.</div>
          </div>
        </div>

        <div className="float-card card-2">
          <div className="float-icon pink">
            <Radar size={18} />
          </div>
          <div>
            <div className="float-title">Live Threat Feed</div>
            <div className="float-desc">Global intel correlated to your risk score.</div>
          </div>
        </div>

        <div className="float-card card-3">
          <div className="float-icon blue">
            <Activity size={18} />
          </div>
          <div>
            <div className="float-title">Real-Time Alerts</div>
            <div className="float-desc">From detection to notification in seconds.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Features grid ------------------------- */
function Features() {
  return (
    <section className="section">
      <div className="section-head center">
        <div className="eyebrow eyebrow-alt">CORE MODULES</div>
        <h2>Five systems. One shield.</h2>
        <p>Every module below feeds the same intelligence engine and the same dashboard.</p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className={`feature-icon ${i % 2 === 0 ? "blue" : "pink"}`}>
              <f.icon size={22} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- Dashboard preview ------------------------- */
function DashboardPreview() {
  const threats = [
    { entity: "tanya.hill@example.com", title: "Cross-platform attack in dataset", risk: 82, status: "Open" },
    { entity: "youav@rezonate-esec.io", title: "Suspicious lateral movement", risk: 64, status: "In Progress" },
    { entity: "m.scott@trexony.com", title: "Successful console brute force", risk: 91, status: "Open" },
  ];

  return (
    <section className="section">
      <div className="section-head">
        <div className="eyebrow eyebrow-alt">SECURITY DASHBOARD</div>
        <h2>See everything, from one screen.</h2>
        <p>A live preview of the console every account lands on after signing in.</p>
      </div>

      <div className="dash-mock">
        <div className="dash-topbar">
          <div className="dash-tabs">
            <span className="dash-tab active">
              <LayoutDashboard size={14} /> Dashboard
            </span>
            <span className="dash-tab">
              <User size={14} /> Users
            </span>
            <span className="dash-tab">
              <AlertTriangle size={14} /> Threats
            </span>
          </div>
          <div className="dash-icons">
            <Search size={15} />
            <Bell size={15} />
            <Settings size={15} />
          </div>
        </div>

        <div className="dash-panels">
          <div className="dash-panel">
            <div className="panel-title">Top 5 Categories</div>
            <ul className="cat-list">
              <li><span className="dot blue" />Initial Access <b>9</b></li>
              <li><span className="dot pink" />Discovery <b>9</b></li>
              <li><span className="dot blue" />Persistence <b>9</b></li>
              <li><span className="dot pink" />Lateral Movement <b>9</b></li>
              <li><span className="dot blue" />Execution <b>9</b></li>
            </ul>
          </div>

          <div className="dash-panel">
            <div className="panel-title">Threat Tactics (12 Weeks)</div>
            <div className="heatmap">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className="heat-cell"
                  style={{ opacity: 0.25 + ((i * 37) % 100) / 130 }}
                />
              ))}
            </div>
          </div>

          <div className="dash-panel center">
            <div className="panel-title">Threat Status</div>
            <div className="ring">
              <div className="ring-inner">
                <div className="ring-num">100</div>
                <div className="ring-label">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-table">
          <div className="panel-title">Security Threats</div>
          <table>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Title</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {threats.map((t, i) => (
                <tr key={i}>
                  <td>{t.entity}</td>
                  <td>{t.title}</td>
                  <td>
                    <div className="risk-bar">
                      <div className="risk-fill" style={{ width: `${t.risk}%` }} />
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${t.status === "Open" ? "open" : "progress"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Attack map ------------------------- */
function AttackMap() {
  const nodes = [
    { x: 15, y: 70, r: "danger", size: 34 },
    { x: 30, y: 40, r: "safe", size: 26 },
    { x: 48, y: 60, r: "safe", size: 46 },
    { x: 62, y: 30, r: "danger", size: 30 },
    { x: 78, y: 55, r: "safe", size: 24 },
    { x: 88, y: 25, r: "danger", size: 40 },
    { x: 40, y: 85, r: "safe", size: 22 },
    { x: 68, y: 80, r: "danger", size: 28 },
  ];
  const edges = [
    [2, 0], [2, 1], [2, 3], [3, 5], [3, 4], [2, 6], [2, 7],
  ];

  return (
    <section className="section">
      <div className="section-head">
        <div className="eyebrow eyebrow-alt">ATTACK PATHS</div>
        <h2>Watch the breach before it happens.</h2>
        <p>Every exposed identity and asset, mapped as a live traversable graph.</p>
      </div>

      <div className="attackmap">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="attackmap-svg">
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
              stroke="rgba(93,169,255,0.35)"
              strokeWidth="0.3"
            />
          ))}
        </svg>
        {nodes.map((n, i) => (
          <div
            key={i}
            className={`map-node ${n.r}`}
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: n.size,
              height: n.size,
            }}
          >
            <AlertTriangle size={n.size * 0.4} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- How it works ------------------------- */
function HowItWorks() {
  return (
    <section className="section how">
      <div className="section-head">
        <div className="eyebrow eyebrow-alt">GETTING STARTED</div>
        <h2>From sign-up to secured, in five steps.</h2>
      </div>

      <div className="steps">
        {STEPS.map((s, i) => (
          <div className={`step-row ${i % 2 === 1 ? "reverse" : ""}`} key={i}>
            <div className="step-visual">
              <div className="step-icon">
                <s.icon size={30} />
              </div>
            </div>
            <div className="step-text">
              <div className="step-index">0{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Footer ------------------------------ */
function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="brand">
          <ShieldCheck size={20} color="#5da9ff" />
          <span>
            Cyber<span className="brand-accent">Intel</span>
          </span>
        </div>
        <p>Final-year cybersecurity intelligence platform — built to detect, explain, and respond.</p>
      </div>

      <div className="footer-cols">
        <div>
          <h4>Project</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/about"); }}>About the Project</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/goal"); }}>Goal &amp; Vision</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/goal"); }}>Roadmap</a>
        </div>
        <div>
          <h4>People</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/users"); }}>Users</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/builders"); }}>Builders</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/builders"); }}>Contributors</a>
        </div>
        <div>
          <h4>Access</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Hacker Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Admin Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/info/about"); }}>Contact Us</a>
        </div>
      </div>

      <div className="footer-bottom">© 2026 CyberIntel. Built for defense, not attack.</div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .app-root {
          background: #05060a;
          color: #eef2fb;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }
        h1, h2, h3, .brand, .headline, .section-head h2 {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }

        /* ---------- shared ---------- */
        .eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; letter-spacing: 0.14em; font-weight: 600;
          color: #5da9ff; background: rgba(93,169,255,0.08);
          border: 1px solid rgba(93,169,255,0.25);
          padding: 6px 12px; border-radius: 999px; text-transform: uppercase;
        }
        .eyebrow-alt { color: #ff5fa2; background: rgba(255,95,162,0.08); border-color: rgba(255,95,162,0.25); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff);
          color: #05060a; font-weight: 700; border: none;
          padding: 13px 22px; border-radius: 10px; cursor: pointer;
          font-size: 14px; transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 8px 24px rgba(93,169,255,0.25);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(255,95,162,0.3); }
        .btn-primary.sm { padding: 9px 16px; font-size: 13px; }

        .btn-ghost {
          background: transparent; color: #eef2fb;
          border: 1px solid rgba(238,242,251,0.25);
          padding: 13px 22px; border-radius: 10px; cursor: pointer; font-size: 14px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .btn-ghost:hover { border-color: #5da9ff; background: rgba(93,169,255,0.08); }

        .section { max-width: 1180px; margin: 0 auto; padding: 90px 24px; position: relative; z-index: 2; }
        .section-head { max-width: 640px; margin-bottom: 48px; }
        .section-head.center {
          max-width: 720px;
          margin: 0 auto 52px auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .section-head.center .eyebrow {
          margin-left: auto;
          margin-right: auto;
        }
        .section-head h2 { font-size: 32px; margin: 14px 0 10px; letter-spacing: -0.01em; }
        .section-head p { color: #9aa4bd; font-size: 15px; line-height: 1.6; }

        /* ---------- nav ---------- */
        .nav-wrap {
          position: sticky; top: 0; z-index: 50;
          background: rgba(5,6,10,0.75); backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-inner {
          max-width: 1280px; margin: 0 auto; padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
        }
        .brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; white-space: nowrap; }
        .brand-accent { color: #ff5fa2; }
        .nav-menu { display: flex; gap: 6px; flex: 1; justify-content: center; }
        .nav-item { position: relative; }
        .nav-btn {
          display: flex; align-items: center; gap: 4px; background: none; border: none;
          color: #cdd4e6; font-size: 14px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .dropdown {
          position: absolute; top: 40px; left: 0; min-width: 230px;
          background: #0d0f1a; border: 1px solid rgba(93,169,255,0.25);
          border-radius: 12px; padding: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .dropdown-item {
          padding: 10px 12px; border-radius: 8px; font-size: 13.5px; color: #cdd4e6; cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .dropdown-item:hover { background: rgba(93,169,255,0.1); color: #fff; }
        .nav-actions { display: flex; align-items: center; gap: 16px; white-space: nowrap; }
        .ghost-link { color: #9aa4bd; font-size: 13.5px; text-decoration: none; }
        .ghost-link:hover { color: #fff; }

        /* ---------- hero ---------- */
        .hero {
          position: relative; min-height: 92vh; display: flex; align-items: center;
          padding: 40px 24px; overflow: hidden;
        }
        .hero-glow { position: absolute; border-radius: 50%; filter: blur(90px); z-index: 0; opacity: 0.35; }
        .glow-blue { width: 480px; height: 480px; background: #3a7bff; top: -100px; right: -80px; }
        .glow-pink { width: 420px; height: 420px; background: #ff2f8f; bottom: -120px; left: -60px; }

        .shooting-star {
          position: absolute; left: -10%; width: 3px; height: 3px; border-radius: 50%;
          background: #fff; box-shadow: 0 0 6px 2px rgba(255,255,255,0.8);
          animation-name: shoot; animation-timing-function: linear; animation-iteration-count: infinite;
        }
        .shooting-star::before {
          content: ""; position: absolute; top: 50%; right: 0; width: 90px; height: 1px;
          background: linear-gradient(to left, rgba(255,255,255,0.9), transparent);
          transform: translateY(-50%);
        }
        @keyframes shoot {
          0% { transform: translate(0, 0); opacity: 0; }
          5% { opacity: 1; }
          100% { transform: translate(130vw, 60px); opacity: 0; }
        }

        .hero-content { position: relative; z-index: 2; max-width: 620px; }
        .headline { font-size: 40px; line-height: 1.28; font-weight: 700; margin: 18px 0 18px; letter-spacing: -0.01em; }
        .pill {
          display: inline-block; padding: 2px 10px; border-radius: 999px; font-weight: 600;
          border: 1px solid; margin: 0 2px;
        }
        .pill-blue { color: #7cbaff; border-color: rgba(124,186,255,0.5); background: rgba(93,169,255,0.08); }
        .pill-pink { color: #ff8fc0; border-color: rgba(255,143,192,0.5); background: rgba(255,95,162,0.08); }
        .subtext { color: #9aa4bd; font-size: 16px; line-height: 1.7; margin-bottom: 30px; max-width: 520px; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }

        .hero-orb-wrap {
          position: absolute; right: 6%; top: 50%; transform: translateY(-50%);
          width: 380px; height: 380px; z-index: 2;
        }
        .orb {
          width: 220px; height: 220px; border-radius: 40% 60% 55% 45% / 50% 45% 55% 50%;
          background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(93,169,255,0.5) 40%, rgba(255,95,162,0.4) 75%, transparent 100%);
          margin: 80px auto; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 90px rgba(93,169,255,0.5), 0 0 140px rgba(255,95,162,0.3);
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }

        .float-card {
          position: absolute; display: flex; gap: 10px; align-items: flex-start;
          background: rgba(13,15,26,0.85); border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(10px); border-radius: 14px; padding: 12px 14px; width: 200px;
          box-shadow: 0 14px 30px rgba(0,0,0,0.4); animation: float 5s ease-in-out infinite;
        }
        .card-1 { top: -10px; left: -60px; animation-delay: 0s; }
        .card-2 { bottom: 40px; right: -70px; animation-delay: 1.2s; }
        .card-3 { bottom: -50px; left: -20px; animation-delay: 2.4s; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .float-icon { width: 30px; height: 30px; min-width: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .float-icon.blue { background: rgba(93,169,255,0.15); color: #7cbaff; }
        .float-icon.pink { background: rgba(255,95,162,0.15); color: #ff8fc0; }
        .float-title { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
        .float-desc { font-size: 11.5px; color: #9aa4bd; line-height: 1.4; }

        /* ---------- features ---------- */
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; }
        .feature-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(93,169,255,0.4); }
        .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .feature-icon.blue { background: rgba(93,169,255,0.12); color: #7cbaff; }
        .feature-icon.pink { background: rgba(255,95,162,0.12); color: #ff8fc0; }
        .feature-card h3 { font-size: 16px; margin-bottom: 8px; }
        .feature-card p { font-size: 13.5px; color: #9aa4bd; line-height: 1.6; }

        /* ---------- dashboard mock ---------- */
        .dash-mock {
          background: #0a0c16; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 18px; box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .dash-topbar { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .dash-tabs { display: flex; gap: 18px; }
        .dash-tab { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #9aa4bd; }
        .dash-tab.active { color: #fff; }
        .dash-icons { display: flex; gap: 14px; color: #9aa4bd; }
        .dash-panels { display: grid; grid-template-columns: 1.1fr 1.4fr 1fr; gap: 14px; margin: 16px 0; }
        .dash-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; }
        .dash-panel.center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .panel-title { font-size: 12.5px; color: #9aa4bd; margin-bottom: 12px; font-weight: 600; }
        .cat-list { list-style: none; padding: 0; margin: 0; font-size: 13px; display: flex; flex-direction: column; gap: 8px; }
        .cat-list li { display: flex; align-items: center; gap: 8px; color: #cdd4e6; }
        .cat-list b { margin-left: auto; color: #fff; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.blue { background: #5da9ff; }
        .dot.pink { background: #ff5fa2; }
        .heatmap { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
        .heat-cell { aspect-ratio: 1; border-radius: 4px; background: linear-gradient(135deg, #5da9ff, #ff5fa2); }
        .ring { width: 110px; height: 110px; border-radius: 50%; background: conic-gradient(#ff5fa2 0turn, #5da9ff 0.7turn, rgba(255,255,255,0.08) 0.7turn); display: flex; align-items: center; justify-content: center; }
        .ring-inner { width: 78px; height: 78px; border-radius: 50%; background: #0a0c16; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ring-num { font-size: 20px; font-weight: 700; }
        .ring-label { font-size: 10px; color: #9aa4bd; }
        .dash-table table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
        .dash-table th { text-align: left; color: #9aa4bd; font-weight: 600; font-size: 11.5px; padding: 8px 10px; text-transform: uppercase; letter-spacing: 0.04em; }
        .dash-table td { padding: 10px; border-top: 1px solid rgba(255,255,255,0.06); color: #cdd4e6; }
        .risk-bar { width: 90px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
        .risk-fill { height: 100%; background: linear-gradient(90deg, #5da9ff, #ff5fa2); }
        .status-pill { font-size: 11px; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
        .status-pill.open { background: rgba(255,95,162,0.15); color: #ff8fc0; }
        .status-pill.progress { background: rgba(93,169,255,0.15); color: #7cbaff; }

        /* ---------- attack map ---------- */
        .attackmap {
          position: relative; height: 380px; background: #0a0c16;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden;
        }
        .attackmap-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .map-node {
          position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          transform: translate(-50%, -50%); border: 2px solid;
        }
        .map-node.safe { background: rgba(93,169,255,0.15); border-color: #5da9ff; color: #7cbaff; box-shadow: 0 0 20px rgba(93,169,255,0.4); }
        .map-node.danger { background: rgba(255,95,162,0.15); border-color: #ff5fa2; color: #ff8fc0; box-shadow: 0 0 20px rgba(255,95,162,0.4); animation: nodepulse 2s ease-in-out infinite; }
        @keyframes nodepulse { 0%,100% { box-shadow: 0 0 20px rgba(255,95,162,0.4); } 50% { box-shadow: 0 0 34px rgba(255,95,162,0.7); } }

        /* ---------- how it works ---------- */
        .steps { display: flex; flex-direction: column; gap: 60px; }
        .step-row { display: flex; align-items: center; gap: 40px; }
        .step-row.reverse { flex-direction: row-reverse; }
        .step-visual { flex: 0 0 140px; display: flex; justify-content: center; }
        .step-icon {
          width: 100px; height: 100px; border-radius: 24px;
          background: linear-gradient(135deg, rgba(93,169,255,0.15), rgba(255,95,162,0.15));
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center; color: #cdd4e6;
        }
        .step-text { flex: 1; }
        .step-index { font-size: 13px; color: #5da9ff; font-weight: 700; margin-bottom: 6px; }
        .step-text h3 { font-size: 20px; margin-bottom: 8px; }
        .step-text p { color: #9aa4bd; font-size: 14.5px; line-height: 1.7; max-width: 480px; }

        /* ---------- footer ---------- */
        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 60px 24px 30px; position: relative; z-index: 2; }
        .footer-top { max-width: 1180px; margin: 0 auto 40px; }
        .footer-top p { color: #9aa4bd; font-size: 14px; margin-top: 10px; max-width: 420px; }
        .footer-cols { max-width: 1180px; margin: 0 auto; display: flex; gap: 80px; flex-wrap: wrap; }
        .footer-cols h4 { font-size: 12px; color: #9aa4bd; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
        .footer-cols a { display: block; color: #cdd4e6; text-decoration: none; font-size: 14px; margin-bottom: 10px; }
        .footer-cols a:hover { color: #fff; }
        .footer-bottom { max-width: 1180px; margin: 50px auto 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12.5px; color: #6b7488; }

        @media (max-width: 900px) {
          .nav-menu, .nav-actions .ghost-link { display: none; }
          .hero-orb-wrap { display: none; }
          .headline { font-size: 30px; }
          .dash-panels { grid-template-columns: 1fr; }
          .step-row, .step-row.reverse { flex-direction: column; text-align: center; }
        }
      `}</style>

      <NavBar />
      <Hero />
      <Features />
      <DashboardPreview />
      <AttackMap />
      <HowItWorks />
      <Footer />
    </div>
  );
}