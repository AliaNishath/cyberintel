// Plain Language (ELI5) Cybersecurity Jargon Translator

export const PLAIN_LANGUAGE_MAP = {
  "sql injection": {
    plainTitle: "Fake Database Master Key (SQL Injection)",
    analogy: "A hacker typed a sneaky command into a search or login box to trick our database into giving away private information, but our system recognized the fake command and stopped it.",
    action: "Keep using protected database forms with input sanitization.",
  },
  "brute force": {
    plainTitle: "Rapid Password Guessing Attack",
    analogy: "An automated computer bot tried thousands of common passwords in a few seconds to guess an account login. The system detected the speed and locked the door.",
    action: "Use multi-factor authentication (MFA) and strong random passphrases.",
  },
  "malicious url": {
    plainTitle: "Deceptive Phishing Link",
    analogy: "A fake website link designed to look identical to a trusted service (like Netflix or a bank) to trick people into typing their passwords.",
    action: "Never click unexpected email links without checking the exact domain name.",
  },
  "syn flood": {
    plainTitle: "Doorway Traffic Jam (DDoS Attack)",
    analogy: "Thousands of fake robot visitors tried rushing through the server's front door simultaneously to slow it down for real users. Our edge filter threw them out.",
    action: "Deploy edge traffic scrubbing and rate-limit gateways.",
  },
  "ddos": {
    plainTitle: "Overwhelming Traffic Stampede",
    analogy: "A huge army of infected computers tried sending millions of junk requests to crash the website, but our cloud shield absorbed the shock.",
    action: "Enable Cloudflare Anycast traffic absorption.",
  },
  "jwt forgery": {
    plainTitle: "Fake Digital Admin Badge",
    analogy: "Someone tried creating a fake digital security badge claiming to be the Administrator, but our security scanner caught the missing digital signature stamp.",
    action: "Enforce strict asymmetric signature validation with key rotation.",
  },
  "missing hsts": {
    plainTitle: "Missing Security Lock Rule",
    analogy: "The website forgot to tell web browsers to always force an encrypted HTTPS connection, leaving a small window for eavesdropping on public Wi-Fi.",
    action: "Add the Strict-Transport-Security header to all server responses.",
  },
  "missing csp": {
    plainTitle: "Missing Code Gatekeeper (CSP)",
    analogy: "The site doesn't have a strict guard list of which external scripts are allowed to run, which could let unauthorized popup scripts execute.",
    action: "Configure a strict Content-Security-Policy header.",
  },
  "credential stuffing": {
    plainTitle: "Recycled Password Attack",
    analogy: "Criminals took emails and passwords leaked from an old company breach and tested them here to see if users reused the exact same password.",
    action: "Never reuse the same password on multiple websites.",
  },
};

export const translateToPlainLanguage = (text = "") => {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const [key, info] of Object.entries(PLAIN_LANGUAGE_MAP)) {
    if (lower.includes(key)) {
      return info;
    }
  }

  // Fallback generic plain explanation
  return {
    plainTitle: text,
    analogy: "Our automated AI defense grid detected an unusual pattern in network traffic and neutralized the connection before any data could be compromised.",
    action: "Review the system alert log and maintain updated security policies.",
  };
};
