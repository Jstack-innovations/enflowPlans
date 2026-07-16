import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, LogOut, Upload, MessageCircle, Zap, UserPlus, Compass, Phone, Smartphone, MessageSquareText, PartyPopper } from "lucide-react";
import { apiFetch } from "../Config/api";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";


const CHECKLIST = [
  { key: "menu",        label: "Upload your menu",          icon: Upload },
  { key: "whatsapp",    label: "Connect WhatsApp",           icon: MessageCircle },
  { key: "automation",  label: "Set up your first automation", icon: Zap },
  { key: "invite",      label: "Invite your manager",        icon: UserPlus },
  { key: "tour",        label: "Take ZaraAI tour (2 min)",   icon: Compass },
];

export default function OnboardingStep9() {
  const navigate = useNavigate();
  const { user, onboarding_token, loading } = useOnboardingSession(9);

  const [activating, setActivating] = useState(true);
  const [activated, setActivated]   = useState(false);
  const [errMsg, setErrMsg]         = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!onboarding_token) {
      setActivating(false);
      setErrMsg("Session expired. Please go back and start again.");
      return;
    }

    let cancelled = false;

(async () => {
  const data = await apiFetch("/onboardingFinalize", {
    method: "POST",
    body: JSON.stringify({ onboarding_token }),
  });

  if (cancelled) return;

  if (!data || data.status !== "ok") {
    setErrMsg(data?.message ?? "Could not activate your account.");
    setActivating(false);
    return;
  }

  setActivated(true);
  setActivating(false);
  setShowConfetti(true);
  setTimeout(() => setShowConfetti(false), 2600);
})();

    return () => { cancelled = true; };
  }, [loading, onboarding_token]);

  const goToDashboard = () => { window.location.href = "https://dashboard.getenflowai.online/login"; };
const bookCall      = () => window.open("https://calendly.com/enflow/onboarding", "_blank");
const downloadApp   = () => window.open("https://www.getenflowai.online/app", "_blank");
const openWhatsApp  = () => window.open("https://wa.me/2347089913116", "_blank");
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  if (loading || activating) {
    return <OnboardingLoader message={activating ? "Activating your account…" : "Loading"} />;
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes confetti-fall {
          0%   { transform: translateY(-10vh) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
        }
        .ob9 * { box-sizing: border-box; }
        .ob9-progress-fill { height:100%; width:100%; background:linear-gradient(90deg,#d6a86a,#b8864a); border-radius:100px; }

        .ob9-confetti-piece {
          position: fixed; top: 0; width: 8px; height: 14px;
          border-radius: 2px; pointer-events: none; z-index: 200;
          animation: confetti-fall 2.4s ease-in forwards;
        }

        .ob9-checklist {
          border-radius: 14px; border: 1.5px dashed rgba(214,168,106,0.25);
          background: rgba(214,168,106,0.03); padding: 6px 16px;
          margin: 6px 0 22px;
        }
        .ob9-check-row {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ob9-check-row:last-child { border-bottom: none; }
        .ob9-check-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(214,168,106,0.08); border: 1px solid rgba(214,168,106,0.18);
          display: flex; align-items: center; justify-content: center;
        }
        .ob9-check-label { font-size: 13px; color: #ccc; }

        .ob9-cta-primary {
          width: 100%; padding: 16px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 13px; font-weight: 700;
          letter-spacing: 1px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 12px; transition: opacity 0.2s;
        }
        .ob9-cta-primary:hover { opacity: 0.88; }

        .ob9-cta-secondary {
          width: 100%; padding: 14px; border-radius: 100px;
          background: transparent; border: 1.5px dashed rgba(214,168,106,0.3);
          color: #d6a86a; font-size: 12.5px; font-weight: 600; cursor: pointer;
          font-family: inherit; display: flex; align-items: center;
          justify-content: center; gap: 8px; margin-bottom: 12px;
          transition: border-color 0.2s, background 0.2s;
        }
        .ob9-cta-secondary:hover { border-color: rgba(214,168,106,0.55); background: rgba(214,168,106,0.05); }

        .ob9-cta-ghost {
          width: 100%; padding: 14px; border-radius: 100px;
          background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1);
          color: #666; font-size: 12px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: border-color 0.2s, color 0.2s;
        }
        .ob9-cta-ghost:hover { border-color: rgba(255,255,255,0.2); color: #999; }

        .ob9-error {
          padding: 12px 14px; border-radius: 8px; font-size: 12.5px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; margin-bottom: 18px; line-height: 1.5;
        }

        @media (min-width: 480px) { .ob9-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      {showConfetti && (
        <>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="ob9-confetti-piece"
              style={{
                left: `${(i * 97) % 100}%`,
                background: ["#d6a86a", "#b8864a", "#f4d9a8", "#fff"][i % 4],
                animationDelay: `${(i % 6) * 0.15}s`,
              }}
            />
          ))}
        </>
      )}

      <div className="ob9" style={{
        background: "#080502", minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#dddddd", paddingBottom: 50,
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
          <div className="ob9-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 9 of 9 · Launch</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>100%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob9-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob9-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
              You're all set <PartyPopper size={22} color="#d6a86a" />
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 22px", lineHeight: 1.5 }}>
              Welcome to Enflow. Here's what to do next.
            </p>

            {errMsg && <div className="ob9-error">⚠ {errMsg}</div>}

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
              Quick-start checklist
            </div>
            <div className="ob9-checklist">
              {CHECKLIST.map(item => {
                const Icon = item.icon;
                return (
                  <div className="ob9-check-row" key={item.key}>
                    <div className="ob9-check-icon">
                      <Icon size={14} color="#d6a86a" />
                    </div>
                    <span className="ob9-check-label">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <button className="ob9-cta-primary" onClick={goToDashboard} disabled={!activated}>
              Go to dashboard →
            </button>

            <button className="ob9-cta-secondary" onClick={bookCall}>
              <Phone size={13} /> Book free 15-min onboarding call
            </button>

<button className="ob9-cta-secondary" onClick={downloadApp} disabled>
  <Smartphone size={13} /> Download mobile app
</button>

            <button className="ob9-cta-ghost" onClick={openWhatsApp}>
              <MessageSquareText size={13} /> Need help? Chat with us on WhatsApp 24/7
            </button>

          </div>
        </div>

      </div>
    </>
  );
}
