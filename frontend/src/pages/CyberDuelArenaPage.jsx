import React, { useState, useEffect, useRef } from "react";
import {
  Swords,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  AlertTriangle,
  Cpu,
  Layers,
  Radio,
  FileCode,
  CheckCircle2,
  Lock,
  Server,
  Crosshair,
  Sliders,
  Brain,
  Volume2,
} from "lucide-react";
import { speakText, stopSpeaking } from "../utils/voiceAssistant.js";

const SCENARIOS = [
  {
    id: "sqli",
    title: "SQL Injection & Auth Bypass",
    mitre: "T1190 - Exploit Public Application",
    desc: "Red Team exploits vulnerable query parameters to dump the user credentials table.",
    rounds: [
      {
        r: 1,
        red: "Probe: Sending boolean tautology payload `' OR '1'='1' --` to `/api/auth/login`",
        redPayload: "POST /api/auth/login HTTP/1.1\nHost: target.internal\nPayload: email=' OR '1'='1' --",
        plainRed: "Attacker types a fake master-password command (' OR '1'='1') into the login box to trick the database into letting them in without a password.",
        blue: "Detection: Heuristic SQL parser flags unescaped quote delimiter. Enforcing prepared statements.",
        blueRule: "DB.query('SELECT * FROM users WHERE email = $1', [email])",
        plainBlue: "Security guard notices the tricky quote mark and puts the input inside a safe, locked container (Prepared Statement) so it cannot execute commands.",
        blueScore: 18,
        redScore: 10,
      },
      {
        r: 2,
        red: "Escalation: Attempting UNION SELECT schema enumeration across information_schema.",
        redPayload: "' UNION SELECT 1, table_name, column_name FROM information_schema.columns --",
        plainRed: "Attacker asks the database to secretly list all stored table names and column headers.",
        blue: "Countermeasure: WAF Regex filter `(?i)(union\\s+select)` triggered. Inbound request dropped (HTTP 403).",
        blueRule: "iptables -A INPUT -m string --algo bm --string 'UNION SELECT' -j DROP",
        plainBlue: "Web Application Firewall catches the 'UNION SELECT' keyword pattern and drops the attacker's connection immediately.",
        blueScore: 22,
        redScore: 8,
      },
      {
        r: 3,
        red: "Evasion: Attempting hex-encoded nested bypass `UN/**/ION%20SEL/**/ECT`.",
        plainRed: "Attacker scrambles their words into hexadecimal and comments to sneak past standard keyword filters.",
        blue: "Countermeasure: Deep packet inspection (DPI) normalizes URL-encoded hex strings before routing.",
        blueRule: "WAF_NORMALIZE_PASS(payload) -> Blocked signature 0x53514C",
        plainBlue: "Deep Packet Inspector unscrambles the hidden text before reading it, catching and blocking the disguised trick.",
        blueScore: 20,
        redScore: 5,
      },
      {
        r: 4,
        red: "Brute-force: Fuzzing error-based timing injection `pg_sleep(10)` on user ID query.",
        plainRed: "Attacker tells the database to pause for 10 seconds to figure out valid user accounts based on delayed response time.",
        blue: "Countermeasure: Query timeout ceiling enforced at 400ms. Database connection pooled in sandbox.",
        blueRule: "ALTER ROLE app_user SET statement_timeout = '400ms';",
        plainBlue: "Server enforces a strict 0.4-second cutoff ceiling, cutting the connection before the attacker can measure the delay.",
        blueScore: 20,
        redScore: 6,
      },
      {
        r: 5,
        red: "Retreat: Zero actionable database leakage achieved. Attack vector fully sealed.",
        plainRed: "Attacker gives up because every trick was blocked with zero stolen data.",
        blue: "Mitigation: Automated incident report logged to SOC. Adversary IP quarantined in blocklist.",
        blueRule: "SOC_LOG_INCIDENT('MITRE-T1190', 'NEUTRALIZED', '100% Deflection')",
        plainBlue: "System adds the attacker's IP to the permanent ban list and files a clean incident report.",
        blueScore: 20,
        redScore: 2,
      },
    ],
  },
  {
    id: "spray",
    title: "Credential Stuffing & Password Spray",
    mitre: "T1110.001 - Password Spraying",
    desc: "Red Team launches automated high-velocity login attacks using leaked password combos.",
    rounds: [
      {
        r: 1,
        red: "Probe: Ingesting 2,500 leaked email/password pairs across 40 distributed proxies.",
        redPayload: "Mass auth requests arriving from 185.220.101.0/24 subnet",
        plainRed: "Attacker feeds 2,500 leaked passwords from old website breaches into an automated bot to test against your accounts.",
        blue: "Detection: Velocity anomaly detected on `/api/auth/login` (>15 attempts/sec).",
        blueRule: "RATE_LIMIT_GATEWAY.window(60s).max(5)",
        plainBlue: "System detects an unnatural flood of login attempts (>15/sec) and slows down the login doorway with rate-limiting.",
        blueScore: 16,
        redScore: 12,
      },
      {
        r: 2,
        red: "Adaptive: Slowing request velocity to 1 req/5s per IP to bypass naive rate-limiters.",
        redPayload: "Low-and-slow distributed spray targeting 120 corporate accounts",
        plainRed: "Attacker slows their bot down to 1 try every 5 seconds to try and look like a patient human user.",
        blue: "Countermeasure: Behavioral entropy engine flags identical user-agent headers across disparate IPs.",
        blueRule: "FINGERPRINT_BAN('JA3-Hash: 72a5d91c0e44', duration='24h')",
        plainBlue: "AI behavioral engine notices that all requests share the exact same hidden digital browser signature and bans them.",
        blueScore: 22,
        redScore: 8,
      },
      {
        r: 3,
        red: "Proxy Rotation: Spawning rotating residential egress proxies across 12 countries.",
        plainRed: "Attacker bounces their traffic through proxy computers in 12 different countries to hide their real location.",
        blue: "Countermeasure: Deploying autonomous CAPTCHA & WebAuthn step-up challenge.",
        blueRule: "ENFORCE_MFA_STEPUP(auth_risk_score > 65)",
        plainBlue: "System requires a mandatory Face ID / Fingerprint biometric passkey prompt that automated bots cannot pass.",
        blueScore: 22,
        redScore: 6,
      },
      {
        r: 4,
        red: "Exploit: Attempting password reset token brute force on targeted admin accounts.",
        plainRed: "Attacker tries repeatedly guessing the 6-digit password reset recovery codes.",
        blue: "Countermeasure: Dynamic rate limiter locks password reset endpoint with HMAC-SHA256 tokens.",
        blueRule: "TOKEN_TTL = 180s; MAX_FAIL_ATTEMPTS = 3;",
        plainBlue: "System locks the password recovery door after 3 failed attempts and expires the temporary token.",
        blueScore: 20,
        redScore: 4,
      },
      {
        r: 5,
        red: "Defeat: 0 accounts compromised. 100% of brute-force tokens rejected.",
        plainRed: "Attacker fails completely. Zero accounts were accessed.",
        blue: "Mitigation: Target accounts placed on high-vigilance monitoring. Subnet blocklist deployed.",
        blueRule: "SOC_INCIDENT_RESOLVED('T1110', 'Zero breaches')",
        plainBlue: "High-vigilance monitoring enabled on all target accounts. Network perimeter 100% secure.",
        blueScore: 20,
        redScore: 1,
      },
    ],
  },
  {
    id: "jwt",
    title: "JWT Forgery & Privilege Escalation",
    mitre: "T1078 - Valid Accounts Hijack",
    desc: "Red Team tampers with token signatures (`alg: none`) to hijack root administrator access.",
    rounds: [
      {
        r: 1,
        red: "Probe: Modifying JWT header to `alg: none` and setting `role: admin`.",
        redPayload: '{"alg":"none","typ":"JWT"}.{"id":"u1","role":"admin"}.',
        plainRed: "Attacker creates a fake digital ID card claiming to be 'Administrator' and erases the official security signature.",
        blue: "Detection: JWT verifier strictly forbids unsigned algorithms. Authentication rejected (HTTP 401).",
        blueRule: "jwt.verify(token, SECRET, { algorithms: ['HS256', 'RS256'] })",
        plainBlue: "Token verifier strictly checks for official cryptographic signatures and rejects the unsigned fake badge.",
        blueScore: 20,
        redScore: 8,
      },
      {
        r: 2,
        red: "Key Confusion: Crafting HMAC-SHA256 token signed with server's public RSA key.",
        redPayload: "HS256(payload, PUBLIC_KEY_PEM_AS_SECRET)",
        plainRed: "Attacker tries signing the fake badge using the server's public certificate.",
        blue: "Countermeasure: Strict asymmetric key isolation prevents algorithm confusion attacks.",
        blueRule: "VERIFY_KEY_TYPE_MATCH(algorithm, key_format)",
        plainBlue: "System uses strict asymmetric key separation, preventing public keys from being misused as private secret keys.",
        blueScore: 22,
        redScore: 7,
      },
      {
        r: 3,
        red: "Replay: Replaying captured legitimate user token with manipulated expiration claim.",
        plainRed: "Attacker tries using an old expired digital badge by altering the expiration date text.",
        blue: "Countermeasure: Real-time token revocation denylist queried via Redis memory cache in 0.8ms.",
        blueRule: "REDIS_CHECK_JTI(token.jti) -> INVALIDATED",
        plainBlue: "High-speed memory database checks the badge ID in 0.8 milliseconds and confirms it was already revoked.",
        blueScore: 20,
        redScore: 5,
      },
      {
        r: 4,
        red: "Injection: Injecting malformed JWKS URI `jwks_uri: http://attacker.com/keys`.",
        plainRed: "Attacker tells the server to verify badges using an outside hacker key server.",
        blue: "Countermeasure: Fixed internal JWKS whitelist strictly blocks external key fetching.",
        blueRule: "ASSERT_JWKS_DOMAIN('auth.cyberintel.internal')",
        plainBlue: "Server strictly blocks connecting to untrusted outside websites for security keys.",
        blueScore: 20,
        redScore: 3,
      },
      {
        r: 5,
        red: "Neutralized: No privilege escalation occurred. Root accounts remain fully protected.",
        plainRed: "Attacker is fully locked out with zero administrative access.",
        blue: "Mitigation: Automatic cryptographic key rollover triggered across all clusters.",
        blueRule: "TRIGGER_KEY_ROTATION(); REVOKE_ALL_SESSIONS();",
        plainBlue: "System rotates all cryptographic encryption keys automatically to stay 10 steps ahead.",
        blueScore: 18,
        redScore: 2,
      },
    ],
  },
];

export default function CyberDuelArenaPage() {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [isBattling, setIsBattling] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [redLogs, setRedLogs] = useState([]);
  const [blueLogs, setBlueLogs] = useState([]);
  const [blueScore, setBlueScore] = useState(50);
  const [battleComplete, setBattleComplete] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [plainMode, setPlainMode] = useState(false);

  const battleIntervalRef = useRef(null);

  const handleStartDuel = () => {
    if (isBattling) return;
    setIsBattling(true);
    setBattleComplete(false);
    setCurrentRound(0);
    setRedLogs([]);
    setBlueLogs([]);
    setBlueScore(50);
    setShieldActive(false);

    let roundIdx = 0;
    const rounds = selectedScenario.rounds;

    battleIntervalRef.current = setInterval(() => {
      if (roundIdx >= rounds.length) {
        clearInterval(battleIntervalRef.current);
        setIsBattling(false);
        setBattleComplete(true);
        return;
      }

      const rData = rounds[roundIdx];
      setCurrentRound(rData.r);

      // Red Team Attack Phase
      setRedLogs((prev) => [
        {
          r: rData.r,
          tech: `[Round ${rData.r}] 🔴 OFFENSE: ${rData.red}`,
          payload: rData.redPayload ? `   > Payload: ${rData.redPayload}` : null,
          plain: `[Round ${rData.r}] 🔴 ATTACK: ${rData.plainRed}`,
        },
        ...prev,
      ]);

      // Blue Team Defense Phase with slight delay
      setTimeout(() => {
        setShieldActive(true);
        setBlueLogs((prev) => [
          {
            r: rData.r,
            tech: `[Round ${rData.r}] 🔵 DEFENSE: ${rData.blue}`,
            rule: rData.blueRule ? `   > Applied Rule: ${rData.blueRule}` : null,
            plain: `[Round ${rData.r}] 🔵 DEFENSE: ${rData.plainBlue}`,
          },
          ...prev,
        ]);
        setBlueScore((s) => Math.min(96, Math.max(10, s + (rData.blueScore - rData.redScore))));

        setTimeout(() => setShieldActive(false), 600);
      }, 700);

      roundIdx += 1;
    }, 2200);
  };

  const handleReset = () => {
    if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
    stopSpeaking();
    setIsBattling(false);
    setBattleComplete(false);
    setCurrentRound(0);
    setRedLogs([]);
    setBlueLogs([]);
    setBlueScore(50);
    setShieldActive(false);
  };

  useEffect(() => {
    return () => {
      if (battleIntervalRef.current) clearInterval(battleIntervalRef.current);
      stopSpeaking();
    };
  }, []);

  return (
    <div className="duel-page">
      <style>{`
        .duel-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #eef2fb;
        }
        .duel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .duel-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ff4757;
          background: rgba(255, 71, 87, 0.12);
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 71, 87, 0.3);
          width: fit-content;
        }
        .duel-headline {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 4px 0 0 0;
        }
        .duel-tagline {
          font-size: 13px;
          color: #9aa4bd;
          margin: 4px 0 0 0;
        }
        .scenario-selector-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          background: rgba(13, 15, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 14px;
          border-radius: 14px;
        }
        .scenario-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9aa4bd;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .scenario-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }
        .scenario-btn.active {
          background: linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(93, 169, 255, 0.2));
          border-color: #5da9ff;
          color: #fff;
          box-shadow: 0 0 16px rgba(93, 169, 255, 0.2);
        }
        .supremacy-arena-card {
          background: rgba(13, 15, 26, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
        }
        .supremacy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .team-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
        }
        .team-badge.red { color: #ff4757; }
        .team-badge.blue { color: #5da9ff; }
        .supremacy-track {
          height: 18px;
          background: rgba(255, 71, 87, 0.4);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .supremacy-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff4757, #5da9ff);
          border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .duel-consoles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        @media (max-width: 850px) {
          .duel-consoles-grid { grid-template-columns: 1fr; }
        }
        .console-box {
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 280px;
          max-height: 340px;
          overflow-y: auto;
          font-size: 12.5px;
          line-height: 1.5;
        }
        .console-box.red {
          background: rgba(30, 8, 12, 0.85);
          border: 1px solid rgba(255, 71, 87, 0.35);
          color: #ff8a95;
        }
        .console-box.blue {
          background: rgba(8, 20, 35, 0.85);
          border: 1px solid rgba(93, 169, 255, 0.35);
          color: #a5d8ff;
        }
        .console-head {
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .console-head.red { color: #ff4757; }
        .console-head.blue { color: #5da9ff; }
        .log-entry-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 6px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.02);
          border-left: 2px solid transparent;
        }
        .console-box.red .log-entry-item { border-left-color: #ff4757; }
        .console-box.blue .log-entry-item { border-left-color: #5da9ff; }
        .btn-start-duel {
          background: linear-gradient(135deg, #ff4757, #5da9ff);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
          transition: all 0.2s ease;
        }
        .btn-start-duel:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(93, 169, 255, 0.5);
        }
        .btn-start-duel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .victory-card {
          background: rgba(46, 213, 115, 0.12);
          border: 1px solid rgba(46, 213, 115, 0.4);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="duel-header">
        <div>
          <div className="duel-eyebrow">
            <Swords size={12} /> ADVERSARIAL AI WARGAME ENGINE
          </div>
          <h1 className="duel-headline">AI Cyber Duel Arena (Red vs. Blue)</h1>
          <p className="duel-tagline">
            Autonomous offensive AI attacks simulated against adaptive blue-team SOC defense countermeasures in real time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn-start-duel"
            onClick={handleStartDuel}
            disabled={isBattling}
          >
            {isBattling ? <Radio size={16} className="spin" /> : <Play size={16} />}
            {isBattling ? `Fighting Round ${currentRound}/5...` : "Start AI Cyber Duel"}
          </button>

          <button
            className="btn-ghost-sec"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#cdd4e6",
              padding: "11px 14px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
            onClick={handleReset}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="scenario-selector-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9aa4bd", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Target Scenario:
          </span>
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              className={`scenario-btn ${selectedScenario.id === sc.id ? "active" : ""}`}
              onClick={() => {
                if (!isBattling) {
                  setSelectedScenario(sc);
                  handleReset();
                }
              }}
            >
              {sc.title}
            </button>
          ))}
        </div>

        <button
          className={`eli5-toggle-btn ${plainMode ? "active" : ""}`}
          onClick={() => setPlainMode((p) => !p)}
          title="Toggle Plain English / Non-technical Explanations"
          style={{ padding: "8px 14px" }}
        >
          <Brain size={14} color={plainMode ? "#5da9ff" : "#9aa4bd"} />
          <span>{plainMode ? "🧠 Plain Language: ON" : "⚙️ Technical Jargon"}</span>
        </button>
      </div>

      <div className="supremacy-arena-card">
        <div className="supremacy-header">
          <div className="team-badge red">
            <Flame size={18} /> RED TEAM AI (Autonomous Offense)
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#9aa4bd", fontWeight: 600 }}>
              SECURITY SUPREMACY BALANCE
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: blueScore >= 50 ? "#5da9ff" : "#ff4757" }}>
              {blueScore}% Blue Defense Dominance
            </div>
          </div>

          <div className="team-badge blue">
            <ShieldCheck size={18} /> BLUE TEAM AI (Adaptive Defense)
          </div>
        </div>

        <div className="supremacy-track">
          <div className="supremacy-fill" style={{ width: `${blueScore}%` }} />
        </div>

        <div className="duel-consoles-grid">
          {/* Red Team Terminal */}
          <div className="console-box red">
            <div className="console-head red">
              <span>🔴 Red Team Infiltration Log</span>
              <span>{plainMode ? "Mode: Plain English" : `MITRE: ${selectedScenario.mitre.split(" - ")[0]}`}</span>
            </div>
            {redLogs.length === 0 ? (
              <span style={{ color: "#8a5057" }}>
                &gt; Red Team agent standing by. Click "Start AI Cyber Duel" to launch attack vector...
              </span>
            ) : (
              redLogs.map((log, i) => (
                <div className="log-entry-item" key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: plainMode ? 600 : 400, color: plainMode ? "#fff" : "#ff8a95" }}>
                      {plainMode ? log.plain : log.tech}
                    </span>
                    <button
                      className="btn-mini-speaker"
                      onClick={() => speakText(plainMode ? log.plain : log.tech)}
                      title="Listen aloud"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                  {!plainMode && log.payload && (
                    <div style={{ color: "#ffb8bf", fontSize: 11, fontFamily: "monospace" }}>{log.payload}</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Blue Team Terminal */}
          <div className="console-box blue">
            <div className="console-head blue">
              <span>🔵 Blue Team Defense Log</span>
              <span>{shieldActive ? "🛡️ DEFENSE ACTIVE" : "MONITORING"}</span>
            </div>
            {blueLogs.length === 0 ? (
              <span style={{ color: "#456a88" }}>
                &gt; SOC heuristic defense grid listening on all interfaces...
              </span>
            ) : (
              blueLogs.map((log, i) => (
                <div className="log-entry-item" key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: plainMode ? 600 : 400, color: plainMode ? "#fff" : "#a5d8ff" }}>
                      {plainMode ? log.plain : log.tech}
                    </span>
                    <button
                      className="btn-mini-speaker"
                      onClick={() => speakText(plainMode ? log.plain : log.tech)}
                      title="Listen aloud"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                  {!plainMode && log.rule && (
                    <div style={{ color: "#70b6ff", fontSize: 11, fontFamily: "monospace" }}>{log.rule}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {battleComplete && (
          <div className="victory-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={24} color="#2ed573" />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  🎉 Cyber Duel Concluded: Blue Team Defenses Victorious!
                </div>
                <div style={{ fontSize: 12.5, color: "#a5d8ff", marginTop: 2 }}>
                  Deflection Rate: <b>96.4%</b> • 0 Breaches Allowed • Mean Time to Mitigate: <b>0.7s</b>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#2ed573", fontWeight: 700 }}>
              ✓ MITRE ATT&CK Mitigation Verified
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
