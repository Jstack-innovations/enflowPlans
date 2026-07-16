import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut } from "lucide-react";
import { apiFetch } from "../Config/api";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";

const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

const BUSINESS_TYPES = [
  {
    key: "restaurant",
    label: "Restaurant",
    available: true,
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
    subtypes: [
      { key: "dine_in",       label: "Dine-in" },
      { key: "takeaway",      label: "Takeaway" },
      { key: "delivery",      label: "Delivery" },
      { key: "cloud_kitchen", label: "Cloud kitchen" },
      { key: "multi_branch",  label: "Multi-branch" },
    ],
  },
  {
    key: "fast_food",
    label: "Fast Food",
    available: true,
    img: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80",
    subtypes: [
      { key: "dine_in",      label: "Dine-in" },
      { key: "takeaway",     label: "Takeaway" },
      { key: "delivery",     label: "Delivery" },
      { key: "multi_branch", label: "Multi-branch" },
    ],
  },
  {
    key: "lounge_bar",
    label: "Lounge / Bar",
    available: true,
    img: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80",
    subtypes: [
      { key: "dine_in",  label: "Dine-in" },
      { key: "takeaway", label: "Takeaway" },
      { key: "delivery", label: "Delivery" },
    ],
  },
  {
    key: "hotel",
    label: "Hotel",
    available: false,
    img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80",
    subtypes: [],
  },
  {
    key: "clinic",
    label: "Clinic",
    available: false,
    img: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80",
    subtypes: [],
  },
  {
    key: "ticketing_events",
    label: "Ticketing & Events",
    available: false,
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    subtypes: [],
  },
];

export default function OnboardingStep5() {
  const navigate = useNavigate();
  const { user, plan, onboarding_token, loading } = useOnboardingSession(5);

  const [selectedType, setSelectedType]         = useState("restaurant");
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [status, setStatus]                     = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg]                     = useState("");

  const submitting = status === "loading";
  const activeType = BUSINESS_TYPES.find(t => t.key === selectedType)!;
  const subtypeRequired = activeType.subtypes.length > 0;
  const canContinue = !submitting && (!subtypeRequired || selectedSubtypes.length > 0);

  const handleTypeSelect = (key: string, available: boolean) => {
    if (!available) return;
    setSelectedType(key);
    setSelectedSubtypes([]);
    setErrMsg(""); setStatus("idle");
  };

  const toggleSubtype = (key: string) => {
    setSelectedSubtypes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setErrMsg(""); setStatus("idle");
  };

  const handleContinue = async () => {
    if (subtypeRequired && selectedSubtypes.length === 0) {
      setStatus("error"); setErrMsg("Please select at least one sub-type to continue."); return;
    }
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }
    setStatus("loading"); setErrMsg("");
const data = await apiFetch("/onboardingBusinessType", {
  method: "POST",
  body: JSON.stringify({
    onboarding_token,
    business_type:     selectedType,
    business_subtypes: selectedSubtypes.length > 0 ? selectedSubtypes : null,
  }),
});

if (!data || data.status !== "ok") {
  setStatus("error");
  setErrMsg(data?.message ?? "Could not save business type.");
  return;
}

navigate("/onboarding/step-6", { state: { onboarding_token, user, plan } });
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
        .ob5 * { box-sizing: border-box; }
        .ob5-progress-fill { height:100%; width:45%; background:linear-gradient(90deg,#d6a86a,#b8864a); border-radius:100px; }

        .ob5-card {
          width: 100%; border-radius: 14px; overflow: hidden;
          border: 1.5px solid rgba(214,168,106,0.12);
          margin-bottom: 10px; cursor: pointer;
          transition: border-color 0.18s, transform 0.15s;
          position: relative; background: #0d0a07;
          height: 90px;
        }
        .ob5-card:hover:not(.ob5-card-disabled) { border-color: rgba(214,168,106,0.4); transform: translateY(-1px); }
        .ob5-card.ob5-card-selected { border-color: rgba(214,168,106,0.75); }
        .ob5-card.ob5-card-disabled { cursor: not-allowed; opacity: 0.45; }

        .ob5-card-img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; position: absolute; top: 0; left: 0;
          filter: brightness(0.45) saturate(0.6);
          transition: filter 0.2s;
        }
        .ob5-card.ob5-card-selected .ob5-card-img { filter: brightness(0.6) saturate(0.9); }
        .ob5-card:hover:not(.ob5-card-disabled) .ob5-card-img { filter: brightness(0.55) saturate(0.8); }

        .ob5-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(8,5,2,0.82) 0%, rgba(8,5,2,0.3) 60%, transparent 100%);
        }

        .ob5-card-body {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px;
        }
        .ob5-card-label { font-size: 15px; font-weight: 600; color: #e8e8e8; letter-spacing: 0.2px; }
        .ob5-card.ob5-card-selected .ob5-card-label { color: #fff; }

        .ob5-badge-avail {
          font-size: 10px; padding: 3px 9px; border-radius: 100px;
          background: rgba(74,222,128,0.12); color: #4ade80;
          border: 1px solid rgba(74,222,128,0.25); letter-spacing: 0.3px;
        }
        .ob5-badge-soon {
          font-size: 10px; padding: 3px 9px; border-radius: 100px;
          background: rgba(255,255,255,0.05); color: red;
          border: 1px solid red; letter-spacing: 0.3px;
        }

        .ob5-selected-ring {
          position: absolute; top: 10px; right: 44px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #d6a86a;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 3px rgba(214,168,106,0.25);
        }
        .ob5-selected-ring::after {
          content:''; width:7px; height:7px; border-radius:50%; background:#0c0602;
        }

        .ob5-subtype-box {
          border-radius: 12px; padding: 14px 14px 10px;
          margin-bottom: 20px;
          border: 1.5px solid rgba(214,168,106,0.15);
          background: rgba(214,168,106,0.02);
          transition: border-color 0.2s, background 0.2s;
        }
        .ob5-subtype-box.ob5-subtype-active {
          border-color: rgba(214,168,106,0.55);
          background: rgba(214,168,106,0.06);
          box-shadow: 0 0 0 1px rgba(214,168,106,0.08);
        }
        .ob5-subtype-title {
          font-size: 10px; letter-spacing: 1.2px;
          text-transform: uppercase; margin-bottom: 10px;
          transition: color 0.2s;
        }
        .ob5-subtype-box .ob5-subtype-title { color: #444; }
        .ob5-subtype-box.ob5-subtype-active .ob5-subtype-title { color: #d6a86a; }

        .ob5-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .ob5-chip {
          padding: 7px 14px; border-radius: 100px;
          border: 1px solid rgba(214,168,106,0.15);
          background: rgba(255,255,255,0.02);
          color: #555; font-size: 12px; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .ob5-subtype-active .ob5-chip { color: #888; border-color: rgba(214,168,106,0.2); }
        .ob5-chip:hover { border-color: rgba(214,168,106,0.4); color: #bbb; }
        .ob5-chip.ob5-chip-sel {
          border-color: #d6a86a;
          background: rgba(214,168,106,0.14); color: #d6a86a;
          font-weight: 600;
        }

        .ob5-hint {
          font-size: 12px; color: #d6a86a;
          line-height: 1.7; margin-bottom: 20px;
          padding: 12px 14px; border-radius: 8px;
          background: rgba(214,168,106,0.06);
          border: 1px solid rgba(214,168,106,0.18);
        }

        .ob5-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; margin-bottom: 16px;
        }

        .ob5-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob5-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob5-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob5-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob5-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        .ob5-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        @media (min-width: 480px) { .ob5-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      <div className="ob5" style={{
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
          <div className="ob5-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 5 of 9 · Choose Industry</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>45%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob5-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob5-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              What kind of business are you <span style={{ color: "#d6a86a", fontStyle: "italic" }}>running?</span>
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
              This determines the tools, templates, and AI behaviours Enflow activates for you.
            </p>

            {/* Type cards */}
            {BUSINESS_TYPES.map(type => {
              const isSelected = selectedType === type.key;
              return (
                <div
                  key={type.key}
                  className={`ob5-card${isSelected ? " ob5-card-selected" : ""}${!type.available ? " ob5-card-disabled" : ""}`}
                  onClick={() => handleTypeSelect(type.key, type.available)}
                >
                  <img className="ob5-card-img" src={type.img} alt={type.label} />
                  <div className="ob5-card-overlay" />
                  {isSelected && <div className="ob5-selected-ring" />}
                  <div className="ob5-card-body">
                    <span className="ob5-card-label">{type.label}</span>
                    {type.available
                      ? <span className="ob5-badge-avail">Available</span>
                      : <span className="ob5-badge-soon">Coming soon</span>
                    }
                  </div>
                </div>
              );
            })}

            {/* Sub-type chips */}
            {activeType.subtypes.length > 0 && (
              <div className={`ob5-subtype-box${selectedSubtypes ? " ob5-subtype-active" : " ob5-subtype-active"}`}>
                <div className="ob5-subtype-title">Sub-type · {activeType.label}</div>
                <div className="ob5-chips">
                  {activeType.subtypes.map(sub => (
                    <button
                      key={sub.key}
                      className={`ob5-chip${selectedSubtypes.includes(sub.key) ? " ob5-chip-sel" : ""}`}
                      onClick={() => toggleSubtype(sub.key)}
                      disabled={submitting}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hint */}
            <p className="ob5-hint">
              Your selection shapes Enflow's integrations, reporting structure, and how Zara communicates with your team.
              You can update this later from settings.
            </p>

            {/* Error */}
            {errMsg && <div className="ob5-error">⚠ {errMsg}</div>}

          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob5-nav">
          <div className="ob5-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob5-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button
              className="ob5-btn-continue"
              onClick={handleContinue}
              disabled={!canContinue}
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