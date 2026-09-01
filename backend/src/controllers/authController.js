import bcrypt from "bcryptjs";
import User from "../models/user.js";
import LoginHistory from "../models/LoginHistory.js";
import Threat from "../models/Threat.js";
import { generateOtp, otpExpiry } from "../utils/otp.js";
import { sendOtpEmail, sendThreatAlertEmail } from "../utils/email.js";
import { signToken } from "../utils/token.js";

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      // If already verified, reject duplicate registration
      if (existing.isVerified) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      // If the existing account was never verified, allow updating details and resending OTP
      const passwordHash = await bcrypt.hash(password, 10);
      const otpCode = generateOtp();

      existing.fullName = fullName;
      existing.phone = phone;
      existing.passwordHash = passwordHash;
      existing.otpCode = otpCode;
      existing.otpExpiresAt = otpExpiry();
      await existing.save();

      await sendOtpEmail(existing.email, otpCode, "verify");

      return res.status(200).json({
        message: "Account verification code refreshed. Check your email (or terminal).",
        userId: existing._id,
      });
    }

    // Nobody gets to pick their own role at signup — that would be a real
    // security hole. Everyone starts as "user". The one exception: if this
    // is the very first account in the whole system, it becomes admin so
    // there's someone able to promote others later.
    const isFirstAccountEver = (await User.countDocuments({})) === 0;
    const finalRole = isFirstAccountEver ? "admin" : "user";

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();

    const user = await User.create({
      fullName,
      email: cleanEmail,
      phone,
      passwordHash,
      role: finalRole,
      otpCode,
      otpExpiresAt: otpExpiry(),
    });

    await sendOtpEmail(user.email, otpCode, "verify");

    res.status(201).json({
      message: "Account created. Check your email for a verification code.",
      userId: user._id,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
}

// POST /api/auth/verify-otp   { userId, otp }
export async function verifyOtp(req, res) {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otpCode !== otp) return res.status(400).json({ message: "Incorrect code" });
    if (user.otpExpiresAt < new Date()) return res.status(400).json({ message: "Code has expired" });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = signToken(user);
    res.json({
      message: "Account verified",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
}

// POST /api/auth/resend-otp   { userId }
export async function resendOtp(req, res) {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = generateOtp();
    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiry();
    await user.save();

    await sendOtpEmail(user.email, otpCode, "verify");
    res.json({ message: "A new code has been sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend code", error: err.message });
  }
}

// POST /api/auth/login   { email, password, role? }
export async function login(req, res) {
  const { email, password, role } = req.body;
  const cleanEmail = (email || "").toLowerCase();

  const logAttempt = (success, reason, user) =>
    LoginHistory.create({
      user: user?._id,
      email: cleanEmail,
      success,
      reason,
      ip: req.ip,
    }).catch((err) => console.error("Failed to log login attempt:", err.message));

  // Real, behavior-based threat detection — not seeded data. Checks actual
  // recent LoginHistory records and only opens a Threat if one doesn't
  // already exist for this email in the current window (avoids spamming
  // duplicate threats on every single failed attempt).
  const notifyAdmins = async (threat) => {
    try {
      const admins = await User.find({ role: "admin" }).select("email");
      await Promise.all(admins.map((a) => sendThreatAlertEmail(a.email, threat)));
    } catch (err) {
      console.error("Failed to notify admins:", err.message);
    }
  };

  const detectThreats = async (reason, user) => {
    try {
      if (reason === "wrong_password") {
        const since = new Date(Date.now() - 15 * 60 * 1000);
        const recentFailures = await LoginHistory.countDocuments({
          email: cleanEmail,
          success: false,
          reason: "wrong_password",
          createdAt: { $gte: since },
        });

        if (recentFailures >= 3) {
          const existingOpen = await Threat.findOne({
            type: "Brute Force",
            relatedEmail: cleanEmail,
            status: "open",
            createdAt: { $gte: since },
          });
          if (!existingOpen) {
            const threat = await Threat.create({
              type: "Brute Force",
              severity: "high",
              title: `Repeated failed logins for ${cleanEmail}`,
              description: `${recentFailures} failed password attempts within 15 minutes. Account auto-blocked.`,
              relatedEmail: cleanEmail,
            });
            // This is what makes "Brute Force" a real threat instead of just
            // a log entry — the account actually gets locked out until an
            // admin unblocks it from the Admin Panel.
            if (user) {
              user.isBlocked = true;
              await user.save();
            }
            await notifyAdmins(threat);
          }
        }
      }

      if (reason === "role_mismatch") {
        const threat = await Threat.create({
          type: "Unauthorized Access",
          severity: "medium",
          title: `Privilege escalation attempt on ${cleanEmail}`,
          description: `Login attempted with a role the account doesn't have.`,
          relatedEmail: cleanEmail,
        });
        await notifyAdmins(threat);
      }
    } catch (err) {
      console.error("Threat detection failed:", err.message);
    }
  };

  try {
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      await logAttempt(false, "no_such_account", null);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      await logAttempt(false, "account_blocked", user);
      return res.status(403).json({
        message: "This account has been blocked due to suspicious activity. Contact an admin to unblock it.",
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      await logAttempt(false, "wrong_password", user);
      await detectThreats("wrong_password", user);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      await logAttempt(false, "not_verified", user);
      return res.status(403).json({ message: "Please verify your email before logging in", userId: user._id });
    }

    // If the person explicitly picked "Hacker" or "Admin" at login, make sure
    // the account actually has that role — otherwise this button would be
    // purely cosmetic instead of real access control.
    if (role && role !== "user" && role !== user.role) {
      await logAttempt(false, "role_mismatch", user);
      await detectThreats("role_mismatch", user);
      return res.status(403).json({
        message: `This account is registered as "${user.role}", not "${role}". Sign in without selecting a role, or use an account with that role.`,
      });
    }

    await logAttempt(true, "success", user);

    const token = signToken(user);
    res.json({
      message: "Logged in",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// POST /api/auth/forgot-password   { email }
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    // Always respond the same way, whether or not the email exists —
    // this avoids leaking which emails are registered.
    if (!user) {
      return res.json({ message: "If that email exists, a reset code has been sent" });
    }

    const otpCode = generateOtp();
    user.resetOtpCode = otpCode;
    user.resetOtpExpiresAt = otpExpiry();
    await user.save();

    await sendOtpEmail(user.email, otpCode, "reset");
    res.json({ message: "If that email exists, a reset code has been sent", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Request failed", error: err.message });
  }
}

// POST /api/auth/reset-password   { userId, otp, newPassword }
export async function resetPassword(req, res) {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.resetOtpCode !== otp) return res.status(400).json({ message: "Incorrect code" });
    if (user.resetOtpExpiresAt < new Date()) return res.status(400).json({ message: "Code has expired" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtpCode = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
}

// GET /api/auth/me  (protected — requires valid JWT)
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -otpCode -resetOtpCode");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile", error: err.message });
  }
}

// PATCH /api/auth/promote   { targetEmail, newRole }
// Protected + admin-only. This is how someone actually becomes an admin or
// hacker after signup — an existing admin has to grant it. Not exposed in
// the UI yet; call it directly (e.g. via Postman) until an admin panel exists.
export async function promoteUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can change user roles" });
    }

    const { targetEmail, newRole } = req.body;
    const allowedRoles = ["user", "analyst", "hacker", "admin"];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const target = await User.findOne({ email: (targetEmail || "").toLowerCase() });
    if (!target) return res.status(404).json({ message: "No account with that email" });

    target.role = newRole;
    await target.save();

    res.json({ message: `${target.email} is now "${newRole}"`, user: { email: target.email, role: target.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Promotion failed", error: err.message });
  }
}

// PATCH /api/auth/profile   { fullName?, phone? }
// Protected — lets a logged-in user update their own name/phone. Email and
// role are intentionally not editable here (email is the account identity;
// role changes go through promoteUser instead).
export async function updateProfile(req, res) {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName && fullName.trim()) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone;
    await user.save();

    res.json({
      message: "Profile updated",
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

// GET /api/auth/users
// Protected + admin-only. Powers the Admin Panel UI — lists every account
// so an admin can actually see who exists and promote them with a click,
// instead of needing to already know someone's email.
export async function getAllUsers(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view the user list" });
    }

    const users = await User.find()
      .select("fullName email role isVerified isBlocked createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load users", error: err.message });
  }
}

// PATCH /api/auth/unblock   { targetEmail }
// Protected + admin-only. Reverses an automatic Brute Force block — for
// when the system locked someone out but it turns out to have been a
// false alarm (forgot password, typo, etc.), not a real attack.
export async function unblockUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can unblock accounts" });
    }

    const { targetEmail } = req.body;
    const target = await User.findOne({ email: (targetEmail || "").toLowerCase() });
    if (!target) return res.status(404).json({ message: "No account with that email" });

    target.isBlocked = false;
    await target.save();

    res.json({ message: `${target.email} has been unblocked`, user: { email: target.email, isBlocked: target.isBlocked } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unblock failed", error: err.message });
  }
}