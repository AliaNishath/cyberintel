import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  getPasskeyLoginOptions,
  verifyPasskeyLogin,
} from "../controllers/webauthnController.js";

const router = express.Router();

// Enrolling biometrics on your own account — requires being logged in already
router.get("/register-options", requireAuth, getRegistrationOptions);
router.post("/register-verify", requireAuth, verifyRegistration);

// Logging in WITH biometrics (email-first) — no prior auth, this IS the login
router.post("/login-options", getAuthenticationOptions);
router.post("/login-verify", verifyAuthentication);

// Real "Sign in with a Passkey" — usernameless, native account picker
router.post("/passkey-login-options", getPasskeyLoginOptions);
router.post("/passkey-login-verify", verifyPasskeyLogin);

export default router;