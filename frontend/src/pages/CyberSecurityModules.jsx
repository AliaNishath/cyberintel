import React, { useState, useEffect } from "react";
import {
  Database,
  ShieldAlert,
  ShieldCheck,
  Search,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  MapPin,
  Cpu,
  Radio,
  Server,
  Zap,
  HelpCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import API_BASE_URL from "../config/api.js";

/* ---------------------------------------------------------
   Shared UI Helpers for Cyber Security Modules
--------------------------------------------------------- */
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

function VibeLine({ icon: Icon = Sparkles, children }) {
  return (
    <div className="vibe-line">
      <Icon size={14} /> {children}
    </div>
  );
}

/* =========================================================================
   MODULE 1: DATA BREACH & ACCOUNT LEAK CHECKER (Live Tool + Top 10 Directory)
   ========================================================================= */
export function BreachCheckerPage() {
  const [activeSubTab, setActiveSubTab] = useState("account"); // 'account' | 'pwned-password' | 'websites'
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [breachResult, setBreachResult] = useState(null);
  const [error, setError] = useState("");

  // Pwned Password sub-tab state
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordResult, setPasswordResult] = useState(null);
  const [passError, setPassError] = useState("");

  // Directory of breach checking websites
  const [websites, setWebsites] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(true);
  const [siteFilterCategory, setSiteFilterCategory] = useState("All");
  const [siteSearch, setSiteSearch] = useState("");

  // Load curated breach websites
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tools/breach-websites`)
      .then((res) => res.json())
      .then((data) => {
        if (data.websites) setWebsites(data.websites);
      })
      .catch(() => setWebsites([]))
      .finally(() => setWebsitesLoading(false));
  }, []);

  // Quick preset email lookup
  const runPresetCheck = (email) => {
    setQuery(email);
    handleAccountCheck(email);
  };

  const handleAccountCheck = async (targetEmail) => {
    const q = (targetEmail || query).trim();
    if (!q || checking) return;
    setChecking(true);
    setError("");
    setBreachResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/check-breach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, type: "email" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check breach databases");
      setBreachResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handlePasswordCheck = async () => {
    if (!passwordInput || checkingPassword) return;
    setCheckingPassword(true);
    setPassError("");
    setPasswordResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/check-pwned-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password check failed");
      setPasswordResult(data);
    } catch (err) {
      setPassError(err.message);
    } finally {
      setCheckingPassword(false);
    }
  };

  // Secure Passphrase Generator
  const generatePassphrase = () => {
    const words = [
      "Vortex", "Cipher", "Falcon", "Quantum", "Shield", "Sentinel", "Nebula", "Matrix",
      "Obsidian", "Aurora", "Titan", "Cyber", "Enigma", "Apex", "Krypton", "Echo"
    ];
    const specialChars = ["!", "@", "#", "$", "%", "^", "&", "*"];
    const w1 = words[Math.floor(Math.random() * words.length)];
    const w2 = words[Math.floor(Math.random() * words.length)];
    const w3 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 900 + 100);
    const sym = specialChars[Math.floor(Math.random() * specialChars.length)];
    const generated = `${w1}-${w2}-${w3}${sym}${num}`;
    setPasswordInput(generated);
    setShowPassword(true);
  };

  const categories = ["All", "Email & Password Breaches", "Open-Source Breach Intelligence", "Deep Breach Asset Search", "Dark Web & Paste Sites Search", "Infostealer Malware Leaks", "Automated Consumer Protection"];

  const filteredWebsites = websites.filter((site) => {
    const matchesCat = siteFilterCategory === "All" || site.category === siteFilterCategory;
    const matchesSearch =
      !siteSearch ||
      site.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
      site.description.toLowerCase().includes(siteSearch.toLowerCase()) ||
      site.supportedQueries.some((sq) => sq.toLowerCase().includes(siteSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <PageIntro
        eyebrow="CYBER SECURITY INTELLIGENCE"
        tagline="Check if personal or corporate accounts have been exposed in global data breaches, search pwned passwords, and explore verified breach monitoring platforms."
      />

      <TipCallout icon={Database} title="Dark Web & Breach Telemetry">
        Over 15+ billion compromised credentials circulate on illicit cybercrime marketplaces and infostealer dumps.
        This hub queries active threat telemetry and provides direct shortcuts to the world's leading breach detection authorities.
      </TipCallout>

      {/* Sub-Tab Navigation */}
      <div className="tab-pill-bar">
        <button
          className={`tab-pill ${activeSubTab === "account" ? "active" : ""}`}
          onClick={() => setActiveSubTab("account")}
        >
          <Search size={15} /> Account & Email Leak Scanner
        </button>
        <button
          className={`tab-pill ${activeSubTab === "pwned-password" ? "active" : ""}`}
          onClick={() => setActiveSubTab("pwned-password")}
        >
          <KeyRound size={15} /> Pwned Passwords Zero-Knowledge Check
        </button>
        <button
          className={`tab-pill ${activeSubTab === "websites" ? "active" : ""}`}
          onClick={() => setActiveSubTab("websites")}
        >
          <Globe size={15} /> Verified Leak Check Websites ({websites.length || 10})
        </button>
      </div>

      {/* SUB-TAB 1: ACCOUNT LEAK SCANNER */}
      {activeSubTab === "account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Scan Account for Compromised Data">
            <div style={{ display: "flex", gap: 10 }}>
              <div className="field-inline">
                <Search size={16} />
                <input
                  placeholder="Enter email address (e.g. employee@company.com, user@gmail.com)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAccountCheck()}
                />
              </div>
              <button
                className="btn-outline active"
                style={{ padding: "0 22px", whiteSpace: "nowrap" }}
                onClick={() => handleAccountCheck()}
                disabled={checking}
              >
                {checking ? <RefreshCw className="spin" size={15} /> : <Search size={15} />}
                {checking ? " Scanning..." : " Check Leaks"}
              </button>
            </div>

            {/* Presets */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span className="muted small">Quick Test Examples:</span>
              <button className="tag-chip" onClick={() => runPresetCheck("test@example.com")}>test@example.com</button>
              <button className="tag-chip" onClick={() => runPresetCheck("admin@adobe.com")}>admin@adobe.com</button>
              <button className="tag-chip" onClick={() => runPresetCheck("pwned@gmail.com")}>pwned@gmail.com</button>
            </div>

            {error && <p className="muted" style={{ color: "#ff8fc0", marginTop: 12 }}>{error}</p>}

            {/* Results Display */}
            {breachResult && (
              <div style={{ marginTop: 20 }}>
                {breachResult.isPwned ? (
                  <div className="breach-banner danger">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="breach-icon danger">
                        <ShieldAlert size={28} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#ff8fc0" }}>
                          Account Compromised in {breachResult.breachCount} Data Breach{breachResult.breachCount > 1 ? "es" : ""}!
                        </div>
                        <div className="muted small" style={{ marginTop: 3 }}>
                          Identified records matching <b style={{ color: "#eef2fb" }}>{breachResult.query}</b> across indexed leak dumps.
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: breachResult.riskScore >= 75 ? "#ff5fa2" : "#ffb84d" }}>
                          {breachResult.riskScore}/100
                        </div>
                        <span className={`status-pill ${breachResult.riskScore >= 75 ? "bad" : "warn"}`}>
                          {breachResult.riskLevel} Exposure Risk
                        </span>
                      </div>
                    </div>

                    {/* Exposed Data Classes */}
                    {breachResult.exposedDataClasses && breachResult.exposedDataClasses.length > 0 && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="muted small" style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Exposed Personal Information Types:
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {breachResult.exposedDataClasses.map((dc, i) => (
                            <span key={i} className={`tag ${dc.toLowerCase().includes("password") || dc.toLowerCase().includes("payment") ? "bad" : "warn"}`}>
                              {dc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="breach-banner clean">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="breach-icon clean">
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#7fd68a" }}>
                          Good News — No Known Breaches Found!
                        </div>
                        <div className="muted small" style={{ marginTop: 3 }}>
                          No publicly leaked records were found for <b style={{ color: "#eef2fb" }}>{breachResult.query}</b>.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of specific breaches */}
                {breachResult.breaches && breachResult.breaches.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#eef2fb" }}>
                      Incident Breakdown ({breachResult.breaches.length} Breaches)
                    </div>
                    <div className="breach-grid">
                      {breachResult.breaches.map((b, i) => (
                        <div key={i} className="breach-card">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="breach-avatar">{b.name.slice(0, 2).toUpperCase()}</div>
                              <div>
                                <b style={{ fontSize: 14, color: "#eef2fb" }}>{b.name}</b>
                                <div className="muted small">{b.domain}</div>
                              </div>
                            </div>
                            <span className={`status-pill ${b.severity === "Critical" ? "bad" : "warn"}`}>
                              {b.severity || "High"}
                            </span>
                          </div>

                          <p style={{ fontSize: 12.5, color: "#9aa4bd", margin: "10px 0 12px", lineHeight: 1.5 }}>
                            {b.description}
                          </p>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "#6b7488", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                            <span>Incident Date: <b style={{ color: "#cdd4e6" }}>{b.breachDate}</b></span>
                            <span>Compromised Accounts: <b style={{ color: "#7cbaff" }}>{Number(b.pwnCount).toLocaleString()}</b></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remediation Action Plan */}
                {breachResult.recommendations && breachResult.recommendations.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#eef2fb" }}>
                      Immediate Incident Response & Mitigation Steps
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {breachResult.recommendations.map((rec, i) => (
                        <div key={i} className="rec-card">
                          <span className={`rec-priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                          <div>
                            <b style={{ color: "#eef2fb", fontSize: 13.5 }}>{rec.title}</b>
                            <p style={{ color: "#9aa4bd", fontSize: 12.5, margin: "3px 0 0", lineHeight: 1.5 }}>
                              {rec.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* SUB-TAB 2: PWNED PASSWORDS CHECKER (ZERO-KNOWLEDGE) */}
      {activeSubTab === "pwned-password" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Pwned Password Zero-Knowledge Check (HIBP k-Anonymity)">
            <p className="info-body" style={{ marginBottom: 14 }}>
              Check if your password exists in over <b>850,000,000+</b> breached passwords compiled from data dumps.
              Using the <b>k-Anonymity mathematical privacy model</b>, only the first 5 characters of the SHA-1 hash leave your device.
              Your actual password is never revealed, transmitted, or logged.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <div className="field-inline" style={{ flex: 1 }}>
                <Lock size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a test password or passphrase..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordCheck()}
                />
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#6b7488", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                className="btn-outline active"
                style={{ padding: "0 22px", whiteSpace: "nowrap" }}
                onClick={handlePasswordCheck}
                disabled={checkingPassword}
              >
                {checkingPassword ? <RefreshCw className="spin" size={15} /> : <KeyRound size={15} />}
                {checkingPassword ? " Checking..." : " Check Password"}
              </button>
              <button
                className="btn-outline"
                style={{ padding: "0 18px", whiteSpace: "nowrap" }}
                onClick={generatePassphrase}
                title="Generate high-entropy passphrase"
              >
                <Zap size={15} /> Generate Passphrase
              </button>
            </div>

            {passError && <p className="muted" style={{ color: "#ff8fc0", marginTop: 12 }}>{passError}</p>}

            {passwordResult && (
              <div style={{ marginTop: 20 }}>
                {passwordResult.isPwned ? (
                  <div className="breach-banner danger">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="breach-icon danger"><XCircle size={28} /></div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#ff8fc0" }}>
                          Password Compromised! Seen {Number(passwordResult.pwnedCount).toLocaleString()} Times
                        </div>
                        <div className="muted small" style={{ marginTop: 3 }}>
                          This exact password has surfaced repeatedly in public credential stuffing lists.
                          <b style={{ color: "#ff8fc0" }}> DO NOT USE THIS PASSWORD.</b>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="breach-banner clean">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="breach-icon clean"><CheckCircle2 size={28} /></div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#7fd68a" }}>
                          Password Not Found in Known Breaches!
                        </div>
                        <div className="muted small" style={{ marginTop: 3 }}>
                          This password was not detected in any indexed breach database dumps.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Analysis Metrics */}
                <div className="stat-grid" style={{ marginTop: 16 }}>
                  <div className="stat-card">
                    <div className="stat-icon blue"><Lock size={18} /></div>
                    <div>
                      <div className="stat-value">{passwordResult.entropyBits} bits</div>
                      <div className="stat-label">Calculated Entropy</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className={`stat-icon ${passwordResult.length >= 14 ? "blue" : "pink"}`}><KeyRound size={18} /></div>
                    <div>
                      <div className="stat-value">{passwordResult.length} chars</div>
                      <div className="stat-label">Password Length</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className={`stat-icon ${passwordResult.isPwned ? "pink" : "blue"}`}><ShieldCheck size={18} /></div>
                    <div>
                      <div className="stat-value">{passwordResult.verdict}</div>
                      <div className="stat-label">Security Verdict</div>
                    </div>
                  </div>
                </div>

                {/* Crack Time Estimates */}
                <div className="panel" style={{ marginTop: 16, background: "rgba(255,255,255,0.015)" }}>
                  <div className="panel-title" style={{ fontSize: 13, marginBottom: 12 }}>
                    Estimated Brute-Force Cracking Times (NIST SP 800-63B)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                    <div className="crack-card">
                      <span className="muted small">Single Consumer GPU</span>
                      <b style={{ color: passwordResult.entropyBits < 45 ? "#ff8fc0" : "#7cbaff" }}>
                        {passwordResult.entropyBits < 30 ? "Instantly (< 1 sec)" : passwordResult.entropyBits < 45 ? "Under 10 minutes" : passwordResult.entropyBits < 60 ? "3 Years" : "Centuries"}
                      </b>
                    </div>
                    <div className="crack-card">
                      <span className="muted small">8x RTX 4090 Hashcat Rig</span>
                      <b style={{ color: passwordResult.entropyBits < 55 ? "#ff8fc0" : "#7cbaff" }}>
                        {passwordResult.entropyBits < 35 ? "Instantly" : passwordResult.entropyBits < 50 ? "2 Hours" : passwordResult.entropyBits < 65 ? "40 Years" : "Millennia"}
                      </b>
                    </div>
                    <div className="crack-card">
                      <span className="muted small">Nation-State Cluster</span>
                      <b style={{ color: passwordResult.entropyBits < 70 ? "#ff8fc0" : "#7cbaff" }}>
                        {passwordResult.entropyBits < 45 ? "Instantly" : passwordResult.entropyBits < 60 ? "2 Days" : "Unfeasible"}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* SUB-TAB 3: TOP 10 DATA LEAK CHECK WEBSITES DIRECTORY */}
      {activeSubTab === "websites" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Verified Directory of Breach & Account Leak Detection Websites">
            <p className="info-body" style={{ marginBottom: 16 }}>
              A curated catalog of verified, reputable intelligence websites where security researchers, SOC analysts, and users can investigate compromised assets, dark web leaks, infostealer credentials, and paste dumps.
            </p>

            {/* Filter and search bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <div className="field-inline" style={{ minWidth: 260 }}>
                <Search size={15} />
                <input
                  placeholder="Search websites by name, feature, or keyword..."
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Filter size={14} className="muted" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`tag-chip ${siteFilterCategory === cat ? "active" : ""}`}
                    onClick={() => setSiteFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            {websitesLoading ? (
              <p className="muted">Loading leak detection platforms...</p>
            ) : (
              <div className="directory-grid">
                {filteredWebsites.map((site) => (
                  <div key={site.id} className="directory-card">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <b style={{ fontSize: 15, color: "#eef2fb" }}>{site.name}</b>
                          <span className="badge-pill blue">{site.badge}</span>
                        </div>
                        <span className="muted small" style={{ display: "block", marginTop: 2 }}>{site.creator}</span>
                      </div>
                      <div className="trust-meter">
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#7fd68a" }}>{site.trustRating}%</span>
                        <span className="muted small" style={{ fontSize: 9.5 }}>Trust Score</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: "#9aa4bd", margin: "12px 0", lineHeight: 1.6, flex: 1 }}>
                      {site.description}
                    </p>

                    {/* Features list */}
                    <div style={{ marginBottom: 14 }}>
                      <div className="muted small" style={{ fontSize: 11, textTransform: "uppercase", marginBottom: 6 }}>Key Capabilities:</div>
                      <ul className="mini-bullet-list">
                        {site.features.slice(0, 3).map((feat, i) => (
                          <li key={i}><Check size={12} color="#5da9ff" /> {feat}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Query Types Supported */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                      {site.supportedQueries.map((sq, i) => (
                        <span key={i} className="query-tag">{sq}</span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                      <span className="cost-tag">{site.cost}</span>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-site-link"
                      >
                        Visit Website <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      <VibeLine icon={ShieldCheck}>
        Pro-Tip: Bookmark Have I Been Pwned, DeHashed, and XposedOrNot for regular quarterly asset hygiene audits.
      </VibeLine>
    </>
  );
}

/* =========================================================================
   MODULE 2: HTTP SECURITY HEADERS & SSL POSTURE ANALYZER
   ========================================================================= */
export function SecurityHeadersPage() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const runPreset = (domain) => {
    setUrl(domain);
    handleScan(domain);
  };

  const handleScan = async (overrideUrl) => {
    const target = (overrideUrl || url).trim();
    if (!target || scanning) return;
    setScanning(true);
    setError("");
    setAuditResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/scan-headers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to scan security headers");
      setAuditResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const copyCode = (snippet, index) => {
    navigator.clipboard.writeText(snippet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gradeColors = {
    "A+": "#7fd68a",
    A: "#7fd68a",
    B: "#7cbaff",
    C: "#ffb84d",
    D: "#ff8fc0",
    F: "#ff5fa2",
  };

  return (
    <>
      <PageIntro
        eyebrow="DEFENSE HARDENING"
        tagline="Inspect any web application or API endpoint for critical HTTP defense headers (HSTS, CSP, X-Frame-Options) and get copy-paste remediation rules."
      />

      <TipCallout icon={ShieldAlert} title="Why Security Headers Matter">
        Security headers are browser directives that block 80%+ of common client-side vulnerabilities, including Cross-Site Scripting (XSS), Clickjacking, MIME-sniffing, and SSL Stripping.
      </TipCallout>

      <Panel title="Scan Web Domain / URL">
        <div style={{ display: "flex", gap: 10 }}>
          <div className="field-inline">
            <Globe size={16} />
            <input
              placeholder="Enter domain or URL (e.g. github.com, cloudflare.com, yoursite.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <button
            className="btn-outline active"
            style={{ padding: "0 22px", whiteSpace: "nowrap" }}
            onClick={() => handleScan()}
            disabled={scanning}
          >
            {scanning ? <RefreshCw className="spin" size={15} /> : <ShieldAlert size={15} />}
            {scanning ? " Analyzing..." : " Analyze Headers"}
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span className="muted small">Quick Presets:</span>
          <button className="tag-chip" onClick={() => runPreset("github.com")}>github.com</button>
          <button className="tag-chip" onClick={() => runPreset("cloudflare.com")}>cloudflare.com</button>
          <button className="tag-chip" onClick={() => runPreset("google.com")}>google.com</button>
        </div>

        {error && <p className="muted" style={{ color: "#ff8fc0", marginTop: 12 }}>{error}</p>}

        {auditResult && (
          <div style={{ marginTop: 20 }}>
            {/* Top Score Banner */}
            <div className="header-score-card">
              <div className="grade-badge" style={{ borderColor: gradeColors[auditResult.grade] || "#5da9ff", color: gradeColors[auditResult.grade] || "#5da9ff" }}>
                {auditResult.grade}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2fb" }}>
                  {auditResult.hostname} — Security Grade {auditResult.grade} ({auditResult.score}/100)
                </div>
                <div className="muted small" style={{ marginTop: 4 }}>
                  Passed <b>{auditResult.passedCount}</b> of <b>{auditResult.totalChecks}</b> critical security header benchmarks.
                </div>
              </div>
              <div className="status-pill ok" style={{ background: "rgba(255,255,255,0.06)" }}>
                HTTP {auditResult.statusCode}
              </div>
            </div>

            {/* Header Checklist */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#eef2fb" }}>
                Header Audit Findings & Fixes
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {auditResult.headerAudits.map((item, i) => (
                  <div key={i} className={`header-item-card ${item.present ? "pass" : "fail"}`}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.present ? <CheckCircle2 size={20} color="#7fd68a" /> : <XCircle size={20} color="#ff5fa2" />}
                        <div>
                          <b style={{ color: "#eef2fb", fontSize: 14 }}>{item.name}</b>
                          <span className={`importance-tag ${item.importance.toLowerCase()}`}>{item.importance}</span>
                        </div>
                      </div>
                      <span className={`status-pill ${item.present ? "ok" : "bad"}`}>
                        {item.present ? "Active & Configured" : "Missing / Vulnerable"}
                      </span>
                    </div>

                    <p style={{ fontSize: 12.5, color: "#9aa4bd", margin: "8px 0 10px", lineHeight: 1.5 }}>
                      {item.impact}
                    </p>

                    {item.value && (
                      <div className="raw-header-val">
                        <span className="muted small">Received Value: </span>
                        <code>{item.value}</code>
                      </div>
                    )}

                    {!item.present && (
                      <div className="code-fix-box">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#5da9ff", fontWeight: 600 }}>Recommended Server Directives:</span>
                          <button className="copy-btn" onClick={() => copyCode(item.remediation, i)}>
                            {copiedIndex === i ? <Check size={12} color="#7fd68a" /> : <Copy size={12} />}
                            {copiedIndex === i ? " Copied" : " Copy"}
                          </button>
                        </div>
                        <code>{item.remediation}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <VibeLine icon={ShieldCheck}>
        Hardening headers like CSP and HSTS takes under 5 minutes and eliminates whole classes of OWASP Top 10 vulnerabilities.
      </VibeLine>
    </>
  );
}

/* =========================================================================
   MODULE 3: THREAT INTEL & IP INVESTIGATOR
   ========================================================================= */
export function IpIntelPage() {
  const [ipInput, setIpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intelResult, setIntelResult] = useState(null);
  const [error, setError] = useState("");

  const runPreset = (ip) => {
    setIpInput(ip);
    handleLookup(ip);
  };

  const handleLookup = async (overrideIp) => {
    const target = (overrideIp || ipInput).trim();
    if (!target || loading) return;
    setLoading(true);
    setError("");
    setIntelResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/lookup-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: target }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to query IP threat intelligence");
      setIntelResult(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageIntro
        eyebrow="TELEMETRY & OSINT"
        tagline="Investigate any IPv4, IPv6, or domain hostname for ASN routing, geolocation, Tor Exit Node activity, and hosting provider proxy indicators."
      />

      <Panel title="IP Threat & Geolocation Investigation">
        <div style={{ display: "flex", gap: 10 }}>
          <div className="field-inline">
            <Radio size={16} />
            <input
              placeholder="Enter IP address or domain (e.g. 8.8.8.8, 1.1.1.1, scanme.nmap.org)"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
          </div>
          <button
            className="btn-outline active"
            style={{ padding: "0 22px", whiteSpace: "nowrap" }}
            onClick={() => handleLookup()}
            disabled={loading}
          >
            {loading ? <RefreshCw className="spin" size={15} /> : <Search size={15} />}
            {loading ? " Investigating..." : " Investigate IP"}
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span className="muted small">Quick Lookups:</span>
          <button className="tag-chip" onClick={() => runPreset("8.8.8.8")}>8.8.8.8 (Google DNS)</button>
          <button className="tag-chip" onClick={() => runPreset("1.1.1.1")}>1.1.1.1 (Cloudflare)</button>
          <button className="tag-chip" onClick={() => runPreset("9.9.9.9")}>9.9.9.9 (Quad9)</button>
          <button className="tag-chip" onClick={() => runPreset("192.168.1.1")}>192.168.1.1 (Local Bogon)</button>
        </div>

        {error && <p className="muted" style={{ color: "#ff8fc0", marginTop: 12 }}>{error}</p>}

        {intelResult && (
          <div style={{ marginTop: 20 }}>
            {/* Top Geo Card */}
            <div className="stat-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-icon blue"><Globe size={18} /></div>
                <div>
                  <div className="stat-value">{intelResult.country} ({intelResult.countryCode})</div>
                  <div className="stat-label">{intelResult.city}, {intelResult.regionName}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue"><Server size={18} /></div>
                <div>
                  <div className="stat-value" style={{ fontSize: 16 }}>{intelResult.isp}</div>
                  <div className="stat-label">{intelResult.as}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className={`stat-icon ${intelResult.threatScore > 20 ? "pink" : "blue"}`}><ShieldAlert size={18} /></div>
                <div>
                  <div className="stat-value">{intelResult.threatScore}/100</div>
                  <div className="stat-label">{intelResult.reputationVerdict}</div>
                </div>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="panel" style={{ background: "rgba(255,255,255,0.015)" }}>
              <div className="panel-title" style={{ fontSize: 13, marginBottom: 12 }}>Routing & Security Attributes</div>
              <ul className="cat-list">
                <li><span className="dot blue" />Resolved IP Address: <b style={{ color: "#5da9ff", fontFamily: "monospace" }}>{intelResult.ip}</b></li>
                <li><span className="dot pink" />Autonomous System: <b>{intelResult.as}</b></li>
                <li><span className="dot blue" />Organization: <b>{intelResult.org}</b></li>
                <li><span className="dot pink" />Tor Exit Node Indicator: <b style={{ color: intelResult.isTorExitNode ? "#ff5fa2" : "#7fd68a" }}>{intelResult.isTorExitNode ? "YES (Active Tor Relay)" : "No"}</b></li>
                <li><span className="dot blue" />VPN / Hosting Proxy: <b style={{ color: intelResult.isProxyOrVpn ? "#ffb84d" : "#7fd68a" }}>{intelResult.isProxyOrVpn ? "Hosting Datacenter IP" : "Residential / Direct"}</b></li>
              </ul>
            </div>
          </div>
        )}
      </Panel>

      <VibeLine icon={Radio}>
        Correlating IP ASN attributes with login history flags credential-stuffing botnets before accounts get locked.
      </VibeLine>
    </>
  );
}

/* =========================================================================
   MODULE 4: INTERACTIVE SOC INCIDENT RESPONSE PLAYBOOKS
   ========================================================================= */
export function PlaybooksPage() {
  const [selectedPlaybookIndex, setSelectedPlaybookIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  const playbooks = [
    {
      id: "ato",
      title: "Account Takeover & Credential Stuffing",
      threatType: "Identity / Authentication",
      severity: "High",
      icon: KeyRound,
      color: "#5da9ff",
      description: "Step-by-step incident containment workflow when an account is subjected to brute force, credential stuffing, or session hijacking.",
      phases: [
        {
          name: "1. Identification & Triage",
          tasks: [
            "Verify suspicious login timestamps against user normal location & IP ASN.",
            "Inspect failed login threshold violations in MongoDB LoginHistory collection.",
            "Confirm whether MFA / Biometric WebAuthn challenge was bypassed or absent.",
          ],
        },
        {
          name: "2. Containment & Quarantine",
          tasks: [
            "Immediately invalidate all active JWT auth tokens and user sessions.",
            "Set user.isBlocked = true in MongoDB to freeze account access.",
            "Block malicious source IP address / CIDR at firewall / Cloudflare WAF.",
          ],
        },
        {
          name: "3. Eradication & Remediation",
          tasks: [
            "Issue out-of-band password reset via verified Nodemailer OTP workflow.",
            "Enroll WebAuthn Passkey (Face ID / Windows Hello) for biometric assurance.",
            "Audit recent account activity for unauthorized data exports or role changes.",
          ],
        },
        {
          name: "4. Post-Incident & Lessons Learned",
          tasks: [
            "Update threat intelligence database with attacker IP & user-agent strings.",
            "File an internal incident report in CyberIntel Reports module.",
          ],
        },
      ],
    },
    {
      id: "phishing",
      title: "Phishing & Malicious URL Triage",
      threatType: "Web Threat",
      severity: "Critical",
      icon: ShieldAlert,
      color: "#ff5fa2",
      description: "Standard operating procedure for analyzing reported phishing URLs, brand impersonation, and weaponized redirect links.",
      phases: [
        {
          name: "1. Triage & Heuristic Scan",
          tasks: [
            "Submit suspicious URL to CyberIntel URL Threat Scanner heuristic engine.",
            "Check domain creation date via WHOIS and inspect risky TLD (.xyz, .top, .zip).",
            "Verify URL presence in Google Safe Browsing and VirusTotal feeds.",
          ],
        },
        {
          name: "2. Containment & Blocking",
          tasks: [
            "Add domain to corporate DNS sinkhole / blocklist.",
            "Search mail logs for all employees who received the phishing link.",
            "Purge phishing email from all recipient inboxes via Exchange / Google Workspace.",
          ],
        },
        {
          name: "3. Remediation",
          tasks: [
            "Force credential reset for any user who clicked or entered credentials.",
            "Submit takedown request to domain registrar & hosting provider.",
          ],
        },
      ],
    },
    {
      id: "ransomware",
      title: "Ransomware & Malware Outbreak Containment",
      threatType: "Host / Endpoint Compromise",
      severity: "Emergency",
      icon: Flame,
      color: "#ff2f8f",
      description: "Emergency containment procedure to stop lateral movement, isolate infected network segments, and preserve forensics.",
      phases: [
        {
          name: "1. Immediate Host Isolation",
          tasks: [
            "Sever physical ethernet and disconnect Wi-Fi from infected endpoints immediately (DO NOT power off).",
            "Isolate network VLAN segment at the core switch level.",
            "Freeze shared SMB network storage and disable domain controller sync.",
          ],
        },
        {
          name: "2. Forensic Evidence Preservation",
          tasks: [
            "Take live memory dump (RAM capture) for volatile malware artifact analysis.",
            "Capture ransomware note, encrypted file extension, and sample binary hash.",
          ],
        },
        {
          name: "3. Clean Restoration",
          tasks: [
            "Restore systems from verified offline, immutable golden backup images.",
            "Patch initial entry vulnerability (RDP, unpatched CVE, phishing vector).",
          ],
        },
      ],
    },
  ];

  const currentPlaybook = playbooks[selectedPlaybookIndex];

  // Calculate task keys and completion progress
  const allTasks = currentPlaybook.phases.flatMap((p, pIdx) =>
    p.tasks.map((_, tIdx) => `${currentPlaybook.id}-${pIdx}-${tIdx}`)
  );
  const completedCount = allTasks.filter((k) => completedTasks[k]).length;
  const progressPercent = Math.round((completedCount / allTasks.length) * 100) || 0;

  const toggleTask = (key) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetPlaybook = () => {
    setCompletedTasks((prev) => {
      const next = { ...prev };
      allTasks.forEach((k) => delete next[k]);
      return next;
    });
  };

  return (
    <>
      <PageIntro
        eyebrow="SOC OPERATIONAL PLAYBOOKS"
        tagline="Standardized incident response workflows based on NIST SP 800-61r2 for triage, containment, eradication, and forensic recovery."
      />

      {/* Playbook Selector Cards */}
      <div className="method-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
        {playbooks.map((pb, idx) => (
          <div
            key={pb.id}
            className={`method-card ${selectedPlaybookIndex === idx ? "active" : ""}`}
            style={{
              cursor: "pointer",
              borderColor: selectedPlaybookIndex === idx ? pb.color : "rgba(255,255,255,0.08)",
              background: selectedPlaybookIndex === idx ? "rgba(93,169,255,0.08)" : "rgba(255,255,255,0.02)",
            }}
            onClick={() => setSelectedPlaybookIndex(idx)}
          >
            <pb.icon size={22} color={pb.color} />
            <b style={{ color: "#eef2fb", textAlign: "center", fontSize: 13 }}>{pb.title}</b>
            <span className={`status-pill ${pb.severity === "Critical" || pb.severity === "Emergency" ? "bad" : "warn"}`}>
              {pb.severity}
            </span>
          </div>
        ))}
      </div>

      <Panel
        title={`${currentPlaybook.title} — Active Response Checklist`}
        action={
          <button className="btn-outline" style={{ padding: "5px 12px", fontSize: 12 }} onClick={resetPlaybook}>
            Reset Steps
          </button>
        }
      >
        <p className="info-body" style={{ marginBottom: 14 }}>
          {currentPlaybook.description}
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span className="muted">Playbook Execution Progress</span>
            <b style={{ color: progressPercent === 100 ? "#7fd68a" : "#5da9ff" }}>
              {completedCount}/{allTasks.length} Steps Completed ({progressPercent}%)
            </b>
          </div>
          <div className="risk-bar wide" style={{ width: "100%", height: 8 }}>
            <div className="risk-fill" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "#7fd68a" : "linear-gradient(90deg, #5da9ff, #ff5fa2)" }} />
          </div>
        </div>

        {/* Phases & Checklist Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {currentPlaybook.phases.map((phase, pIdx) => (
            <div key={pIdx} className="phase-block">
              <div className="phase-title">{phase.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {phase.tasks.map((task, tIdx) => {
                  const key = `${currentPlaybook.id}-${pIdx}-${tIdx}`;
                  const isDone = Boolean(completedTasks[key]);
                  return (
                    <div
                      key={tIdx}
                      className={`task-row ${isDone ? "done" : ""}`}
                      onClick={() => toggleTask(key)}
                    >
                      <div className={`checkbox-box ${isDone ? "checked" : ""}`}>
                        {isDone && <Check size={13} color="#05060a" />}
                      </div>
                      <span style={{ fontSize: 13.5, color: isDone ? "#6b7488" : "#eef2fb", textDecoration: isDone ? "line-through" : "none" }}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <VibeLine icon={Flame}>
        In active incidents, standardizing first-responder playbooks cuts mean-time-to-remediate (MTTR) by over 60%.
      </VibeLine>
    </>
  );
}
