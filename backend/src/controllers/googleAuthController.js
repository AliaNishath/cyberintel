import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import User from "../models/user.js";
import { signToken } from "../utils/token.js";

// Lazily initialized — we only need one per process.
let googleClient;
function getGoogleClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
}

// POST /api/auth/google   { credential }
// Receives the Google ID token from the frontend's Google Identity Services
// callback, verifies it, and either logs in an existing user or auto-creates
// a new account (since Google already verified the email, we skip OTP).
export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No Google credential provided" });
    }

    // Verify the ID token with Google — this confirms it's genuine, not
    // expired, and was issued for our Client ID specifically.
    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    const cleanEmail = email.toLowerCase();

    // Look for an existing account with this email
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Existing user — check if blocked
      if (user.isBlocked) {
        return res.status(403).json({
          message:
            "This account has been blocked due to suspicious activity. Contact an admin to unblock it.",
        });
      }
    } else {
      // No account yet — auto-create one. Since Google already verified
      // the email, we mark isVerified: true and skip the OTP dance.
      // Password is a random hash — this user logs in via Google, not
      // a typed password. If they ever want a password they can use
      // "forgot password" to set one.
      const isFirstAccountEver = (await User.countDocuments({})) === 0;

      user = await User.create({
        fullName: name || "Google User",
        email: cleanEmail,
        passwordHash: crypto.randomBytes(32).toString("hex"),
        role: isFirstAccountEver ? "admin" : "user",
        isVerified: true,
      });
    }

    const token = signToken(user);
    res.json({
      message: "Logged in with Google",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login failed:", err.message);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
}
