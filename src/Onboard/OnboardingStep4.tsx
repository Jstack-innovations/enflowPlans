import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, UploadCloud, X } from "lucide-react";
import { apiFetch } from "../Config/api";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";


const shimmerStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
  animation: "enflow-shimmer 2.5s infinite", pointerEvents: "none",
};

const STAFF_OPTIONS = ["1–4", "5–10", "11–25", "26–50", "51–100", "100+"];

export default function OnboardingStep4() {
  const navigate = useNavigate();
  const { user, plan, onboarding_token, loading } = useOnboardingSession(4);

  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite]           = useState("");
  const [country, setCountry]           = useState("Nigeria");
  const [currency, setCurrency]         = useState("NGN");
  const [numLocations, setNumLocations] = useState("1");
  const [numStaff, setNumStaff]         = useState("");
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrMsg("Logo must be under 2MB."); setStatus("error"); return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrMsg(""); setStatus("idle");
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrMsg("Logo must be under 2MB."); setStatus("error"); return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrMsg(""); setStatus("idle");
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = async () => {
    if (!businessName.trim()) {
      setStatus("error"); setErrMsg("Business name is required."); return;
    }
    if (!country.trim()) {
      setStatus("error"); setErrMsg("Country is required."); return;
    }
    if (!currency.trim()) {
      setStatus("error"); setErrMsg("Currency is required."); return;
    }
    if (!onboarding_token) {
      setStatus("error"); setErrMsg("Session expired. Please go back and start again."); return;
    }

    setStatus("loading"); setErrMsg("");

    const form = new FormData();
form.append("onboarding_token", onboarding_token);
form.append("business_name", businessName.trim());
form.append("country", country.trim());
form.append("currency", currency.trim());
form.append("num_locations", String(parseInt(numLocations) || 1));
form.append("num_staff", String(parseStaff(numStaff)));
if (website.trim()) form.append("website", website.trim());
if (logoFile) form.append("logo", logoFile);

const data = await apiFetch("/onboardingBusiness", {
  method: "POST",
  body: form,
});

if (!data || data.status !== "ok") {
  setStatus("error");
  setErrMsg(data?.message ?? "Could not save business details.");
  return;
}

navigate("/onboarding/step-5", {
  state: { onboarding_token, user, plan },
});
  };
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  const submitting = status === "loading";

  if (loading) return <OnboardingLoader />;

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ob4 * { box-sizing: border-box; }
        .ob4-progress-fill { height: 100%; width: 36%; background: linear-gradient(90deg, #d6a86a, #b8864a); border-radius: 100px; }

        .ob4-label {
          font-size: 11px; color: #666; letter-spacing: 0.8px;
          text-transform: uppercase; margin-bottom: 6px; display: block;
        }
        .ob4-input {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(214,168,106,0.15);
          border-radius: 10px; color: #fff; font-size: 13px;
          font-family: inherit; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .ob4-input::placeholder { color: #3a3a3a; }
        .ob4-input:focus { border-color: rgba(214,168,106,0.45); background: rgba(214,168,106,0.04); }
        .ob4-input.error { border-color: rgba(239,68,68,0.4); }

        .ob4-select {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(214,168,106,0.15);
          border-radius: 10px; color: #fff; font-size: 13px;
          font-family: inherit; outline: none; appearance: none;
          transition: border-color 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-color: rgba(255,255,255,0.04);
          cursor: pointer;
        }
        .ob4-select:focus { border-color: rgba(214,168,106,0.45); }
        .ob4-select option { background: #1a1208; color: #fff; }

        .ob4-staff-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .ob4-staff-chip {
          padding: 9px 6px; border-radius: 8px; font-size: 12px;
          border: 1px solid rgba(214,168,106,0.15);
          background: rgba(255,255,255,0.03);
          color: #666; cursor: pointer; text-align: center;
          font-family: inherit; transition: all 0.15s;
        }
        .ob4-staff-chip:hover { border-color: rgba(214,168,106,0.3); color: #999; }
        .ob4-staff-chip.selected {
          border-color: rgba(214,168,106,0.55);
          background: rgba(214,168,106,0.08);
          color: #d6a86a;
        }

        .ob4-dropzone {
          border: 1.5px dashed rgba(214,168,106,0.2);
          border-radius: 10px; padding: 28px 16px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          background: rgba(255,255,255,0.02);
        }
        .ob4-dropzone:hover { border-color: rgba(214,168,106,0.4); background: rgba(214,168,106,0.03); }
        .ob4-dropzone-label { font-size: 12px; color: #555; }
        .ob4-dropzone-sub { font-size: 10px; color: #3a3a3a; }

        .ob4-logo-preview {
          position: relative; display: inline-flex;
          align-items: center; gap: 10px;
          background: rgba(214,168,106,0.06);
          border: 1px solid rgba(214,168,106,0.2);
          border-radius: 10px; padding: 10px 14px;
        }
        .ob4-logo-preview img { width: 40px; height: 40px; object-fit: contain; border-radius: 6px; }
        .ob4-logo-preview-name { font-size: 12px; color: #aaa; flex: 1; word-break: break-all; }
        .ob4-logo-remove {
          background: none; border: none; cursor: pointer;
          color: #555; padding: 2px; display: flex; align-items: center;
          transition: color 0.15s;
        }
        .ob4-logo-remove:hover { color: #f87171; }

        .ob4-note {
          background: rgba(214,168,106,0.05);
          border-left: 3px solid #d6a86a;
          border-radius: 4px; padding: 12px 14px;
          font-size: 12px; color: #999; line-height: 1.6;
        }

        .ob4-error {
          padding: 10px 14px; border-radius: 8px; font-size: 12px; line-height: 1.5;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
        }

        .ob4-btn-continue {
          flex: 1; padding: 13px; border-radius: 100px;
          background: linear-gradient(135deg, #d6a86a, #b8864a);
          border: none; color: #0c0602; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          font-family: inherit; position: relative; overflow: hidden;
          transition: opacity 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .ob4-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob4-btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

        .ob4-btn-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #555; font-size: 12px;
          padding: 10px 18px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
          transition: border-color 0.2s, color 0.2s; white-space: nowrap;
        }
        .ob4-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }

        .ob4-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1);
          backdrop-filter: blur(12px); padding: 12px 18px 24px;
          display: flex; align-items: center; gap: 10px; z-index: 100;
        }

        .ob4-field { margin-bottom: 18px; }

        @media (min-width: 480px) { .ob4-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      <div className="ob4" style={{
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
          <div className="ob4-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 4 of 9 · Business Profile</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>36%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob4-progress-fill" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 18px 0", animation: "fadeUp 0.4s ease both" }}>
          <div className="ob4-inner">

            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", margin: "0 0 6px" }}>
              Tell us about your <span style={{ color: "#d6a86a", fontStyle: "italic" }}>business</span>
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.5 }}>
              We'll tailor Enflow to your operations.
            </p>

            {/* Business name */}
            <div className="ob4-field">
              <label className="ob4-label">Business name</label>
              <input
                className={`ob4-input${status === "error" && !businessName ? " error" : ""}`}
                type="text"
                placeholder="e.g. ccJitters"
                value={businessName}
                onChange={e => { setBusinessName(e.target.value); setStatus("idle"); setErrMsg(""); }}
                disabled={submitting}
              />
            </div>

            {/* Website */}
            <div className="ob4-field">
              <label className="ob4-label">Website <span style={{ color: "#3a3a3a", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input
                className="ob4-input"
                type="url"
                placeholder="www.ccjitters.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Country */}
            <div className="ob4-field">
              <label className="ob4-label">Country</label>
              <select
                className="ob4-select"
                value={country}
                onChange={e => {
                  setCountry(e.target.value);
                  const map: Record<string, string> = {
                    "Nigeria": "NGN", "Ghana": "GHS", "Kenya": "KES",
                    "South Africa": "ZAR", "Uganda": "UGX", "Tanzania": "TZS",
                    "Rwanda": "RWF", "United States": "USD", "United Kingdom": "GBP",
                  };
                  if (map[e.target.value]) setCurrency(map[e.target.value]);
                }}
                disabled={submitting}
              >
                {["Nigeria","Ghana","Kenya","South Africa","Uganda","Tanzania","Rwanda","United States","United Kingdom","Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div className="ob4-field">
              <label className="ob4-label">Currency</label>
              <select
                className="ob4-select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                disabled={submitting}
              >
                {[
                  ["NGN","NGN ₦ — Nigerian Naira"],
                  ["GHS","GHS ₵ — Ghanaian Cedi"],
                  ["KES","KES — Kenyan Shilling"],
                  ["ZAR","ZAR R — South African Rand"],
                  ["UGX","UGX — Ugandan Shilling"],
                  ["TZS","TZS — Tanzanian Shilling"],
                  ["RWF","RWF — Rwandan Franc"],
                  ["USD","USD $ — US Dollar"],
                  ["GBP","GBP £ — British Pound"],
                ].map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Number of locations */}
            <div className="ob4-field">
              <label className="ob4-label">Number of locations</label>
              <input
                className="ob4-input"
                type="number"
                min="1"
                max="999"
                placeholder="1"
                value={numLocations}
                onChange={e => setNumLocations(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Number of staff */}
            <div className="ob4-field">
              <label className="ob4-label">Number of staff</label>
              <div className="ob4-staff-grid">
                {STAFF_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`ob4-staff-chip${numStaff === opt ? " selected" : ""}`}
                    onClick={() => setNumStaff(opt)}
                    disabled={submitting}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo upload */}
            <div className="ob4-field">
              <label className="ob4-label">Logo upload <span style={{ color: "#3a3a3a", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                style={{ display: "none" }}
                onChange={handleFilePick}
              />
              {logoPreview ? (
                <div className="ob4-logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                  <span className="ob4-logo-preview-name">{logoFile?.name}</span>
                  <button className="ob4-logo-remove" onClick={removeLogo} disabled={submitting}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className="ob4-dropzone"
                  onClick={handleDropZoneClick}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  <UploadCloud size={22} color="#3a3a3a" strokeWidth={1.4} />
                  <span className="ob4-dropzone-label">Drag &amp; drop or click to upload</span>
                  <span className="ob4-dropzone-sub">JPG, PNG, WEBP or SVG · Max 2MB</span>
                </div>
              )}
            </div>

            {/* Error */}
            {errMsg && <div className="ob4-error" style={{ marginBottom: 16 }}>⚠ {errMsg}</div>}

            {/* Note */}
            <div className="ob4-note">
              <strong style={{ color: "#d6a86a" }}>Note:</strong> Logo upload is optional.
              'Number of locations' drives plan recommendation later. Currency defaults from country.
            </div>

          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div className="ob4-nav">
          <div className="ob4-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob4-btn-back" onClick={() => navigate(-1)} disabled={submitting}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button
              className="ob4-btn-continue"
              onClick={handleContinue}
              disabled={submitting || !businessName.trim()}
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

// Convert staff range string to a representative int for the API
function parseStaff(val: string): number {
  const map: Record<string, number> = {
    "1–4": 2, "5–10": 7, "11–25": 18, "26–50": 38, "51–100": 75, "100+": 100,
  };
  return map[val] ?? 0;
}