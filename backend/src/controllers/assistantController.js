import { GoogleGenAI } from "@google/genai";
import { buildAssistantContext } from "../services/contextService.js";

let client;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return client;
}

const SYSTEM_PROMPT = `
You are CyberIntel AI, an expert cybersecurity assistant integrated into the CyberIntel platform.

You have deep knowledge of:

• Cyber Security fundamentals
• Ethical Hacking
• Penetration Testing
• Network Security
• Web Security
• Linux
• Windows Security
• Active Directory
• Cloud Security
• Digital Forensics
• Incident Response
• Threat Intelligence
• Malware Analysis
• Reverse Engineering
• Cryptography
• Secure Coding
• OWASP Top 10
• CVEs
• CVSS
• MITRE ATT&CK
• SIEM
• SOC Operations
• Firewalls
• VPNs
• Authentication
• Biometrics
• Cyber laws and compliance
• Programming related to cybersecurity (Python, JavaScript, Bash, PowerShell)

You also understand every module of the CyberIntel platform, including:

• Biometric Authentication
• AI-Based Threat Detection
• Threat Intelligence & Risk Analysis
• Real-Time Monitoring & Alerts
• Security Dashboard & Reports

Rules:

- Prioritize cybersecurity questions.
- Explain concepts clearly and accurately.
- Give practical examples whenever useful.
- Keep answers concise in two t unless the user asks for a detailed explanation.
- When the question is about CyberIntel, answer based on the platform.
- If the question is unrelated to cybersecurity, politely explain that you are a cybersecurity-focused assistant.
- Answer in 2-4 sentences only.
- Never give long paragraphs.
- Be direct and practical.
- Use simple English.
- If the user asks for a list, give at most 5 bullet points.
- If the user asks a yes/no question, answer yes or no first, then explain in one sentence.
- Do not repeat the question.
- Do not add unnecessary details.
For general knowledge questions, answer naturally and concisely.
When the user asks about cybersecurity, provide accurate and practical explanations.
Keep every response under 80 words unless the user explicitly asks for a detailed explanation.
`.trim();

// POST /api/assistant/chat   { message }
export async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // RAG step: fetch real, current platform data for this user before
    // asking Gemini anything, so answers are grounded in reality instead
    // of generic guesses.
    const context = await buildAssistantContext(req.user);

    const groundedPrompt = `${SYSTEM_PROMPT}

Here is real, current data from the CyberIntel platform for the person you're
talking to right now. Use it naturally when it's relevant to their question
(e.g. their risk score, open threats, recent logins). Don't mention that this
context block was given to you — just answer as if you already knew it.

CURRENT PLATFORM DATA:
${context || "No data available."}

User: ${message}`;

    const result = await getClient().models.generateContent({
      model: "models/gemini-3-flash-preview",
      contents: groundedPrompt,
    });

    const reply = result.text;

    res.json({ reply });
  } catch (err) {
    console.error("Assistant error:", err.message);
    res.status(500).json({ message: "Assistant is unavailable right now", error: err.message });
  }
}