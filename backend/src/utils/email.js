import nodemailer from "nodemailer";

let transporter;
function getTransporter() {
  if (!transporter) {
    const pass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(toEmail, otp, purpose = "verify") {
  const subject =
    purpose === "reset"
      ? "Your CyberIntel password reset code"
      : "Your CyberIntel verification code";

  const heading =
    purpose === "reset" ? "Reset your password" : "Verify your account";

  // Always log OTP to server console for development & fallback
  console.log(`\n==================================================`);
  console.log(`🔑 [CYBERINTEL OTP] Code for ${toEmail}: ${otp}`);
  console.log(`   Purpose: ${purpose} | Expires in: 5 minutes`);
  console.log(`==================================================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("⚠️ EMAIL_USER or EMAIL_APP_PASSWORD not set. Use the console OTP above.");
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: `CyberIntel <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; background:#05060a; color:#eef2fb; padding:32px; border-radius:16px;">
          <h2 style="margin:0 0 8px;">${heading}</h2>
          <p style="color:#9aa4bd; font-size:14px;">Use the code below. It expires in 5 minutes.</p>
          <div style="font-size:32px; font-weight:700; letter-spacing:8px; margin:20px 0; color:#5da9ff;">
            ${otp}
          </div>
          <p style="color:#6b7488; font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`📧 OTP email successfully delivered to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`⚠️ Failed to send OTP email via Gmail: ${err.message}`);
    console.error(`👉 You can use the OTP printed above in the console to verify.`);
    return false;
  }
}

// Sends a real-time alert email whenever a genuine threat is detected.
// Called from authController (brute force / role mismatch) and
// threatScanController (malicious URL scans) — not a simulation, this
// actually fires whenever a Threat document gets created.
export async function sendThreatAlertEmail(toEmail, threat) {
  try {
    await getTransporter().sendMail({
      from: `CyberIntel Alerts <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `⚠️ CyberIntel Alert: ${threat.type} detected`,
      html: `
        <div style="font-family: sans-serif; background:#05060a; color:#eef2fb; padding:32px; border-radius:16px;">
          <h2 style="margin:0 0 8px; color:#ff5fa2;">New Threat Detected</h2>
          <p style="color:#9aa4bd; font-size:14px; margin-bottom:16px;">CyberIntel just flagged real activity on your platform.</p>
          <table style="width:100%; font-size:13px; color:#eef2fb;">
            <tr><td style="color:#6b7488; padding:4px 0;">Type</td><td>${threat.type}</td></tr>
            <tr><td style="color:#6b7488; padding:4px 0;">Severity</td><td style="color:${threat.severity === "high" ? "#ff5fa2" : "#ffb84d"};">${threat.severity}</td></tr>
            <tr><td style="color:#6b7488; padding:4px 0;">Details</td><td>${threat.title}</td></tr>
          </table>
          <p style="color:#6b7488; font-size:12px; margin-top:16px;">Check your Dashboard or Risk page for full context.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Failed to send threat alert email:", err.message);
    return false;
  }
}