import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../Config/enflowApi";
import { Eye, EyeOff } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

const COUNTRIES = [
  { code: "NG", flag: "🇳🇬", dial: "+234" },
  { code: "US", flag: "🇺🇸", dial: "+1" },
  { code: "GB", flag: "🇬🇧", dial: "+44" },
  { code: "GH", flag: "🇬🇭", dial: "+233" },
  { code: "KE", flag: "🇰🇪", dial: "+254" },
  { code: "ZA", flag: "🇿🇦", dial: "+27" },
  { code: "CA", flag: "🇨🇦", dial: "+1" },
  { code: "AU", flag: "🇦🇺", dial: "+61" },
  { code: "DE", flag: "🇩🇪", dial: "+49" },
  { code: "FR", flag: "🇫🇷", dial: "+33" },
  { code: "AE", flag: "🇦🇪", dial: "+971" },
  { code: "IN", flag: "🇮🇳", dial: "+91" },
];

const shimmerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "40px",
  height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite",
  pointerEvents: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(214,168,106,0.15)",
  borderRadius: 10,
  padding: "13px 16px",
  color: "#ffffff",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function TrialSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan ?? null;

  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [phone, setPhone]                   = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [status, setStatus]                 = useState<FormState>("idle");
  const [message, setMessage]               = useState("");
  const [trialDays, setTrialDays]           = useState<number>(10);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then(r => r.json())
      .then(data => setTrialDays(data.trial_days))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/trialSignup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: `${selectedCountry.dial} ${phone}`,
          plan: plan?.title ?? null,
        }),
      });
      const data = await res.json();

      if (data.status === "existing") {
        const expired = new Date(data.user.trial_ends_at) < new Date();
        if (expired) {
          setStatus("success");
          setMessage("Welcome back! Redirecting you to upgrade...");
          setTimeout(() => navigate("/checkout", { state: { plan, user: data.user } }), 1800);
        } else {
          setStatus("error");
          setMessage("You already have an active trial. Check your email for your login details.");
        }
      } else if (data.status === "new") {
        localStorage.setItem("onboarding_token", data.user.onboarding_token);
        setStatus("success");
        setMessage("Trial started! Taking you to set up your account...");
        setTimeout(() => navigate("/onboarding", { 
  state: { 
    onboarding_token: data.user.onboarding_token,
    user: data.user, 
    plan 
  } 
}), 1800);
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  const disabled = status === "loading" || status === "success";

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      <div style={{
        background: "#080502",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#dddddd",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", marginBottom: 28, padding: 0, fontFamily: "inherit", letterSpacing: 1 }}
          >
            ← Back
          </button>

          {/* Brand */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#d6a86a",
              border: "1px solid rgba(214,168,106,0.25)",
              borderRadius: 100,
              padding: "5px 14px",
              background: "rgba(214,168,106,0.05)",
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
            }}>
              EnflowAI · Restaurant Intelligence
              <span style={shimmerStyle} />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 300, lineHeight: 1.15, color: "#ffffff", marginBottom: 8 }}>
              Start your <span style={{ color: "#d6a86a", fontStyle: "italic" }}>{trialDays}-day free</span> trial.
            </h1>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>
              No credit card needed — full access from day one.
            </p>
            {plan && (
              <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(214,168,106,0.07)", border: "1px solid rgba(214,168,106,0.2)", borderRadius: 100, padding: "5px 14px" }}>
                <span style={{ fontSize: 10, color: "#d6a86a", letterSpacing: 2, textTransform: "uppercase" }}>Plan</span>
                <span style={{ fontSize: 11, color: "#ffffff", fontWeight: 600 }}>{plan.title} — {plan.price}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <div style={{
            background: "rgba(255,238,215,0.02)",
            border: "1px solid rgba(214,168,106,0.1)",
            borderRadius: 16,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}>

            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Kendrell Powells"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={disabled}
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>Email</label>
              <input
                type="email"
                placeholder="powells@ccJitters.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={disabled}
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>Phone</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={selectedCountry.code}
                  onChange={e => {
                    const found = COUNTRIES.find(c => c.code === e.target.value);
                    if (found) setSelectedCountry(found);
                  }}
                  disabled={disabled}
                  style={{
                    background: "rgba(214,168,106,0.08)",
                    border: "1px solid rgba(214,168,106,0.18)",
                    borderRadius: 10,
                    padding: "13px 12px",
                    color: "#d6a86a",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} style={{ background: "#120a04", color: "#dddddd" }}>
                      {c.flag} {c.dial}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="800 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  disabled={disabled}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.5,
                background: status === "error" ? "rgba(239,68,68,0.08)" : "rgba(214,168,106,0.08)",
                border: `1px solid ${status === "error" ? "rgba(239,68,68,0.25)" : "rgba(214,168,106,0.25)"}`,
                color: status === "error" ? "#f87171" : "#d6a86a",
              }}>
                {status === "success" ? "✓ " : "⚠ "}{message}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={disabled}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 100,
                background: disabled
                  ? "rgba(214,168,106,0.4)"
                  : "linear-gradient(135deg, #d6a86a, #b8864a)",
                border: "none",
                color: "#0c0602",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {status === "loading" ? "Please wait..." : status === "success" ? "✓ Redirecting..." : "Start Free Trial →"}
              {!disabled && <span style={shimmerStyle} />}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#555" }}>
              Already have an account?{" "}
              <a href="/login" style={{ color: "#d6a86a", textDecoration: "none" }}>Sign in</a>
            </p>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#333" }}>
            © 2026 jSTack Innovations · ENFLOW
          </p>
        </div>
      </div>
    </>
  );
}
