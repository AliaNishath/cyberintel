import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import API_BASE_URL from "../config/api.js";

/* ---------------------------------------------------------
   CyberIntel — AI Assistant Widget
   Floating bubble -> chat window. Frontend only for now:
   sendMessage() below is where the backend/OpenAI call plugs in.
--------------------------------------------------------- */

const SUGGESTIONS = [
  "Why was this login flagged as risky?",
  "Explain my current risk score",
  "How do I enable biometric login?",
  "Summarize today's threats",
];


function TypingDots() {
  return (
    <div className="typing-row">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm the CyberIntel assistant. Ask me about any alert, risk score, or how a module works.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking, open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || thinking) return;
    setMessages((m) => [...m, { role: "user", text: content }]);
    setInput("");
    setThinking(true);
    try {
      const token = localStorage.getItem("cyberintel_token");
      const response = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();

      if (!response.ok || !data.reply) {
        throw new Error(data.message || data.error || "No reply received from the server");
      }

      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `⚠️ Assistant error: ${err.message}` },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="ai-widget-root">
      <style>{`
        * { box-sizing: border-box; }
        .ai-widget-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: fixed; bottom: 24px; right: 24px; z-index: 999;
        }

        .ai-bubble {
          width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff);
          display: flex; align-items: center; justify-content: center; color: #05060a;
          box-shadow: 0 10px 30px rgba(93,169,255,0.35), 0 0 0 0 rgba(255,95,162,0.5);
          animation: bubble-pulse 2.6s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .ai-bubble:hover { transform: scale(1.06); }
        @keyframes bubble-pulse {
          0%, 100% { box-shadow: 0 10px 30px rgba(93,169,255,0.35), 0 0 0 0 rgba(255,95,162,0.35); }
          50% { box-shadow: 0 10px 30px rgba(93,169,255,0.45), 0 0 0 10px rgba(255,95,162,0); }
        }

        .ai-window {
          position: absolute; bottom: 74px; right: 0; width: 360px; height: 500px;
          background: rgba(11,13,22,0.95); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 18px;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 30px 70px rgba(0,0,0,0.55);
          animation: window-in 0.18s ease;
        }
        @keyframes window-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .ai-header {
          display: flex; align-items: center; gap: 10px; padding: 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: linear-gradient(135deg, rgba(255,95,162,0.08), rgba(93,169,255,0.08));
        }
        .ai-header-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff);
          display: flex; align-items: center; justify-content: center; color: #05060a; flex-shrink: 0;
        }
        .ai-header-text { flex: 1; }
        .ai-header-title { font-size: 13.5px; font-weight: 700; color: #eef2fb; display: flex; align-items: center; gap: 6px; }
        .ai-header-sub { font-size: 11px; color: #7fd68a; display: flex; align-items: center; gap: 5px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #7fd68a; box-shadow: 0 0 6px #7fd68a; }
        .ai-close {
          background: none; border: none; color: #9aa4bd; cursor: pointer;
          width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .ai-close:hover { color: #fff; background: rgba(255,255,255,0.06); }

        .ai-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ai-messages::-webkit-scrollbar { width: 5px; }
        .ai-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }

        .msg-row { display: flex; gap: 8px; max-width: 88%; }
        .msg-row.user { align-self: flex-end; flex-direction: row-reverse; }
        .msg-avatar {
          width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .msg-avatar.assistant { background: rgba(93,169,255,0.15); color: #7cbaff; }
        .msg-avatar.user { background: rgba(255,95,162,0.15); color: #ff8fc0; }
        .msg-bubble { font-size: 13.5px; line-height: 1.55; padding: 10px 13px; border-radius: 12px; }
        .msg-row.assistant .msg-bubble {
          background: rgba(255,255,255,0.05); color: #dbe1f0; border-top-left-radius: 4px;
        }
        .msg-row.user .msg-bubble {
          background: linear-gradient(135deg, rgba(255,95,162,0.2), rgba(93,169,255,0.2));
          color: #fff; border-top-right-radius: 4px;
        }

        .typing-row { display: flex; gap: 4px; padding: 10px 13px; background: rgba(255,255,255,0.05); border-radius: 12px; border-top-left-radius: 4px; width: fit-content; }
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #7cbaff; animation: typing-bounce 1.2s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

        .ai-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
        .suggestion-chip {
          font-size: 11.5px; color: #9aa4bd; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 999px; padding: 6px 11px; cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .suggestion-chip:hover { border-color: #5da9ff; color: #fff; }

        .ai-input-row {
          display: flex; align-items: center; gap: 8px; padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .ai-input-row input {
          flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 12px; color: #eef2fb; font-size: 13.5px; outline: none;
        }
        .ai-input-row input:focus { border-color: #5da9ff; }
        .ai-send {
          width: 36px; height: 36px; border-radius: 10px; border: none; flex-shrink: 0;
          background: linear-gradient(135deg, #ff5fa2, #5da9ff); color: #05060a;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .ai-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .ai-window { width: calc(100vw - 32px); right: -8px; }
        }
      `}</style>

      {open && (
        <div className="ai-window">
          <div className="ai-header">
            <div className="ai-header-icon">
              <Sparkles size={17} />
            </div>
            <div className="ai-header-text">
              <div className="ai-header-title">
                <ShieldCheck size={14} /> CyberIntel Assistant
              </div>
              <div className="ai-header-sub">
                <span className="status-dot" /> Online
              </div>
            </div>
            <button className="ai-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="ai-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div className={`msg-row ${m.role}`} key={i}>
                <div className={`msg-avatar ${m.role}`}>
                  {m.role === "assistant" ? <Sparkles size={13} /> : "Y"}
                </div>
                <div className="msg-bubble">{m.text}</div>
              </div>
            ))}
            {thinking && (
              <div className="msg-row assistant">
                <div className="msg-avatar assistant">
                  <Sparkles size={13} />
                </div>
                <TypingDots />
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="ai-suggestions">
              {SUGGESTIONS.map((s) => (
                <span className="suggestion-chip" key={s} onClick={() => send(s)}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="ai-input-row">
            <input
              placeholder="Ask about a threat, score, or feature..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="ai-send" onClick={() => send()} disabled={thinking || !input.trim()}>
              {thinking ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      <button className="ai-bubble" onClick={() => setOpen((o) => !o)}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}