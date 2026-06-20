import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, Copy, Check, Plus, Trash2, Users } from "lucide-react";
import { API_BASE } from "../Config/enflowApi";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";


const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

const ROLES = [
  { key: "owner",   label: "Owner" },
  { key: "manager", label: "Manager" },
  { key: "cashier", label: "Cashier" },
  { key: "waiter",  label: "Waiter" },
  { key: "kitchen", label: "Kitchen" },
];

const STATIC_INVITE_LINK = "https://www.getenflowai.online/invite/xyz...";

type Teammate = {
  email: string;
  role: string;
};

function emptyTeammate(): Teammate {
  return { email: "", role: "" };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function OnboardingStep7() {
  const navigate = useNavigate();
  const { user, plan, onboarding_token, loading } = useOnboardingSession(7);

  const [team, setTeam]     = useState<Teammate[]>([emptyTeammate(), emptyTeammate(), emptyTeammate()]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const submitting = status === "loading";

  const updateField = (index: number, field: keyof Teammate, value: string) => {
    setTeam(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addRow = () => setTeam(prev => [...prev, emptyTeammate()]);

  const removeRow = (index: number) => {
    setTeam(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
  };

  const filledRows = team.filter(m => m.email.trim() || m.role.trim());
  const validRows  = team.filter(m => m.email.trim() && m.role.trim());

  const hasInvalidEmail = filledRows.some(m => m.email.trim() && !isValidEmail(m.email));
  const hasIncompleteRow = filledRows.some(m => !(m.email.trim() && m.role.trim()));

  const canContinue = validRows.length >= 1 && !hasInvalidEmail && !hasIncompleteRow;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STATIC_INVITE_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unsupported — ignore
    }
  };

  const handleContinue = async () => {
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }
    if (!canContinue) {
      setStatus("error");
      setErrMsg(
        hasInvalidEmail
          ? "Please enter a valid email address for each teammate."
          : "Add at least one teammate with both an email and a role to continue."
      );
      return;
    }

    setStatus("loading"); setErrMsg("");

    const payload = {
      onboarding_token,
      team: validRows.map(m => ({ email: m.email.trim(), role: m.role.trim() })),
    };

    try {
      const res  = await fetch(`${API_BASE}/onboardingTeam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status !== "ok") {
        setStatus("error"); setErrMsg(data.message ?? "Could not save team."); return;
      }
    } catch {
      setStatus("error"); setErrMsg("Network error. Check your connection."); return;
    }

    navigate("/onboarding/step-8", { state: { onboarding_token, user, plan } });
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
        .ob7 * { box-sizing: border-box; }
        .ob7-progress-fill { height:100%; width:64%; background:linear-gradient(90deg,#d6a86a,#b8864a); border-radius:100px; }

        .ob7-row {
          display: flex; gap: 10px; margin-bottom: 10px; align-items: center;
        }

        .ob7-field-group { flex: 1; min-width: 0; }
        .ob7-field-group.ob7-role { flex: 0 0 128px; }

        .ob7-label {
          font-size: 10px; color: #555; letter-spacing: 0.5px;
          text-transform: uppercase; margin-bottom: 6px; display: block;
        }

        .ob7-input, .ob7-select {
          width: 100%; padding: 12px 13px; border-radius: 10px;
          border: 1.5px solid rgba(214,168,106,0.15);
          background: #0d0a07; color: #ddd; font-size: 13px;
          font-family: inherit; outline: none;
          transition: border-color 0.18s;
        }
        .ob7-input::placeholder { color: #444; }
        .ob7-input:focus, .ob7-select:focus { border-color: rgba(214,168,106,0.55); }
        .ob7-input.ob7-input-err { border-color: rgba(239,68,68,0.5); }

        .ob7-select { appearance: none; cursor: pointer; }
        .ob7-select option { background: #0d0a07; color: #ddd; }

        .ob7-remove {
          width: 32px; height: 32px; flex-shrink: 0; margin-top: 18px;
          border-radius: 8px; border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.06); color: #f87171;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s;
        }
        .ob7-remove:hover { background: rgba(239,68,68,0.14); }
        .ob7-remove:disabled { opacity: 0.3; cursor: not-allowed; }

        .ob7-add {
          width: 100%; padding: 12px; border-radius: 10px;
          border: 1.5px dashed rgba(214,168,106,0.3);
          background: transparent; color: #d6a86a; font-size: 12px;
          font-weight: 600; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin: 4px 0 20px; transition: border-color 0.15s, background 0.15s;
        }
        .ob7-add:hover { border-color: rgba(214,168,106,0.55); background: rgba(214,168,106,0.04); }

        .ob7-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 4px 0 14px; color: #444; font-size: 10px;
          letter-spacing: 1.5px; text-transform: uppercase;
        }
        .ob7-divider::before, .ob7-divider::after {
          content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
        }

        .ob7-link-box {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 14px; border-radius: 12px;
          border: 1.5px dashed rgba(214,168,106,0.25);
          background: rgba(214,168,106,0.03); margin-bottom: 18px;
        }
        .ob7-link-text {
          flex: 1; font-size: 12px; color: #888; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap; font-family: monospace;
        }
        .ob7-copy-btn {
          flex-shrink: 0; padding: 8px 14px; border-radius: 100px;
          border: 1px solid rgba(214,168,106,0.3); background: transparent;
          color: #d6a86a; font-size: 11px; font-weight: 600; cursor: pointer;
          font-family: inherit; display: flex; align-items: center; gap: 5px;
          transition: background 0.15s;
        }
        .ob7-copy-btn:hover { background: rgba(214,168,106,0.1); }

        .ob7-note {
          font-size: 12px; color: #444; text-align: center;
          margin-bottom: 16px; line-height: 1.6;
        }

        .ob7-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; margin-bottom: 16px;
        }

        .ob7-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob7-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob7-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob7-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob7-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        .ob7-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        @media (min-width: 480px) { .ob7-inner { max-width: 440px; margin: 0 auto; } }
        @media (max-width: 360px) { .ob7-field-group.ob7-role { flex-basis: 108px; } }
      `}</style>

      <div className="ob7" style={{
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
          <div className="ob7-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 7 of 9 · Invite Team</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>64%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob7-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob7-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              Invite your <span style={{ color: "#d6a86a", fontStyle: "italic" }}>team</span>
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 22px", lineHeight: 1.5 }}>
              Add managers, waiters, kitchen staff — assign roles.
            </p>

            {team.map((member, index) => {
              const rowFilled = member.email.trim() || member.role.trim();
              const emailErr  = rowFilled && member.email.trim() && !isValidEmail(member.email);
              return (
                <div className="ob7-row" key={index}>
                  <div className="ob7-field-group">
                    <span className="ob7-label">Teammate {index + 1} email</span>
                    <input
                      className={`ob7-input${emailErr ? " ob7-input-err" : ""}`}
                      type="email"
                      placeholder="name@email.com"
                      value={member.email}
                      onChange={e => updateField(index, "email", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className="ob7-field-group ob7-role">
                    <span className="ob7-label">Role</span>
                    <select
                      className="ob7-select"
                      value={member.role}
                      onChange={e => updateField(index, "role", e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select</option>
                      {ROLES.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="ob7-remove"
                    onClick={() => removeRow(index)}
                    disabled={submitting || team.length <= 1}
                    aria-label="Remove teammate"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            <button className="ob7-add" onClick={addRow} disabled={submitting}>
              <Plus size={13} /> Add another
            </button>

            <div className="ob7-divider">or share invite link</div>

            <div className="ob7-link-box">
              <Users size={14} color="#666" />
              <span className="ob7-link-text">{STATIC_INVITE_LINK}</span>
              <button className="ob7-copy-btn" onClick={handleCopy} disabled={submitting}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p className="ob7-note">
              At least one teammate is required to continue.
            </p>

            {errMsg && <div className="ob7-error">⚠ {errMsg}</div>}

          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob7-nav">
          <div className="ob7-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob7-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button
              className="ob7-btn-continue"
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