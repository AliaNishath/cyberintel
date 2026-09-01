import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, ArrowRight, ScanFace, Cpu, Radar, Activity, BarChart3,
  Code2, Sparkles, Lock, Puzzle, Rocket, Coffee, UserCog, Ghost, HeartHandshake,
  Briefcase, GraduationCap, MapPin, Target, TrendingUp, AlertTriangle, Fingerprint,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.jsx";

/* ---------------------------------------------------------
   Public info pages — no login required.
   Same content as the dashboard's About/Users/Builders/Goal
   pages, wrapped in a standalone public layout.
--------------------------------------------------------- */

function PageIntro({ eyebrow, tagline }) {
  return (
    <div className="page-intro">
      <div className="eyebrow-chip">{eyebrow}</div>
      <p className="page-tagline">{tagline}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="panel">
      <div className="panel-title">{title}</div>
      {children}
    </div>
  );
}

function VibeLine({ icon: Icon, children }) {
  return (
    <div className="vibe-line">
      <Icon size={14} /> {children}
    </div>
  );
}

function AboutContent() {
  return (
    <>
      <PageIntro eyebrow="THE PROJECT" tagline="A final-year cybersecurity major project — built to prove security tooling can be genuinely usable, not just technically impressive." />
      <Panel title="What is CyberIntel?">
        <p className="info-body">
          CyberIntel is a unified cybersecurity intelligence platform combining biometric
          authentication, AI-driven threat detection, real-time monitoring, and risk
          analysis into a single console. It was designed and built as a final-year
          major project by three Cybersecurity undergraduate students — a real working
          system with a real backend, real authentication, and a real AI assistant, not
          just a mockup.
        </p>
      </Panel>
      <Panel title="Why We Built This">
        <ul className="cat-list">
          <li><span className="dot blue" />Most academic security projects stop at a login page — we wanted a full working platform</li>
          <li><span className="dot pink" />To apply full-stack architecture end-to-end: frontend, backend, authentication, AI</li>
          <li><span className="dot blue" />To show that strong security doesn't have to mean poor usability</li>
          <li><span className="dot pink" />To build something genuinely presentable for placements and portfolios</li>
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
          <div className="mini-module"><Sparkles size={18} /> Gemini API (Assistant)</div>
        </div>
      </Panel>
      <Panel title="Project Timeline">
        <ul className="timeline-list">
          <li><Puzzle size={16} /> <div><b>Research & Planning</b><span>Scoping the 5 modules and studying real security dashboards</span></div></li>
          <li><Code2 size={16} /> <div><b>Frontend Build</b><span>Landing page, authentication flow, dashboard shell, AI widget</span></div></li>
          <li><Lock size={16} /> <div><b>Backend & Authentication</b><span>REST APIs, MongoDB, JWT, email OTP verification</span></div></li>
          <li><Sparkles size={16} /> <div><b>AI Integration</b><span>Connecting the assistant to real application data</span></div></li>
          <li><Rocket size={16} /> <div><b>Testing & Final Presentation</b><span>End-to-end testing and project defense</span></div></li>
        </ul>
      </Panel>
      <Panel title="Learn More — External Cyber Intelligence Resources">
        <div className="resource-list">
          <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <AlertTriangle size={16} /><div><b>Have I Been Pwned? (HIBP)</b><span>The global standard for checking email & password breaches</span></div>
          </a>
          <a href="https://xposedornot.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <ShieldCheck size={16} /><div><b>XposedOrNot</b><span>Open-source breach monitoring & privacy-first leak alerts</span></div>
          </a>
          <a href="https://dehashed.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Radar size={16} /><div><b>DeHashed OSINT</b><span>Deep search engine for breached databases and compromised credentials</span></div>
          </a>
          <a href="https://cavalier.hudsonrock.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Cpu size={16} /><div><b>Hudson Rock (Cavalier)</b><span>Database of credentials compromised by Infostealer malware</span></div>
          </a>
          <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <ShieldCheck size={16} /><div><b>OWASP Top 10</b><span>The most critical web application security risks</span></div>
          </a>
          <a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Radar size={16} /><div><b>MITRE ATT&CK Framework</b><span>A global knowledge base of real attacker tactics and techniques</span></div>
          </a>
          <a href="https://webauthn.guide/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <Fingerprint size={16} /><div><b>WebAuthn Guide</b><span>How real biometric web authentication works</span></div>
          </a>
        </div>
      </Panel>
    </>
  );
}

function UsersContent() {
  return (
    <>
      <PageIntro eyebrow="WHO'S IN HERE" tagline="Every account type is scoped to what that person actually needs to see and do." />
      <Panel title="Who Uses CyberIntel">
        <p className="info-body">
          Security admins monitor org-wide risk and manage access. Analysts investigate
          flagged anomalies and threat intel. Individual users manage their own
          biometric credentials, review their login history, and respond to alerts on
          their own accounts. Roles are enforced on the backend, not just hidden in
          the interface, so access is genuinely restricted.
        </p>
      </Panel>
      <div className="grid-2">
        <Panel title="Security Admin">
          <div className="persona-card">
            <UserCog size={22} />
            <p>Full visibility across every module. Can promote other accounts to Admin or Hacker roles, reviews org-wide risk score.</p>
          </div>
        </Panel>
        <Panel title="Security Analyst">
          <div className="persona-card">
            <Radar size={22} />
            <p>Lives in the AI Threat Detection and Risk pages. Investigates anomalies, triages alerts, writes incident notes.</p>
          </div>
        </Panel>
      </div>
      <div className="grid-2">
        <Panel title="Individual User">
          <div className="persona-card">
            <ScanFace size={22} />
            <p>Manages their own Face ID / fingerprint enrollment, checks login history, gets notified of unusual activity. The default role for every signup.</p>
          </div>
        </Panel>
        <Panel title="Ethical Hacker / Red Team">
          <div className="persona-card">
            <Ghost size={22} />
            <p>Uses the "Hacker Login" path to stress-test the platform, hunting for gaps before real attackers do. Granted only by an admin.</p>
          </div>
        </Panel>
      </div>
      <Panel title="A Day in the Life">
        <p className="info-body">
          8:45 AM — an analyst gets pinged about an impossible-travel login. 9:02 AM —
          they check the AI Threat page, confidence score reads 88%. 9:05 AM — they lock
          the account and message the user. 9:10 AM — turns out it was just someone on a
          VPN. False alarm, logged, dashboard updated.
        </p>
      </Panel>
      <VibeLine icon={HeartHandshake}>No matter your role, we made sure nobody needs a manual just to find the logout button.</VibeLine>
    </>
  );
}

function BuildersContent() {
  return (
    <>
      <PageIntro eyebrow="BEHIND THE SCENES" tagline="Three Cybersecurity students, one final-year major project, and a lot of debugging." />
      <Panel title="Built By">
        <p className="info-body">
          CyberIntel is the final-year major project of three Cybersecurity undergraduate
          students, built end to end — from architecture and authentication systems to
          AI-assisted threat analysis and the interface itself.
        </p>
        <div className="team-grid">
          <div className="team-card"><div className="team-avatar">AN</div><div><b>Aliya Nishath</b><span>Cybersecurity Student</span></div></div>
          <div className="team-card"><div className="team-avatar">V</div><div><b>Varshini</b><span>Cybersecurity Student</span></div></div>
          <div className="team-card"><div className="team-avatar">A</div><div><b>Ashraf</b><span>Cybersecurity Student</span></div></div>
        </div>
      </Panel>
      <Panel title="Skills Exercised">
        <div className="mini-module-grid">
          <div className="mini-module"><Code2 size={18} /> Frontend Architecture</div>
          <div className="mini-module"><Lock size={18} /> Authentication & Security</div>
          <div className="mini-module"><Sparkles size={18} /> AI Integration</div>
          <div className="mini-module"><BarChart3 size={18} /> Data Visualization</div>
          <div className="mini-module"><ShieldCheck size={18} /> Applied Cybersecurity Concepts</div>
        </div>
      </Panel>
      <Panel title="Acknowledgments">
        <p className="info-body">
          Thanks to our project guide and mentors, and to the open-source cybersecurity
          community whose documentation — OWASP, MITRE, and NIST among others — shaped
          how we approached this project.
        </p>
      </Panel>
      <VibeLine icon={GraduationCap}>Three students, one dashboard, zero passwords stored in plain text.</VibeLine>
    </>
  );
}

function GoalContent() {
  return (
    <>
      <PageIntro eyebrow="THE MISSION" tagline="Making enterprise-grade cybersecurity concepts approachable, demonstrable, and genuinely functional." />
      <Panel title="Our Mission">
        <p className="info-body">
          To prove that enterprise-grade security concepts — biometric authentication,
          live threat detection, risk scoring — can be packaged into a single, approachable
          dashboard, without needing a dozen disconnected tools. This project demonstrates
          applied cybersecurity knowledge through a real, working system.
        </p>
      </Panel>
      <Panel title="The Problem We're Solving">
        <p className="info-body">
          Most security tools are either powerful but painful to use, or simple but
          shallow. CyberIntel answers "are we okay right now?" in one glance, while
          still reflecting real security engineering practices underneath.
        </p>
      </Panel>
      <Panel title="Objectives">
        <ul className="cat-list">
          <li><span className="dot blue" />Unify authentication, detection, and reporting in one place</li>
          <li><span className="dot pink" />Make security data readable by non-experts</li>
          <li><span className="dot blue" />Demonstrate real AI-assisted triage grounded in actual data</li>
          <li><span className="dot pink" />Implement genuine biometric authentication via WebAuthn</li>
        </ul>
      </Panel>
      <Panel title="What's Next">
        <p className="info-body">
          Real threat and login data models, a calculated risk score, an AI assistant
          grounded in real user data, and WebAuthn-based biometric login.
        </p>
      </Panel>
      <VibeLine icon={Target}>Goal: fewer breaches, fewer headaches, and a dashboard people actually want to open.</VibeLine>
    </>
  );
}

const CONTENT = {
  about: { title: "About the Project", Component: AboutContent },
  users: { title: "Users", Component: UsersContent },
  builders: { title: "Builders", Component: BuildersContent },
  goal: { title: "Goal of the Project", Component: GoalContent },
};

export default function PublicInfoPage() {
  const { page } = useParams();
  const navigate = useNavigate();
  const entry = CONTENT[page] || CONTENT.about;
  const Content = entry.Component;

  return (
    <div className="public-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .public-root {
          min-height: 100vh; background: #05060a; color: #eef2fb;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        h1, h2, .public-brand { font-family: 'Space Grotesk', 'Inter', sans-serif; }
        .public-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; background: rgba(5,6,10,0.85); backdrop-filter: blur(12px); z-index: 10;
        }
        .public-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; cursor: pointer; }
        .brand-accent { color: #ff5fa2; }
        .public-nav-right { display: flex; align-items: center; gap: 18px; }
        .back-link {
          display: flex; align-items: center; gap: 6px; background: none; border: none;
          color: #9aa4bd; font-size: 13.5px; cursor: pointer;
        }
        .back-link:hover { color: #fff; }
        .get-started-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff); color: #05060a; font-weight: 700;
          border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-size: 13.5px;
        }

        .public-tabs { display: flex; gap: 8px; padding: 20px 28px 0; flex-wrap: wrap; }
        .public-tab {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); color: #9aa4bd;
          padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 13px;
        }
        .public-tab.active {
          background: linear-gradient(135deg, rgba(255,95,162,0.18), rgba(93,169,255,0.18));
          color: #fff; border-color: rgba(93,169,255,0.4);
        }

        .public-content { max-width: 880px; margin: 0 auto; padding: 26px 28px 80px; display: flex; flex-direction: column; gap: 18px; }

        .page-intro { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
        .eyebrow-chip {
          display: inline-flex; width: fit-content; font-size: 11px; letter-spacing: 0.12em; font-weight: 700;
          color: #ff8fc0; background: rgba(255,95,162,0.1); border: 1px solid rgba(255,95,162,0.3);
          padding: 5px 12px; border-radius: 999px; text-transform: uppercase;
        }
        .page-tagline { color: #9aa4bd; font-size: 14.5px; line-height: 1.6; }

        .panel {
          background: rgba(255,255,255,0.025); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 20px;
        }
        .panel-title { font-size: 14px; font-weight: 600; margin-bottom: 14px; }
        .info-body { color: #9aa4bd; font-size: 14px; line-height: 1.8; margin: 0; }
        .cat-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13.5px; color: #cdd4e6; }
        .cat-list li { display: flex; align-items: center; gap: 8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dot.blue { background: #5da9ff; }
        .dot.pink { background: #ff5fa2; }
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
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .persona-card { display: flex; flex-direction: column; gap: 10px; color: #7cbaff; }
        .persona-card p { color: #9aa4bd; font-size: 13.5px; line-height: 1.7; margin: 0; }
        .vibe-line { display: flex; align-items: center; gap: 8px; color: #ff8fc0; font-size: 13px; font-weight: 600; padding: 4px; }

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

        @media (max-width: 700px) {
          .grid-2, .mini-module-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="public-nav">
        <div className="public-brand" onClick={() => navigate("/")}>
          <ShieldCheck size={20} color="#5da9ff" />
          Cyber<span className="brand-accent">Intel</span>
        </div>
        <div className="public-nav-right">
          <LanguageSelector compact />
          <button className="back-link" onClick={() => navigate("/")}>
            <ArrowLeft size={15} /> Back to Home
          </button>
          <button className="get-started-btn" onClick={() => navigate("/auth")}>
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="public-tabs">
        {Object.entries(CONTENT).map(([key, { title }]) => (
          <button
            key={key}
            className={`public-tab ${page === key || (!page && key === "about") ? "active" : ""}`}
            onClick={() => navigate(`/info/${key}`)}
          >
            {title}
          </button>
        ))}
      </div>

      <div className="public-content">
        <Content />
      </div>
    </div>
  );
}