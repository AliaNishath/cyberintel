import React, { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
];

export default function LanguageSelector({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem("cyberintel_lang") || "en";
  });
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with Google Translate on mount if a non-English language was previously selected
  useEffect(() => {
    const saved = localStorage.getItem("cyberintel_lang");
    if (saved && saved !== "en") {
      const applySavedLang = () => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = saved;
          select.dispatchEvent(new Event("change"));
        } else {
          setTimeout(applySavedLang, 500);
        }
      };
      applySavedLang();
    }
  }, []);

  const handleSelectLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem("cyberintel_lang", langCode);
    setOpen(false);

    // Set translation cookie for Google Translate
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;

    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="lang-selector-wrap" ref={dropdownRef}>
      <style>{`
        .lang-selector-wrap {
          position: relative;
          display: inline-block;
          z-index: 50;
        }
        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cdd4e6;
          padding: ${compact ? "5px 9px" : "7px 12px"};
          border-radius: 999px;
          cursor: pointer;
          font-size: ${compact ? "12px" : "13px"};
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .lang-btn:hover, .lang-btn.active {
          background: rgba(93, 169, 255, 0.1);
          border-color: #5da9ff;
          color: #fff;
          box-shadow: 0 0 14px rgba(93, 169, 255, 0.15);
        }
        .lang-flag {
          font-size: 13px;
          line-height: 1;
        }
        .lang-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 160px;
          background: rgba(13, 15, 26, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          gap: 3px;
          z-index: 100;
        }
        .lang-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          color: #cdd4e6;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          text-align: left;
          transition: all 0.15s ease;
        }
        .lang-option:hover {
          background: rgba(93, 169, 255, 0.12);
          color: #fff;
        }
        .lang-option.selected {
          background: linear-gradient(135deg, rgba(255, 95, 162, 0.18), rgba(93, 169, 255, 0.18));
          color: #5da9ff;
          font-weight: 600;
          border: 1px solid rgba(93, 169, 255, 0.3);
        }
        .lang-option-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lang-native {
          font-size: 12px;
          color: #9aa4bd;
          margin-left: 4px;
        }
      `}</style>

      <button
        type="button"
        className={`lang-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        title="Switch Language"
      >
        <Globe size={14} color="#5da9ff" />
        <span className="lang-flag">{selected.flag}</span>
        <span>{selected.native}</span>
        <ChevronDown size={13} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectLanguage(lang.code)}
              >
                <div className="lang-option-left">
                  <span className="lang-flag">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {lang.code !== "en" && <span className="lang-native">({lang.native})</span>}
                </div>
                {isSelected && <Check size={14} color="#5da9ff" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}