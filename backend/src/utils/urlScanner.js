// Heuristic-based suspicious URL detector. Works immediately with no external
// API key needed. If GOOGLE_SAFE_BROWSING_API_KEY is set in .env later, that
// real threat-intel check runs too and its result is merged in — this file
// is written so upgrading to a real API is a drop-in addition, not a rewrite.

const SUSPICIOUS_TLDS = [".xyz", ".top", ".zip", ".click", ".gq", ".tk", ".ml", ".cf"];
const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "ow.ly"];
const PHISHING_KEYWORDS = [
  "verify-account", "confirm-identity", "login-secure", "account-update",
  "signin-alert", "unlock-account", "wallet-connect", "urgent-action",
  "password-reset-now", "suspended-account",
];
const BRAND_IMPERSONATION = ["paypal", "amazon", "netflix", "microsoft", "apple", "google", "bankofamerica"];

function isIpAddress(hostname) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

export function heuristicScan(rawUrl) {
  const reasons = [];
  let score = 0;
  let parsed;

  try {
    parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`);
  } catch {
    return { score: 100, reasons: ["Not a valid URL"], verdict: "malicious" };
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullUrl = rawUrl.toLowerCase();

  if (parsed.protocol !== "https:") {
    score += 15;
    reasons.push("Site does not use HTTPS encryption");
  }

  if (isIpAddress(hostname)) {
    score += 30;
    reasons.push("URL uses a raw IP address instead of a domain name");
  }

  if (URL_SHORTENERS.some((s) => hostname.includes(s))) {
    score += 20;
    reasons.push("URL uses a link shortener, which can hide the real destination");
  }

  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    score += 20;
    reasons.push(`Domain uses a TLD commonly associated with abuse (${hostname.slice(hostname.lastIndexOf("."))})`);
  }

  const subdomainCount = hostname.split(".").length - 2;
  if (subdomainCount >= 3) {
    score += 15;
    reasons.push("Unusually high number of subdomains");
  }

  if (PHISHING_KEYWORDS.some((kw) => fullUrl.includes(kw))) {
    score += 25;
    reasons.push("URL contains wording commonly used in phishing links");
  }

  const brandHit = BRAND_IMPERSONATION.find((brand) => hostname.includes(brand) && !hostname.endsWith(`${brand}.com`));
  if (brandHit) {
    score += 30;
    reasons.push(`Mentions "${brandHit}" but isn't that brand's real domain — possible impersonation`);
  }

  if (hostname.includes("@") || fullUrl.includes("%00")) {
    score += 25;
    reasons.push("URL contains suspicious encoding or characters");
  }

  score = Math.min(100, score);

  let verdict = "safe";
  if (score >= 60) verdict = "malicious";
  else if (score >= 25) verdict = "suspicious";

  if (reasons.length === 0) reasons.push("No suspicious patterns detected");

  return { score, reasons, verdict, hostname };
}

// Optional real check — only runs if a Safe Browsing key is configured.
export async function safeBrowsingCheck(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "cyberintel", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );
    const data = await res.json();
    return data.matches && data.matches.length > 0;
  } catch (err) {
    console.error("Safe Browsing check failed:", err.message);
    return null;
  }
}