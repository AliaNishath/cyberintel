// Web Speech API Voice Narration Engine

export const isSpeechSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const pauseSpeaking = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
};

export const resumeSpeaking = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
};

export const speakText = (text, options = {}) => {
  if (!isSpeechSupported()) {
    console.warn("Speech synthesis is not supported on this browser.");
    if (options.onEnd) options.onEnd();
    return;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  // Choose a smooth English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("David"))
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (options.onStart) {
    utterance.onstart = options.onStart;
  }

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (err) => {
    console.error("Speech synthesis error:", err);
    if (options.onEnd) options.onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const generateDailyBriefing = (stats = {}, recentThreats = []) => {
  const score = stats.overallScore || 92;
  const threatCount = recentThreats.filter((t) => t.status === "open").length;

  let script = `Good day, Security Officer. Welcome to your CyberIntel Daily Security Briefing. `;
  script += `Your current system defense posture is rated at ${score} out of 100. `;

  if (threatCount === 0) {
    script += `All defensive perimeters are secure. No critical open zero-day intrusions have been detected in the last 24 hours. `;
  } else {
    script += `Alert: You currently have ${threatCount} active incident requiring your attention. `;
    const firstThreat = recentThreats[0];
    if (firstThreat) {
      script += `The latest incident is categorized as ${firstThreat.type || "suspicious traffic"} with ${firstThreat.severity || "medium"} severity. `;
    }
  }

  script += `AI biometric authentication and the 3D Global Threat Matrix are actively monitoring all endpoints. Stay vigilant and stay secure.`;
  return script;
};
