import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, Check, Monitor, MessageCircle, Share2, Star, Bike, BookOpen } from "lucide-react";
import { API_BASE } from "../Config/enflowApi";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";


const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

const TOOLS = [
  {
    key: "pos",
    label: "POS System",
    description: "Square / Toast / Moniepoint / local",
    icon: Monitor,
    multi: true,
    options: [
      { key: "square",     label: "Square" },
      { key: "toast",      label: "Toast" },
      { key: "moniepoint", label: "Moniepoint" },
      { key: "other_pos",  label: "Other" },
    ],
  },
  {
    key: "whatsapp",
    label: "WhatsApp Business",
    description: "For order notifications and customer comms",
    icon: MessageCircle,
    multi: false,
    options: [],
  },
  {
    key: "social",
    label: "Instagram / Facebook",
    description: "Connect your social presence",
    icon: Share2,
    multi: true,
    options: [
      { key: "instagram", label: "Instagram" },
      { key: "facebook",  label: "Facebook" },
    ],
  },
  {
    key: "google_reviews",
    label: "Google Reviews",
    description: "Monitor and respond to reviews",
    icon: Star,
    multi: false,
    options: [],
  },
  {
    key: "delivery",
    label: "Delivery Platform",
    description: "Chowdeck / Glovo / Bolt Food",
    icon: Bike,
    multi: true,
    options: [
      { key: "chowdeck",  label: "Chowdeck" },
      { key: "glovo",     label: "Glovo" },
      { key: "bolt_food", label: "Bolt Food" },
    ],
  },
  {
    key: "accounting",
    label: "Accounting",
    description: "QuickBooks / Zoho / Wave",
    icon: BookOpen,
    multi: true,
    options: [
      { key: "quickbooks", label: "QuickBooks" },
      { key: "zoho",       label: "Zoho" },
      { key: "wave",       label: "Wave" },
    ],
  },
];

type ToolState = {
  enabled: boolean;
  selected: string[];
};

function makeDefault(): Record<string, ToolState> {
  const s: Record<string, ToolState> = {};
  TOOLS.forEach(t => { s[t.key] = { enabled: false, selected: [] }; });
  return s;
}

export default function OnboardingStep6() {
  const navigate = useNavigate();
  const { user, plan, onboarding_token, loading } = useOnboardingSession(6);

  const [tools, setTools]   = useState<Record<string, ToolState>>(makeDefault);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submitting = status === "loading";

  const toggleTool = (key: string) => {
    setTools(prev => {
      const cur = prev[key];
      const nowEnabled = !cur.enabled;
      return { ...prev, [key]: { enabled: nowEnabled, selected: nowEnabled ? cur.selected : [] } };
    });
  };

  const toggleOption = (toolKey: string, optKey: string) => {
    setTools(prev => {
      const cur = prev[toolKey];
      const sel = cur.selected.includes(optKey)
        ? cur.selected.filter(k => k !== optKey)
        : [...cur.selected, optKey];
      return { ...prev, [toolKey]: { ...cur, selected: sel } };
    });
  };

  const anyEnabled = Object.values(tools).some(t => t.enabled);

  const handleContinue = async () => {
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }
    if (!anyEnabled) {
      setStatus("error"); setErrMsg("Connect at least one tool to continue."); return;
    }
    setStatus("loading"); setErrMsg("");

    const payload = {
      onboarding_token,
      pos:            tools.pos.enabled            ? (tools.pos.selected.length            ? tools.pos.selected            : ["connected"]) : [],
      whatsapp:       tools.whatsapp.enabled,
      social:         tools.social.enabled         ? (tools.social.selected.length         ? tools.social.selected         : ["connected"]) : [],
      google_reviews: tools.google_reviews.enabled,
      delivery:       tools.delivery.enabled       ? (tools.delivery.selected.length       ? tools.delivery.selected       : ["connected"]) : [],
      accounting:     tools.accounting.enabled     ? (tools.accounting.selected.length     ? tools.accounting.selected     : ["connected"]) : [],
    };

    try {
      const res  = await fetch(`${API_BASE}/onboardingTools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status !== "ok") {
        setStatus("error"); setErrMsg(data.message ?? "Could not save tools."); return;
      }
    } catch {
      setStatus("error"); setErrMsg("Network error. Check your connection."); return;
    }

    navigate("/onboarding/step-7", { state: { onboarding_token, user, plan } });
  };
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  if (loading) return <OnboardingLoader />;

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ob6 * { box-sizing: border-box; }
        .ob6-progress-fill { height:100%; width:55%; background:linear-gradient(90deg,#d6a86a,#b8864a); border-radius:100px; }

        .ob6-tool {
          width: 100%; border-radius: 14px;
          border: 1.5px solid rgba(214,168,106,0.12);
          margin-bottom: 10px; background: #0d0a07;
          transition: border-color 0.18s;
          overflow: hidden;
        }
        .ob6-tool.ob6-tool-on { border-color: rgba(214,168,106,0.6); }

        .ob6-tool-row {
          display: flex; align-items: center;
          padding: 14px 16px; gap: 12px; cursor: pointer;
        }

        .ob6-tool-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(214,168,106,0.08);
          border: 1px solid rgba(214,168,106,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .ob6-tool.ob6-tool-on .ob6-tool-icon {
          background: rgba(214,168,106,0.15);
          border-color: rgba(214,168,106,0.35);
        }

        .ob6-tool-text { flex: 1; min-width: 0; }
        .ob6-tool-label {
          font-size: 14px; font-weight: 600; color: #ccc;
          transition: color 0.2s;
        }
        .ob6-tool.ob6-tool-on .ob6-tool-label { color: #fff; }
        .ob6-tool-desc { font-size: 11px; color: #555; margin-top: 2px; }

        .ob6-toggle {
          width: 40px; height: 22px; border-radius: 100px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          position: relative; cursor: pointer; flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .ob6-toggle.ob6-toggle-on {
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border-color: transparent;
        }
        .ob6-toggle-knob {
          position: absolute; top: 2px; left: 2px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #555; transition: transform 0.2s, background 0.2s;
        }
        .ob6-toggle.ob6-toggle-on .ob6-toggle-knob {
          transform: translateX(18px); background: #0c0602;
        }

        .ob6-options {
          padding: 0 16px 14px 64px;
          overflow: hidden;
        }
        .ob6-options-label {
          font-size: 10px; color: #555; letter-spacing: 1px;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .ob6-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .ob6-chip {
          padding: 6px 13px; border-radius: 100px;
          border: 1px solid rgba(214,168,106,0.18);
          background: rgba(255,255,255,0.02);
          color: #666; font-size: 11px; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .ob6-chip:hover { border-color: rgba(214,168,106,0.4); color: #bbb; }
        .ob6-chip.ob6-chip-sel {
          border-color: #d6a86a;
          background: rgba(214,168,106,0.14); color: #d6a86a;
          font-weight: 600;
        }

        .ob6-skip-note {
          font-size: 12px; color: #444; text-align: center;
          margin-bottom: 16px; line-height: 1.6;
        }

        .ob6-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; margin-bottom: 16px;
        }

        .ob6-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob6-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob6-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob6-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob6-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        .ob6-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        @media (min-width: 480px) { .ob6-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      <div className="ob6" style={{
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
          <div className="ob6-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 6 of 9 · Connect Tools</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>55%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob6-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob6-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              Connect the tools you <span style={{ color: "#d6a86a", fontStyle: "italic" }}>already use</span>
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
              Connect at least one tool to continue — you can add more later from settings.
            </p>

            {TOOLS.map(tool => {
              const state = tools[tool.key];
              const isOn  = state.enabled;
              const Icon  = tool.icon;
              return (
                <div key={tool.key} className={`ob6-tool${isOn ? " ob6-tool-on" : ""}`}>
                  <div className="ob6-tool-row" onClick={() => toggleTool(tool.key)}>
                    <div className="ob6-tool-icon">
                      <Icon size={16} color={isOn ? "#d6a86a" : "#555"} />
                    </div>
                    <div className="ob6-tool-text">
                      <div className="ob6-tool-label">{tool.label}</div>
                      <div className="ob6-tool-desc">{tool.description}</div>
                    </div>
                    <div className={`ob6-toggle${isOn ? " ob6-toggle-on" : ""}`}>
                      <div className="ob6-toggle-knob" />
                    </div>
                  </div>

                  {isOn && tool.options.length > 0 && (
                    <div className="ob6-options">
                      <div className="ob6-options-label">Which one(s)?</div>
                      <div className="ob6-chips">
                        {tool.options.map(opt => {
                          const sel = state.selected.includes(opt.key);
                          return (
                            <button
                              key={opt.key}
                              className={`ob6-chip${sel ? " ob6-chip-sel" : ""}`}
                              onClick={e => { e.stopPropagation(); toggleOption(tool.key, opt.key); }}
                              disabled={submitting}
                            >
                              {sel && <Check size={10} />}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {errMsg && <div className="ob6-error">⚠ {errMsg}</div>}

          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob6-nav">
          <div className="ob6-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob6-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button
              className="ob6-btn-continue"
              onClick={handleContinue}
              disabled={submitting || !anyEnabled}
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