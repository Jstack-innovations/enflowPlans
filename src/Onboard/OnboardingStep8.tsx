import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, Check, Plus, X, Sparkles } from "lucide-react";
import { apiFetch } from "../Config/api";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";


const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

const BRAND_VOICES = [
  { key: "friendly",     label: "Friendly" },
  { key: "professional", label: "Professional" },
  { key: "playful",      label: "Playful" },
  { key: "casual",       label: "Casual" },
  { key: "formal",       label: "Formal" },
  { key: "fun",          label: "Fun" },
  { key: "pidgin",       label: "Pidgin" },
];

const LANGUAGES = ["English", "Pidgin", "Yoruba", "Igbo", "Hausa", "French"];

const ALSO_SPEAKS_OPTIONS = ["Pidgin", "Yoruba", "Igbo", "Hausa", "French", "Swahili", "Arabic"];

const TOP_GOALS = [
  { key: "increase_orders",     label: "More repeat customers" },
  { key: "reduce_wait_time",    label: "Reduce wait time" },
  { key: "automate_whatsapp",   label: "Automate WhatsApp replies" },
  { key: "upsell_items",        label: "Upsell menu items" },
  { key: "reduce_no_shows",     label: "Reduce no-shows" },
  { key: "collect_reviews",     label: "Collect more reviews" },
];

const DAYS = [
  { key: "monday",    label: "Mon" },
  { key: "tuesday",   label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday",  label: "Thu" },
  { key: "friday",    label: "Fri" },
  { key: "saturday",  label: "Sat" },
  { key: "sunday",    label: "Sun" },
];

const HOUR_BLOCKS = [
  "6am–2pm", "8am–6pm", "8am–10pm", "9am–9pm", "10am–10pm", "10am–11pm", "11am–11pm", "24 hours",
];

// Customer message preview by brand voice + language, for the "aha moment" preview
function getZaraPreview(brandVoice: string, primaryLang: string): { customer: string; zara: string } {
  const isPidgin = primaryLang === "Pidgin" || brandVoice === "pidgin";
  if (isPidgin) {
    return {
      customer: "Una still dey open?",
      zara: "Yes o! We dey open till 11pm. You wan order jollof or you dey come dine-in? 🍛",
    };
  }
  const voiceMap: Record<string, string> = {
    friendly:     "Yes! We're open until 11pm. Would you like to place an order or dine in tonight? 😊",
    professional: "Good evening. Yes, we are open until 11pm. Would you like to place an order or reserve a table?",
    playful:      "We sure are! Open till 11pm 🎉 Craving something specific, or want to swing by?",
    casual:       "Yep, open till 11! Want to order or come hang out?",
    formal:       "Good evening. We remain open until 11:00 PM. May I assist with an order or reservation?",
    fun:          "Heck yes we're open! 🙌 Till 11pm. Order in or come vibe with us?",
  };
  return {
    customer: "Are you still open?",
    zara: voiceMap[brandVoice] ?? "Yes! We're open until 11pm. Would you like to place an order or dine in tonight?",
  };
}

export default function OnboardingStep8() {
  const navigate = useNavigate();
  const { user, plan, onboarding_token, loading } = useOnboardingSession(8);

  const [brandVoice, setBrandVoice]   = useState("");
  const [primaryLang, setPrimaryLang] = useState("");
  const [alsoSpeaks, setAlsoSpeaks]   = useState<string[]>([]);
  const [customSpeak, setCustomSpeak] = useState("");
  const [topGoals, setTopGoals]       = useState<string[]>([]);
  const [hourDays, setHourDays]       = useState<string[]>([]);
  const [hourBlock, setHourBlock]     = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submitting = status === "loading";

  const toggleAlsoSpeak = (lang: string) => {
    setAlsoSpeaks(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const addCustomSpeak = () => {
    const v = customSpeak.trim();
    if (v && !alsoSpeaks.includes(v)) {
      setAlsoSpeaks(prev => [...prev, v]);
    }
    setCustomSpeak("");
  };

  const removeAlsoSpeak = (lang: string) => {
    setAlsoSpeaks(prev => prev.filter(l => l !== lang));
  };

  const toggleGoal = (key: string) => {
    setTopGoals(prev => prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]);
  };

  const toggleDay = (key: string) => {
    setHourDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
  };

  const canContinue = !!brandVoice && !!primaryLang;

  const handleContinue = async () => {
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }
    if (!canContinue) {
      setStatus("error"); setErrMsg("Brand voice and primary language are required."); return;
    }

    setStatus("loading"); setErrMsg("");

    const operatingHours = hourDays.map(day => ({
      day,
      hours: hourBlock || null,
    }));

    const payload = {
      onboarding_token,
      brand_voice:      brandVoice,
      primary_language: primaryLang,
      also_speaks:      alsoSpeaks,
      top_goals:        topGoals,
      operating_hours:  operatingHours,
    };

const data = await apiFetch("/onboardingZara", {
  method: "POST",
  body: JSON.stringify(payload),
});

if (!data || data.status !== "ok") {
  setStatus("error");
  setErrMsg(data?.message ?? "Could not save Zara settings.");
  return;
}

navigate("/onboarding/step-9", { state: { onboarding_token, user, plan } });
  };
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  if (loading) return <OnboardingLoader />;

  const preview = getZaraPreview(brandVoice, primaryLang);

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ob8 * { box-sizing: border-box; }
        .ob8-progress-fill { height:100%; width:73%; background:linear-gradient(90deg,#d6a86a,#b8864a); border-radius:100px; }

        .ob8-field { margin-bottom: 18px; }
        .ob8-label {
          font-size: 12px; font-weight: 600; color: #ccc;
          margin-bottom: 8px; display: block;
        }

        .ob8-select {
          width: 100%; padding: 13px 14px; border-radius: 10px;
          border: 1.5px solid rgba(214,168,106,0.15);
          background: #0d0a07; color: #ddd; font-size: 13px;
          font-family: inherit; outline: none; appearance: none;
          cursor: pointer; transition: border-color 0.18s;
        }
        .ob8-select:focus { border-color: rgba(214,168,106,0.55); }
        .ob8-select option { background: #0d0a07; color: #ddd; }

        .ob8-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .ob8-chip {
          padding: 7px 13px; border-radius: 100px;
          border: 1px solid rgba(214,168,106,0.18);
          background: rgba(255,255,255,0.02);
          color: #666; font-size: 11.5px; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .ob8-chip:hover { border-color: rgba(214,168,106,0.4); color: #bbb; }
        .ob8-chip.ob8-chip-sel {
          border-color: #d6a86a;
          background: rgba(214,168,106,0.14); color: #d6a86a;
          font-weight: 600;
        }
        .ob8-chip-remove {
          background: rgba(214,168,106,0.14); color: #d6a86a;
          border-color: #d6a86a; font-weight: 600;
        }

        .ob8-custom-row { display: flex; gap: 8px; margin-top: 10px; }
        .ob8-custom-input {
          flex: 1; padding: 10px 12px; border-radius: 9px;
          border: 1.5px solid rgba(214,168,106,0.15);
          background: #0d0a07; color: #ddd; font-size: 12.5px;
          font-family: inherit; outline: none;
        }
        .ob8-custom-input:focus { border-color: rgba(214,168,106,0.55); }
        .ob8-custom-input::placeholder { color: #444; }
        .ob8-custom-add {
          flex-shrink: 0; width: 38px; border-radius: 9px;
          border: 1.5px solid rgba(214,168,106,0.3);
          background: rgba(214,168,106,0.06); color: #d6a86a;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s;
        }
        .ob8-custom-add:hover { background: rgba(214,168,106,0.14); }

        .ob8-hours-row { display: flex; flex-direction: column; gap: 10px; }
        .ob8-hours-sublabel {
          font-size: 10px; color: #555; letter-spacing: 0.5px;
          text-transform: uppercase; margin-bottom: 7px;
        }

        .ob8-preview {
          border-radius: 14px; border: 1.5px dashed rgba(214,168,106,0.25);
          background: rgba(214,168,106,0.03); padding: 16px 16px 14px;
          margin: 6px 0 18px;
        }
        .ob8-preview-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: #d6a86a; letter-spacing: 1.5px;
          text-transform: uppercase; font-weight: 700; margin-bottom: 12px;
        }
        .ob8-bubble-customer {
          background: rgba(255,255,255,0.06); color: #ccc;
          padding: 10px 14px; border-radius: 14px 14px 14px 4px;
          font-size: 12.5px; max-width: 88%; margin-bottom: 8px; line-height: 1.5;
        }
        .ob8-bubble-zara {
          background: #1a1410; color: #eee; border: 1px solid rgba(214,168,106,0.2);
          padding: 10px 14px; border-radius: 14px 14px 4px 14px;
          font-size: 12.5px; max-width: 92%; margin-left: auto; line-height: 1.5;
        }
        .ob8-bubble-zara-label { color: #d6a86a; font-weight: 700; }

        .ob8-hint {
          font-size: 11px; color: #444; margin-top: 6px; line-height: 1.5;
        }

        .ob8-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; margin-bottom: 16px;
        }

        .ob8-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob8-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob8-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob8-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob8-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        .ob8-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        @media (min-width: 480px) { .ob8-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      <div className="ob8" style={{
        background: "#080502", minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#dddddd", paddingBottom: 90,
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid rgba(214,168,106,0.08)",
          position: "sticky", top: 0, background: "rgba(8,5,2,0.96)",
          backdropFilter: "blur(12px)", zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 30, height: 30, border: "1.5px solid rgba(214,168,106,0.35)",
              borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 13, color: "#d6a86a", fontWeight: 700 }}>E</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>ENFLOW</div>
              <div style={{ fontSize: 8, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>powered by ZaraAI</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: "inherit", padding: 0 }}>
              <HelpCircle size={14} color="#555" /> Help
            </button>
            <button style={{ background: "none", border: "1px solid rgba(214,168,106,0.2)", borderRadius: 100, color: "#d6a86a", fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "5px 11px", display: "flex", alignItems: "center", gap: 5 }} onClick={saveAndExit}>
  <LogOut size={11} color="#d6a86a" /> Save & exit
</button>
          </div>
        </div>

        {/* ── Progress ── */}
        <div style={{ padding: "12px 18px 0" }}>
          <div className="ob8-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 8 of 9 · Personalize AI</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>73%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob8-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob8-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              Personalize <span style={{ color: "#d6a86a", fontStyle: "italic" }}>ZaraAI</span> for your restaurant
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px", lineHeight: 1.5 }}>
              A few quick questions so Zara sounds like you.
            </p>

            {/* Brand voice */}
            <div className="ob8-field">
              <label className="ob8-label">Brand voice</label>
              <select
                className="ob8-select"
                value={brandVoice}
                onChange={e => setBrandVoice(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select a tone</option>
                {BRAND_VOICES.map(v => (
                  <option key={v.key} value={v.key}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Primary language */}
            <div className="ob8-field">
              <label className="ob8-label">Primary language</label>
              <select
                className="ob8-select"
                value={primaryLang}
                onChange={e => setPrimaryLang(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select language</option>
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Also speaks */}
            <div className="ob8-field">
              <label className="ob8-label">Also speaks</label>
              <div className="ob8-chips">
                {ALSO_SPEAKS_OPTIONS.map(lang => {
                  const sel = alsoSpeaks.includes(lang);
                  return (
                    <button
                      key={lang}
                      className={`ob8-chip${sel ? " ob8-chip-sel" : ""}`}
                      onClick={() => toggleAlsoSpeak(lang)}
                      disabled={submitting}
                    >
                      {sel && <Check size={10} />}
                      {lang}
                    </button>
                  );
                })}
                {alsoSpeaks.filter(l => !ALSO_SPEAKS_OPTIONS.includes(l)).map(lang => (
                  <button
                    key={lang}
                    className="ob8-chip ob8-chip-remove"
                    onClick={() => removeAlsoSpeak(lang)}
                    disabled={submitting}
                  >
                    {lang} <X size={10} />
                  </button>
                ))}
              </div>
              <div className="ob8-custom-row">
                <input
                  className="ob8-custom-input"
                  placeholder="Add another language…"
                  value={customSpeak}
                  onChange={e => setCustomSpeak(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSpeak(); } }}
                  disabled={submitting}
                />
                <button className="ob8-custom-add" onClick={addCustomSpeak} disabled={submitting} aria-label="Add language">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Top goals */}
            <div className="ob8-field">
              <label className="ob8-label">Top goals</label>
              <div className="ob8-chips">
                {TOP_GOALS.map(goal => {
                  const sel = topGoals.includes(goal.key);
                  return (
                    <button
                      key={goal.key}
                      className={`ob8-chip${sel ? " ob8-chip-sel" : ""}`}
                      onClick={() => toggleGoal(goal.key)}
                      disabled={submitting}
                    >
                      {sel && <Check size={10} />}
                      {goal.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operating hours */}
            <div className="ob8-field">
              <label className="ob8-label">Operating hours</label>
              <div className="ob8-hours-row">
                <div>
                  <div className="ob8-hours-sublabel">Open days</div>
                  <div className="ob8-chips">
                    {DAYS.map(day => {
                      const sel = hourDays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          className={`ob8-chip${sel ? " ob8-chip-sel" : ""}`}
                          onClick={() => toggleDay(day.key)}
                          disabled={submitting}
                        >
                          {sel && <Check size={10} />}
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="ob8-hours-sublabel">Hours</div>
                  <select
                    className="ob8-select"
                    value={hourBlock}
                    onChange={e => setHourBlock(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select hours</option>
                    {HOUR_BLOCKS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="ob8-hint">Optional — you can refine hours later from settings.</p>
            </div>

            {/* Live preview */}
            <div className="ob8-preview">
              <div className="ob8-preview-label">
                <Sparkles size={12} /> Live ZaraAI Preview
              </div>
              <div className="ob8-bubble-customer">Customer: "{preview.customer}"</div>
              <div className="ob8-bubble-zara">
                <span className="ob8-bubble-zara-label">Zara: </span>"{preview.zara}"
              </div>
            </div>

            {errMsg && <div className="ob8-error">⚠ {errMsg}</div>}

          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob8-nav">
          <div className="ob8-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob8-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button
              className="ob8-btn-continue"
              onClick={handleContinue}
              disabled={submitting || !canContinue}
            >
              {submitting
                ? "Saving…"
                : <><span>Continue</span><ChevronRight size={14} /></>
              }
              {!submitting && <span style={shimmerStyle} />}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
