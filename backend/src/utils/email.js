import nodemailer from "nodemailer";

let transporter;
function getTransporter() {
  if (!transporter) {
    const user = (process.env.EMAIL_USER || "").trim();
    const pass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user,
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

  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    console.warn("⚠️ EMAIL_USER or EMAIL_APP_PASSWORD not set. Use the console OTP above.");
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: `"CyberIntel" <${user}>`,
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
export async function sendThreatAlertEmail(toEmail, threat) {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    console.log(`⚠️ Email credentials not set in process.env. Simulated Threat Email to ${toEmail}: [${threat.type}] ${threat.title}`);
    return false;
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"CyberIntel SOC Alert" <${user}>`,
      to: toEmail,
      subject: `🚨 [SOC ALERT] Security Incident: [${threat.type}] Detected`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#05060a; color:#eef2fb; padding:32px; border-radius:16px; max-width:600px; margin:auto; border:1px solid rgba(255,95,162,0.3);">
          <div style="margin-bottom:16px;">
            <h2 style="margin:0; color:#ff5fa2; font-size:22px;">🚨 CyberIntel Security Alert</h2>
          </div>
          <p style="color:#cdd4e6; font-size:14.5px; line-height:1.6; margin-bottom:20px;">
            An active security incident has just been detected on the CyberIntel platform.
          </p>
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:18px; margin-bottom:20px;">
            <table style="width:100%; font-size:14px; border-collapse:collapse;">
              <tr>
                <td style="color:#6b7488; padding:6px 0; font-weight:600; width:120px;">Incident Type</td>
                <td style="color:#eef2fb; font-weight:700;">${threat.type}</td>
              </tr>
              <tr>
                <td style="color:#6b7488; padding:6px 0; font-weight:600;">Severity Level</td>
                <td><span style="color:${threat.severity === "high" ? "#ff5fa2" : "#ffb84d"}; font-weight:700; text-transform:uppercase;">${threat.severity}</span></td>
              </tr>
              <tr>
                <td style="color:#6b7488; padding:6px 0; font-weight:600;">Summary</td>
                <td style="color:#a5d8ff;">${threat.title}</td>
              </tr>
              ${threat.scannedUrl ? `<tr><td style="color:#6b7488; padding:6px 0; font-weight:600;">Target URL</td><td style="color:#ff8fc0; word-break:break-all;">${threat.scannedUrl}</td></tr>` : ""}
              ${threat.riskScore ? `<tr><td style="color:#6b7488; padding:6px 0; font-weight:600;">Risk Score</td><td style="color:#ff5fa2; font-weight:700;">${threat.riskScore}/100</td></tr>` : ""}
              ${threat.relatedEmail ? `<tr><td style="color:#6b7488; padding:6px 0; font-weight:600;">User / Target</td><td style="color:#eef2fb;">${threat.relatedEmail}</td></tr>` : ""}
            </table>
          </div>
          <p style="color:#9aa4bd; font-size:13px; line-height:1.5;">
            ${threat.description || "Action is being logged on your live dashboard."}
          </p>
          <div style="margin-top:24px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#6b7488;">
            CyberIntel Security Monitoring Engine · Admin Broadcast Notification
          </div>
        </div>
      `,
    });
    console.log(`📧 Threat alert email successfully delivered to ${toEmail} (ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`⚠️ Failed to send threat alert email to ${toEmail}:`, err.message);
    return false;
  }
}

export async function notifyAdminsOfThreat(threat) {
  try {
    const User = (await import("../models/user.js")).default;
    const admins = await User.find({ role: "admin" }).select("email");
    const recipientSet = new Set(admins.map((a) => (a.email || "").toLowerCase().trim()).filter(Boolean));
    
    if (process.env.EMAIL_USER) {
      recipientSet.add(process.env.EMAIL_USER.toLowerCase().trim());
    }
    
    const recipients = Array.from(recipientSet);
    if (recipients.length === 0) return;

    console.log(`📧 Dispatching threat alert to admins: ${recipients.join(", ")}`);
    await Promise.all(recipients.map((email) => sendThreatAlertEmail(email, threat)));
  } catch (err) {
    console.error("Failed to notify admins of threat:", err.message);
  }
}