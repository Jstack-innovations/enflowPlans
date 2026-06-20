import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../Config/enflowApi";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";


const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

const OTP_LENGTH = 6;

export default function OnboardingStep3() {
  const navigate = useNavigate();

  // Step number = 3, since this IS step 3.
  const { user, plan, onboarding_token, loading } = useOnboardingSession(3);

  const [digits, setDigits]   = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus]   = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errMsg, setErrMsg]   = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join("");
  const submitting = status === "loading";

  // Cooldown ticker for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !onboarding_token) return;
    setResending(true);
    setErrMsg("");
    try {
      const res = await fetch(`${API_BASE}/onboardingResendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_token }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setResendCooldown(60);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      } else {
        setErrMsg(data.message ?? "Could not resend code.");
      }
    } catch {
      setErrMsg("Network error. Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  // If Step2 already told us this account is verified (re-submit case),
  // skip the OTP screen entirely — there's no fresh code waiting for them.
  useEffect(() => {
    if (!loading && (window.history.state?.usr?.already_verified)) {
      navigate("/onboarding/step-4", {
        replace: true,
        state: { onboarding_token, user, plan },
      });
    }
  }, [loading]);

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setStatus("idle");
    setErrMsg("");

    if (clean && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleContinue = async () => {
    if (otp.length !== OTP_LENGTH) {
      setStatus("error"); setErrMsg("Enter the 6-digit code."); return;
    }
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }

    setStatus("loading"); setErrMsg("");

    try {
      const res = await fetch(`${API_BASE}/onboardingVerifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_token, otp }),
      });
      const data = await res.json();

      if (data.status === "ok") {
        setStatus("success");
        navigate("/onboarding/step-4", {
          state: { onboarding_token, user, plan },
        });
      } else {
        setStatus("error");
        setErrMsg(data.message ?? "Incorrect code. Please try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      }
    } catch {
      setStatus("error");
      setErrMsg("Network error. Check your connection.");
    }
  };
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  if (loading) return <OnboardingLoader />;

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ob3 * { box-sizing: border-box; }
        .ob3-progress-fill { height: 100%; width: 27%; background: linear-gradient(90deg, #d6a86a, #b8864a); border-radius: 100px; }

        .ob3-otp-row { display: flex; gap: 8px; justify-content: center; margin: 24px 0 12px; }
        .ob3-otp-box {
          width: 44px; height: 54px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(214,168,106,0.18);
          border-radius: 10px;
          color: #ffffff;
          font-size: 22px;
          font-weight: 600;
          text-align: center;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, background 0.2s;
        }
        .ob3-otp-box:focus { border-color: rgba(214,168,106,0.55); background: rgba(214,168,106,0.06); }
        .ob3-otp-box.error { border-color: rgba(239,68,68,0.5); }

        .ob3-note {
          background: rgba(214,168,106,0.05);
          border-left: 3px solid #d6a86a;
          border-radius: 4px;
          padding: 12px 14px;
          font-size: 12px;
          color: #999;
          line-height: 1.6;
        }

        .ob3-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px; line-height: 1.5;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; text-align: center;
        }

        .ob3-resend {
          text-align: center; font-size: 12px; color: #555;
        }
        .ob3-resend-btn {
          background: none; border: none; color: #d6a86a; font-size: 12px;
          cursor: pointer; font-family: inherit; padding: 0; text-decoration: underline;
        }
        .ob3-resend-btn:disabled { color: #555; cursor: not-allowed; }

        .ob3-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob3-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob3-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob3-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob3-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        .ob3-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        @media (min-width: 480px) { .ob3-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      <div className="ob3" style={{
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
          <div className="ob3-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 3 of 9 · Verify Email</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>27%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob3-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob3-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              Verify your <span style={{ color: "#d6a86a", fontStyle: "italic" }}>email</span>
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px", lineHeight: 1.5 }}>
              We sent a 6-digit code to{" "}
              <span style={{ color: "#ccc" }}>{user?.email ?? "your email"}</span>
            </p>

            {/* ── OTP boxes ── */}
            <div className="ob3-otp-row">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputsRef.current[i] = el)}
                  className={`ob3-otp-box${status === "error" ? " error" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  disabled={submitting}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {/* Error */}
            {errMsg && <div className="ob3-error" style={{ marginBottom: 16 }}>⚠ {errMsg}</div>}

            {/* Resend */}
            <div className="ob3-resend" style={{ marginBottom: 20 }}>
              {resendCooldown > 0 ? (
                <>Resend code in 0:{resendCooldown.toString().padStart(2, "0")}</>
              ) : (
                <>
                  Didn't get a code?{" "}
                  <button className="ob3-resend-btn" onClick={handleResend} disabled={resending}>
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                </>
              )}
            </div>

            <div className="ob3-note">
              <strong style={{ color: "#d6a86a" }}>Note:</strong> the code expires 10 minutes after
              it was sent. If it's expired, go back and re-submit your password to get a new one.
            </div>

          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob3-nav">
          <div className="ob3-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob3-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button
              className="ob3-btn-continue"
              onClick={handleContinue}
              disabled={submitting || otp.length !== OTP_LENGTH}
            >
              {submitting
                ? "Verifying…"
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