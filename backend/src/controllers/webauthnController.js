import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import User from "../models/user.js";
import { signToken } from "../utils/token.js";

// These three MUST match where the app actually runs. rpID has no protocol/
// port — just the hostname. origin is the exact frontend URL the browser
// sends the WebAuthn ceremony from.
const RP_NAME = "CyberIntel";
const RP_ID = process.env.WEBAUTHN_RP_ID || "localhost";
const ORIGIN = process.env.WEBAUTHN_ORIGIN || "http://localhost:5173";

// GET /api/webauthn/register-options   (protected — enrolling your own account)
export async function getRegistrationOptions(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: user.email,
      userDisplayName: user.fullName,
      attestationType: "none",
      // Prevents re-registering the same credential twice on this account
      excludeCredentials: user.webauthn?.credentialID
        ? [{ id: user.webauthn.credentialID, transports: user.webauthn.transports }]
        : [],
      authenticatorSelection: {
        residentKey: "required", // makes this a real discoverable passkey
        userVerification: "required",
        authenticatorAttachment: "platform", // Face ID / Touch ID / Windows Hello, not a USB key
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    console.error("WebAuthn registration options failed:", err.message);
    res.status(500).json({ message: "Could not start biometric enrollment", error: err.message });
  }
}

// POST /api/webauthn/register-verify   (protected)   { response }
export async function verifyRegistration(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.currentChallenge) {
      return res.status(400).json({ message: "No pending registration for this account" });
    }

    const verification = await verifyRegistrationResponse({
      response: req.body.response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ message: "Biometric enrollment could not be verified" });
    }

    const { credential } = verification.registrationInfo;

    user.webauthn = {
      credentialID: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey).toString("base64"),
      counter: credential.counter,
      transports: req.body.response.response.transports || [],
    };
    user.currentChallenge = undefined;
    await user.save();

    res.json({ message: "Biometric login enrolled successfully" });
  } catch (err) {
    console.error("WebAuthn registration verify failed:", err.message);
    res.status(500).json({ message: "Biometric enrollment failed", error: err.message });
  }
}

// In-memory store for usernameless passkey challenges — we don't know which
// user is logging in yet (that's the whole point), so the challenge can't
// live on a specific User document like the email-first flow does. Short-
// lived and single-use; fine for this scale, would move to Redis at real
// production scale.
const pendingPasskeyChallenges = new Map();

function rememberChallenge(challenge) {
  pendingPasskeyChallenges.set(challenge, Date.now());
  // Clean up anything older than 2 minutes so this map never grows forever
  for (const [c, ts] of pendingPasskeyChallenges) {
    if (Date.now() - ts > 2 * 60 * 1000) pendingPasskeyChallenges.delete(c);
  }
}

// POST /api/webauthn/passkey-login-options   (public, no body needed)
// The real "Sign in with a Passkey" experience — no email typed, the browser
// shows a native picker of every passkey saved for this site.
export async function getPasskeyLoginOptions(req, res) {
  try {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "required",
      // Deliberately empty — this is what makes it "usernameless." The
      // browser looks at ALL discoverable passkeys for this site, not one
      // account's credential list.
      allowCredentials: [],
    });

    rememberChallenge(options.challenge);
    res.json(options);
  } catch (err) {
    console.error("Passkey login options failed:", err.message);
    res.status(500).json({ message: "Could not start passkey login", error: err.message });
  }
}

// POST /api/webauthn/passkey-login-verify   (public)   { response }
export async function verifyPasskeyLogin(req, res) {
  try {
    const { response } = req.body;

    // The browser tells us WHICH credential the person picked — that's how
    // we find out who's logging in, instead of asking for an email first.
    const user = await User.findOne({ "webauthn.credentialID": response.id });
    if (!user || !user.webauthn?.credentialID) {
      return res.status(404).json({ message: "This passkey isn't registered with any account" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been blocked. Contact an admin." });
    }

    // Find which of our still-valid outstanding challenges this response is
    // answering. We don't know it in advance (usernameless), so we try each
    // recent one — in practice there's rarely more than one at a time.
    let verification = null;
    let matchedChallenge = null;
    for (const challenge of pendingPasskeyChallenges.keys()) {
      try {
        verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge: challenge,
          expectedOrigin: ORIGIN,
          expectedRPID: RP_ID,
          credential: {
            id: user.webauthn.credentialID,
            publicKey: Buffer.from(user.webauthn.credentialPublicKey, "base64"),
            counter: user.webauthn.counter,
            transports: user.webauthn.transports,
          },
        });
        if (verification.verified) {
          matchedChallenge = challenge;
          break;
        }
      } catch {
        // wrong challenge for this response — try the next one
      }
    }

    if (!verification?.verified) {
      return res.status(401).json({ message: "Passkey login failed" });
    }

    pendingPasskeyChallenges.delete(matchedChallenge);
    user.webauthn.counter = verification.authenticationInfo.newCounter;
    await user.save();

    const token = signToken(user);
    res.json({
      message: "Logged in with passkey",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("Passkey login verify failed:", err.message);
    res.status(500).json({ message: "Passkey login failed", error: err.message });
  }
}
export async function getAuthenticationOptions(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !user.webauthn?.credentialID) {
      return res.status(404).json({ message: "No biometric login enrolled for this email" });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
      allowCredentials: [{ id: user.webauthn.credentialID, transports: user.webauthn.transports }],
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    console.error("WebAuthn auth options failed:", err.message);
    res.status(500).json({ message: "Could not start biometric login", error: err.message });
  }
}

// POST /api/webauthn/login-verify   (public)   { email, response }
export async function verifyAuthentication(req, res) {
  try {
    const { email, response } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !user.webauthn?.credentialID || !user.currentChallenge) {
      return res.status(400).json({ message: "No pending biometric login for this account" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been blocked. Contact an admin." });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: user.webauthn.credentialID,
        publicKey: Buffer.from(user.webauthn.credentialPublicKey, "base64"),
        counter: user.webauthn.counter,
        transports: user.webauthn.transports,
      },
    });

    if (!verification.verified) {
      return res.status(401).json({ message: "Biometric login failed" });
    }

    user.webauthn.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = undefined;
    await user.save();

    const token = signToken(user);
    res.json({
      message: "Logged in with biometrics",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("WebAuthn auth verify failed:", err.message);
    res.status(500).json({ message: "Biometric login failed", error: err.message });
  }
}