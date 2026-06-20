import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, HelpCircle, LogOut,
  Eye, EyeOff, Lock, CheckCircle2, User, Mail, Phone,
} from "lucide-react";
import { API_BASE } from "../Config/enflowApi";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";



const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short",  color: "#ef4444" },
    { label: "Weak",       color: "#ef4444" },
    { label: "Fair",       color: "#f59e0b" },
    { label: "Good",       color: "#84cc16" },
    { label: "Strong",     color: "#22c55e" },
  ];
  return { score, ...map[score] };
}

export default function OnboardingStep2() {
  const navigate  = useNavigate();

  // Step number = 2, since this IS step 2.
  // Replaces the old: const { onboarding_token, user, plan } = location.state ?? {};
  const { user, plan, onboarding_token, loading } = useOnboardingSession(2);

  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [status,   setStatus]   = useState<"idle" | "loading" | "error">("idle");
  const [errMsg,   setErrMsg]   = useState("");

  const strength = getStrength(password);

  const handleContinue = async () => {
    if (!password.trim()) {
      setStatus("error"); setErrMsg("Please enter a password."); return;
    }
    if (strength.score < 2) {
      setStatus("error"); setErrMsg("Please choose a stronger password."); return;
    }
    if (!agreed) {
      setStatus("error"); setErrMsg("Please agree to the Terms of Service and Privacy Policy."); return;
    }
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }

    setStatus("loading"); setErrMsg("");

    try {
      const res = await fetch(`${API_BASE}/onboardingSetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_token, password }),
      });
      const data = await res.json();

      if (data.status === "ok") {
        navigate("/onboarding/step-3", {
          state: { onboarding_token, user, plan, already_verified: data.already_verified ?? false },
        });
      } else {
        setStatus("error");
        setErrMsg(data.message ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrMsg("Network error. Check your connection.");
    }
  };
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  const submitting = status === "loading";

  // While the session hook checks location.state / localStorage / server,
  // don't render the form with half-missing user data.
  if (loading) return <OnboardingLoader />;

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ob2 * { box-sizing: border-box; }

        /* Progress */
        .ob2-progress-fill {
          height: 100%;
          width: 18%;
          background: linear-gradient(90deg, #d6a86a, #b8864a);
          border-radius: 100px;
        }

        /* Read-only info card */
        .ob2-info-card {
          background: rgba(214,168,106,0.04);
          border: 1px solid rgba(214,168,106,0.12);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ob2-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ob2-info-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(214,168,106,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ob2-info-label {
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 2px;
        }
        .ob2-info-value {
          font-size: 13px;
          color: #ccc;
          font-weight: 500;
        }
        .ob2-info-empty {
          font-size: 12px;
          color: #3a3a3a;
          font-style: italic;
        }
        .ob2-edit-link {
          font-size: 10px;
          color: #d6a86a;
          letter-spacing: 0.5px;
          text-decoration: none;
          margin-left: auto;
          flex-shrink: 0;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
        }
        .ob2-edit-link:hover { text-decoration: underline; }

        /* Field */
        .ob2-field { display: flex; flex-direction: column; gap: 6px; }
        .ob2-label {
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: #666; display: flex; align-items: center; gap: 5px;
        }
        .ob2-input-wrap { position: relative; display: flex; align-items: center; }
        .ob2-input-icon {
          position: absolute; left: 13px; color: #444; pointer-events: none;
          display: flex; align-items: center;
        }
        .ob2-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(214,168,106,0.15);
          border-radius: 10px;
          padding: 13px 42px 13px 38px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .ob2-input:focus { border-color: rgba(214,168,106,0.45); }
        .ob2-input::placeholder { color: #3a3a3a; }
        .ob2-input:disabled { opacity: 0.5; }

        /* Password toggle */
        .ob2-pw-toggle {
          position: absolute; right: 13px;
          background: none; border: none;
          color: #555; cursor: pointer; padding: 0;
          display: flex; align-items: center;
        }
        .ob2-pw-toggle:hover { color: #888; }

        /* Strength */
        .ob2-strength-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          overflow: hidden;
          margin-top: 6px;
        }
        .ob2-strength-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.35s ease, background 0.35s ease;
        }

        /* Checkbox */
        .ob2-checkbox-row {
          display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
        }
        .ob2-checkbox-box {
          width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
          border: 1.5px solid rgba(214,168,106,0.3);
          background: rgba(214,168,106,0.05);
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px; transition: border-color 0.2s, background 0.2s;
        }
        .ob2-checkbox-box.checked {
          background: rgba(214,168,106,0.15);
          border-color: rgba(214,168,106,0.6);
        }

        /* Error */
        .ob2-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px; line-height: 1.5;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
        }

        /* Buttons */
        .ob2-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob2-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob2-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob2-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob2-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        /* Bottom nav */
        .ob2-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        @media (min-width: 480px) {
          .ob2-inner { max-width: 440px; margin: 0 auto; }
        }
      `}</style>

      <div className="ob2" style={{
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
          <div className="ob2-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 2 of 9 · Set Password</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>18%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob2-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob2-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              Set your <span style={{ color: "#d6a86a", fontStyle: "italic" }}>password</span>
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px", lineHeight: 1.5 }}>
              Confirm your details, then choose a secure password.
            </p>

            {/* ── Read-only info card ── */}
            <div className="ob2-info-card" style={{ marginBottom: 24 }}>

              {/* Name */}
              <div className="ob2-info-row">
                <div className="ob2-info-icon">
                  <User size={13} color="#d6a86a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ob2-info-label">Full Name</div>
                  {user?.name
                    ? <div className="ob2-info-value">{user.name}</div>
                    : <div className="ob2-info-empty">Not provided</div>
                  }
                </div>
                <button className="ob2-edit-link" onClick={() => navigate(-1)}>Edit</button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(214,168,106,0.07)", margin: "0 -16px" }} />

              {/* Email */}
              <div className="ob2-info-row">
                <div className="ob2-info-icon">
                  <Mail size={13} color="#d6a86a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ob2-info-label">Email</div>
                  {user?.email
                    ? <div className="ob2-info-value">{user.email}</div>
                    : <div className="ob2-info-empty">Not provided</div>
                  }
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(214,168,106,0.07)", margin: "0 -16px" }} />

              {/* Phone */}
              <div className="ob2-info-row">
                <div className="ob2-info-icon">
                  <Phone size={13} color="#d6a86a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ob2-info-label">Phone (WhatsApp)</div>
                  {user?.phone
                    ? <div className="ob2-info-value">{user.phone}</div>
                    : <div className="ob2-info-empty">Not added</div>
                  }
                </div>
              </div>

            </div>

            {/* ── Password field ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="ob2-field">
                <label className="ob2-label"><Lock size={11} color="#555" /> Password</label>
                <div className="ob2-input-wrap">
                  <span className="ob2-input-icon"><Lock size={14} /></span>
<input
                    className="ob2-input"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setStatus("idle"); setErrMsg(""); }}
                    disabled={submitting}
                    autoFocus
                  />
                  <button className="ob2-pw-toggle" onClick={() => setShowPw(p => !p)} type="button">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <>
                    <div className="ob2-strength-track">
                      <div
                        className="ob2-strength-fill"
                        style={{
                          width: `${(strength.score / 4) * 100}%`,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: strength.color, marginTop: 3 }}>
                      {strength.label}
                    </div>
                  </>
                )}
              </div>

              {/* ToS checkbox */}
              <div className="ob2-checkbox-row" onClick={() => setAgreed(a => !a)}>
                <div className={`ob2-checkbox-box${agreed ? " checked" : ""}`}>
                  {agreed && <CheckCircle2 size={12} color="#d6a86a" />}
                </div>
                <span style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    onClick={e => e.stopPropagation()}
                    style={{ color: "#d6a86a", textDecoration: "none" }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    onClick={e => e.stopPropagation()}
                    style={{ color: "#d6a86a", textDecoration: "none" }}
                  >
                    Privacy Policy
                  </a>
                </span>
              </div>

              {/* Error */}
              {errMsg && <div className="ob2-error">⚠ {errMsg}</div>}

              {/* OTP note */}
              <p style={{ fontSize: 11, color: "#3a3a3a", lineHeight: 1.6, margin: 0 }}>
                After this step we'll send a 6-digit code to{" "}
                <span style={{ color: "#666" }}>{user?.email ?? "your email"}</span> to verify your account.
              </p>

            </div>
          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob2-nav">
          <div className="ob2-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
<button className="ob2-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
          <button
              className="ob2-btn-continue"
              onClick={handleContinue}
              disabled={submitting}
            >
              {submitting
                ? "Sending code…"
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
