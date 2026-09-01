import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startAuthentication } from "@simplewebauthn/browser";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Fingerprint,
  ScanFace,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector.jsx";
import FaceScannerModal, { preloadFaceModels } from "../components/FaceScannerModal.jsx";

/* ---------------------------------------------------------
   CyberIntel — Auth Flow
   Views: login -> signup -> forgot -> otp -> reset -> success
   Same token system as the landing page (void-black / blue / pink)
--------------------------------------------------------- */

import API_BASE_URL from "../config/api.js";
const API_BASE = `${API_BASE_URL}/api/auth`;
const WEBAUTHN_BASE = `${API_BASE_URL}/api/webauthn`;


function BackgroundGlow() {
  return (
    <div className="bg-glow-wrap">
      <div className="glow blue" />
      <div className="glow pink" />
      <div className="grid-overlay" />
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <ShieldCheck size={22} color="#5da9ff" />
      <span>
        Cyber<span className="brand-accent">Intel</span>
      </span>
    </div>
  );
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="field">
      <Icon size={16} className="field-icon" />
      <input {...props} />
    </div>
  );
}

function PasswordField({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <Lock size={16} className="field-icon" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Password"}
      />
      <button type="button" className="field-toggle" onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* ---------------------------- OTP input ---------------------------- */
function OtpInput({ length = 6, onComplete }) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="otp-box"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}

/* ---------------------------- Login view ---------------------------- */
function LoginView({ goto }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);

  useEffect(() => {
    preloadFaceModels().catch(() => {});
  }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.userId) {
          goto("otp", { flow: "signup", userId: data.userId });
          return;
        }
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("cyberintel_auth", "true");
      localStorage.setItem("cyberintel_token", data.token);
      localStorage.setItem("cyberintel_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setError("");
    setPasskeyLoading(true);
    try {
      const optionsRes = await fetch(`${WEBAUTHN_BASE}/passkey-login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const options = await optionsRes.json();
      if (!optionsRes.ok) throw new Error(options.message || "Could not start passkey login");

      const authResponse = await startAuthentication(options);

      const verifyRes = await fetch(`${WEBAUTHN_BASE}/passkey-login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResponse }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.message || "Passkey login failed");

      localStorage.setItem("cyberintel_auth", "true");
      localStorage.setItem("cyberintel_token", data.token);
      localStorage.setItem("cyberintel_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Passkey prompt was cancelled.");
      } else {
        setError(err.message || "Passkey login failed");
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="card">
      <Brand />
      <h1>Welcome back</h1>
      <p className="sub">Sign in to your CyberIntel command center.</p>

      <div className="form">
        <Field
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="muted" style={{ color: "#ff8fc0" }}>{error}</p>}
        <div className="row-between">
          <label className="check">
            <input type="checkbox" /> Remember me
          </label>
          <button className="link-btn" onClick={() => goto("forgot")}>
            Forgot password?
          </button>
        </div>

        <button className="btn-primary full" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing In..." : "Sign In"} <ArrowRight size={16} />
        </button>

        <div className="divider">or biometric</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            className="btn-face-login full"
            onClick={() => setShowFaceModal(true)}
            disabled={passkeyLoading || loading}
          >
            <ScanFace size={18} />
            ⚡ Sign In with Face ID
          </button>

          <button
            type="button"
            className="btn-passkey full"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading || loading}
          >
            <Fingerprint size={18} />
            {passkeyLoading ? "Waiting for biometric…" : "Sign in with Passkey"}
          </button>
        </div>

        {showFaceModal && (
          <FaceScannerModal
            mode="identify"
            onSuccess={(data) => {
              setShowFaceModal(false);
              localStorage.setItem("cyberintel_auth", "true");
              localStorage.setItem("cyberintel_token", data.token);
              localStorage.setItem("cyberintel_user", JSON.stringify(data.user));
              navigate("/dashboard");
            }}
            onClose={() => setShowFaceModal(false)}
          />
        )}
      </div>

      <div className="divider">or continue as</div>
      <div className="row-2">
        <button
          className={`btn-outline ${role === "hacker" ? "active" : ""}`}
          onClick={() => setRole((r) => (r === "hacker" ? "user" : "hacker"))}
        >
          Hacker
        </button>
        <button
          className={`btn-outline ${role === "admin" ? "active" : ""}`}
          onClick={() => setRole((r) => (r === "admin" ? "user" : "admin"))}
        >
          Admin
        </button>
      </div>
      {role !== "user" && (
        <p className="muted" style={{ textAlign: "center", marginTop: 10 }}>
          Signing in as <b style={{ color: "#ff8fc0" }}>{role}</b> — this only works if your account was created with that role.
        </p>
      )}

      <p className="switch">
        Don't have an account?{" "}
        <button className="link-btn strong" onClick={() => goto("signup")}>
          Create one
        </button>
      </p>
    </div>
  );
}

/* ---------------------------- Signup view ---------------------------- */
function SignupView({ goto }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      goto("otp", { flow: "signup", userId: data.userId, email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <Brand />
      <h1>Create your account</h1>
      <p className="sub">Takes under a minute. We'll verify with a one-time code.</p>

      <div className="form">
        <Field icon={User} type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field icon={Phone} type="tel" placeholder="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <PasswordField placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="muted" style={{ color: "#ff8fc0" }}>{error}</p>}

        <button className="btn-primary full" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={16} />
        </button>
      </div>

      <p className="switch">
        Already have an account?{" "}
        <button className="link-btn strong" onClick={() => goto("login")}>
          Sign in
        </button>
      </p>
    </div>
  );
}

/* ---------------------------- Forgot password view ---------------------------- */
function ForgotView({ goto }) {
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (method === "phone") {
      setError("Phone-based reset isn't connected yet — please use email for now.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      goto("otp", { flow: "reset", method, email, userId: data.userId });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <button className="back-btn" onClick={() => goto("login")}>
        <ArrowLeft size={15} /> Back to login
      </button>
      <h1>Reset your password</h1>
      <p className="sub">Choose how you'd like to receive your one-time code.</p>

      <div className="row-2">
        <button
          className={`btn-outline ${method === "email" ? "active" : ""}`}
          onClick={() => setMethod("email")}
        >
          <Mail size={15} /> Email
        </button>
        <button
          className="btn-outline"
          style={{ opacity: 0.5, cursor: "not-allowed" }}
          disabled
          title="Phone-based reset is coming soon"
        >
          <Phone size={15} /> Phone <span style={{ fontSize: 10 }}>(soon)</span>
        </button>
      </div>

      <div className="form">
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="muted" style={{ color: "#ff8fc0" }}>{error}</p>}

        <button className="btn-primary full" onClick={handleSendCode} disabled={loading}>
          {loading ? "Sending..." : "Send Code"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- OTP view ---------------------------- */
function OtpView({ context, goto }) {
  const [resendIn, setResendIn] = useState(30);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const flow = context?.flow || "signup";
  const method = context?.method || "email";

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleVerify = async () => {
    setError("");
    if (otp.length < 6) {
      setError("Enter all 6 digits");
      return;
    }

    if (flow === "reset") {
      goto("reset", { ...context, otp });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: context.userId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      localStorage.setItem("cyberintel_auth", "true");
      localStorage.setItem("cyberintel_token", data.token);
      localStorage.setItem("cyberintel_user", JSON.stringify(data.user));
      goto("success", context);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      if (flow === "reset") {
        await fetch(`${API_BASE}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: context.email }),
        });
      } else {
        await fetch(`${API_BASE}/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: context.userId }),
        });
      }
      setResendIn(30);
    } catch {
      setError("Couldn't resend the code — try again in a moment.");
    }
  };

  return (
    <div className="card">
      <button className="back-btn" onClick={() => goto(flow === "reset" ? "forgot" : "signup")}>
        <ArrowLeft size={15} /> Back
      </button>
      <h1>Enter verification code</h1>
      <p className="sub">
        We sent a 6-digit code to your {method === "phone" ? "phone" : "email"}. It expires in 5
        minutes.
      </p>

      <OtpInput onComplete={setOtp} />
      {error && <p className="muted" style={{ color: "#ff8fc0", textAlign: "center", marginTop: -10, marginBottom: 14 }}>{error}</p>}

      <button className="btn-primary full" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify Code"} <ArrowRight size={16} />
      </button>

      <p className="switch">
        {resendIn > 0 ? (
          <span className="muted">Resend code in {resendIn}s</span>
        ) : (
          <button className="link-btn strong" onClick={handleResend}>
            Resend code
          </button>
        )}
      </p>
    </div>
  );
}

/* ---------------------------- Reset password view ---------------------------- */
function ResetView({ goto, context }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: context.userId, otp: context.otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      goto("success", { flow: "reset" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Set a new password</h1>
      <p className="sub">Make it something you haven't used before.</p>

      <div className="form">
        <PasswordField placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <PasswordField placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <p className="muted" style={{ color: "#ff8fc0" }}>{error}</p>}
        <button className="btn-primary full" onClick={handleReset} disabled={loading}>
          {loading ? "Updating..." : "Update Password"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- Success view ---------------------------- */
function SuccessView({ goto, context }) {
  const navigate = useNavigate();
  const isReset = context?.flow === "reset";

  return (
    <div className="card center-card">
      <div className="success-icon">
        <CheckCircle2 size={40} />
      </div>
      <h1>{isReset ? "Password updated" : "You're all set"}</h1>
      <p className="sub">
        {isReset
          ? "Your password has been changed. Sign in with your new password."
          : "Your identity is verified. Your dashboard is ready."}
      </p>
      <button
        className="btn-primary full"
        onClick={() => {
          if (isReset) {
            goto("login");
          } else {
            navigate("/dashboard");
          }
        }}
      >
        {isReset ? "Continue to Sign In" : "Continue to Dashboard"} <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("login");
  const [context, setContext] = useState({});

  const goto = (next, ctx = {}) => {
    setContext(ctx);
    setView(next);
  };

  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .auth-root {
          min-height: 100vh; background: #05060a; color: #eef2fb;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex; align-items: center; justify-content: center; padding: 40px 20px;
          position: relative; overflow: hidden;
        }
        h1, .brand { font-family: 'Space Grotesk', 'Inter', sans-serif; }

        .bg-glow-wrap { position: absolute; inset: 0; z-index: 0; }
        .glow { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.3; }
        .glow.blue { width: 460px; height: 460px; background: #3a7bff; top: -140px; left: -100px; }
        .glow.pink { width: 420px; height: 420px; background: #ff2f8f; bottom: -140px; right: -80px; }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        .card {
          position: relative; z-index: 2; width: 100%; max-width: 420px;
          background: rgba(13,15,26,0.85); border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px); border-radius: 20px; padding: 34px 30px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
        }
        .center-card { text-align: center; }

        .brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; margin-bottom: 26px; }
        .brand-accent { color: #ff5fa2; }

        h1 { font-size: 24px; margin: 0 0 6px; letter-spacing: -0.01em; }
        .sub { color: #9aa4bd; font-size: 13.5px; line-height: 1.6; margin-bottom: 24px; }

        .form { display: flex; flex-direction: column; gap: 14px; }

        .field {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 12px 14px; transition: border-color 0.15s ease;
        }
        .field:focus-within { border-color: #5da9ff; }
        .field-icon { color: #6b7488; flex-shrink: 0; }
        .field input {
          background: none; border: none; outline: none; color: #eef2fb; font-size: 14px; width: 100%;
        }
        .field input::placeholder { color: #5c6478; }
        .field-toggle { background: none; border: none; color: #6b7488; cursor: pointer; display: flex; }

        .row-between { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
        .check { display: flex; align-items: center; gap: 6px; color: #9aa4bd; }
        .link-btn { background: none; border: none; color: #5da9ff; font-size: 13px; cursor: pointer; padding: 0; }
        .link-btn.strong { font-weight: 700; }
        .muted { color: #6b7488; font-size: 13px; }

        .btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff);
          color: #05060a; font-weight: 700; border: none;
          padding: 13px 20px; border-radius: 10px; cursor: pointer; font-size: 14px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 8px 24px rgba(93,169,255,0.25);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(255,95,162,0.3); }
        .btn-primary.full { width: 100%; margin-top: 4px; }

        .btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; color: #eef2fb; border: 1px solid rgba(255,255,255,0.15);
          padding: 12px 20px; border-radius: 10px; cursor: pointer; font-size: 14px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .btn-ghost:hover { border-color: #5da9ff; background: rgba(93,169,255,0.08); }
        .btn-ghost.full { width: 100%; }

        .btn-outline {
          flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          color: #cdd4e6; padding: 11px; border-radius: 10px; cursor: pointer; font-size: 13.5px;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .btn-outline.active, .btn-outline:hover { border-color: #5da9ff; color: #fff; }

        .divider {
          text-align: center; font-size: 12px; color: #6b7488; margin: 18px 0 14px; position: relative;
        }
        .divider::before, .divider::after {
          content: ""; position: absolute; top: 50%; width: 38%; height: 1px; background: rgba(255,255,255,0.08);
        }
        .divider::before { left: 0; }
        .divider::after { right: 0; }

        .row-2 { display: flex; gap: 10px; margin-bottom: 4px; }

        .switch { text-align: center; font-size: 13.5px; color: #9aa4bd; margin-top: 20px; }

        .back-btn {
          display: inline-flex; align-items: center; gap: 6px; background: none; border: none;
          color: #9aa4bd; font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 18px;
        }
        .back-btn:hover { color: #fff; }

        .otp-row { display: flex; gap: 10px; justify-content: center; margin: 6px 0 22px; }
        .otp-box {
          width: 46px; height: 54px; text-align: center; font-size: 20px; font-weight: 700;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; color: #eef2fb; outline: none;
        }
        .otp-box:focus { border-color: #5da9ff; }

        .success-icon {
          width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 18px;
          background: rgba(93,169,255,0.12); color: #5da9ff;
          display: flex; align-items: center; justify-content: center;
        }

        .btn-passkey {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(93, 169, 255, 0.08); color: #5da9ff; font-weight: 600;
          border: 1px solid rgba(93, 169, 255, 0.25);
          padding: 13px 20px; border-radius: 10px; cursor: pointer; font-size: 14px;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .btn-passkey:hover:not(:disabled) {
          background: rgba(93, 169, 255, 0.15); border-color: #5da9ff;
          transform: translateY(-1px); box-shadow: 0 6px 20px rgba(93, 169, 255, 0.2);
        }
        .btn-passkey:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-passkey.full { width: 100%; }

        .btn-face-login {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: linear-gradient(135deg, rgba(93, 169, 255, 0.12), rgba(255, 95, 162, 0.12));
          color: #eef2fb; font-weight: 600;
          border: 1px solid rgba(93, 169, 255, 0.4);
          padding: 13px 20px; border-radius: 10px; cursor: pointer; font-size: 14px;
          box-shadow: 0 4px 16px rgba(93, 169, 255, 0.15);
          transition: all 0.2s ease;
        }
        .btn-face-login:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(93, 169, 255, 0.22), rgba(255, 95, 162, 0.22));
          border-color: #ff5fa2;
          box-shadow: 0 6px 22px rgba(255, 95, 162, 0.25);
          transform: translateY(-1px);
        }
        .btn-face-login:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-face-login.full { width: 100%; }
      `}</style>

      <BackgroundGlow />

      <div style={{ position: "fixed", top: 20, right: 24, zIndex: 100 }}>
        <LanguageSelector compact />
      </div>

      {view === "login" && <LoginView goto={goto} />}
      {view === "signup" && <SignupView goto={goto} />}
      {view === "forgot" && <ForgotView goto={goto} />}
      {view === "otp" && <OtpView context={context} goto={goto} />}
      {view === "reset" && <ResetView goto={goto} context={context} />}
      {view === "success" && <SuccessView goto={goto} context={context} />}
    </div>
  );
}