import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, Zap, Smile, TrendingUp } from "lucide-react";
import { API_BASE } from "../Config/enflowApi";
import { useOnboardingSession } from "../Hooks/useOnboardingSession";
import OnboardingLoader from "../Components/OnboardingLoader";

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

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    caption: "Run a smarter kitchen",
    sub: "Real-time order flow, zero chaos.",
  },
  {
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    caption: "Delight every guest",
    sub: "Faster service, better reviews.",
  },
  {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    caption: "Know your numbers",
    sub: "Live analytics, zero guesswork.",
  },
];

const VALUE_PROPS = [
  { icon: Zap,       title: "Streamline Operations", desc: "Orders, staff, and inventory — one place." },
  { icon: Smile,     title: "Delight Your Guests",   desc: "Faster service and smarter menus." },
  { icon: TrendingUp,title: "Increase ROI",           desc: "Analytics that surface where money leaks." },
];

const GOOGLE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const APPLE_ICON = (
  <svg width="15" height="17" viewBox="0 0 814 1000" fill="#ffffff">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 426.8 0 202.8 0 123.4c0-37.3 5.8-74 29.2-104.2 31.9-40.8 81.5-67.5 135.7-67.5 49.6 0 93.7 34.6 122.8 34.6 27.8 0 79.8-37.9 140.9-37.9 23 0 105 4.5 168.9 82.3zM668.3 75.5c30.6-35.9 53-85.5 53-135.1 0-6.5-.6-13-1.9-18.2-50.3 1.9-109.2 33.7-145.8 73.2-27.8 30.2-55.1 79.2-55.1 130.5 0 7.1 1.3 14.2 1.9 16.5 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.3 133.3-68.2z"/>
  </svg>
);

export default function OnboardingStep1() {
  const navigate = useNavigate();

  // Step number = 1, since this IS step 1.
  const { user, plan, onboarding_token, loading } = useOnboardingSession(1);

  const [slide, setSlide]       = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const [errMsg, setErrMsg]     = useState("");
  const [selectedAuth, setSelectedAuth] = useState<"email" | "google" | "apple" | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const prevSlide = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
  const nextSlide = () => setSlide(s => (s + 1) % SLIDES.length);

  const goToStep2 = async () => {
    if (!selectedAuth) {
      setErrMsg("Please choose how you'd like to continue.");
      return;
    }
    if (!onboarding_token) {
      setErrMsg("Session expired. Please go back and start again.");
      return;
    }
    setAdvancing(true);
    setErrMsg("");

    try {
      const res  = await fetch(`${API_BASE}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_token }),
      });
      const data = await res.json();

      if (data.status !== "ok") {
        setErrMsg(data.message ?? "Could not continue. Please try again.");
        setAdvancing(false);
        return;
      }
    } catch {
      setErrMsg("Network error. Check your connection.");
      setAdvancing(false);
      return;
    }

    navigate("/onboarding/step-2", { state: { onboarding_token, user, plan } });
  };
  
  const saveAndExit = () => {
  window.location.href = "https://www.getenflowai.online";
};

  // While the hook checks location.state / localStorage / server, don't render
  // the page with half-missing data.
if (loading) return <OnboardingLoader />;

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ob1 * { box-sizing: border-box; }
        .ob1-progress-fill { height: 100%; width: 9%; background: linear-gradient(90deg, #d6a86a, #b8864a); border-radius: 100px; }
        .ob1-carousel { position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 14px; overflow: hidden; background: #111; margin-bottom: 20px; }
        .ob1-slide-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.5s ease; }
        .ob1-slide-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,5,2,0.85) 0%, transparent 55%); }
        .ob1-slide-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; }
        .ob1-carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(8,5,2,0.5); border: 1px solid rgba(214,168,106,0.2); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #d6a86a; backdrop-filter: blur(6px); transition: background 0.2s; z-index: 2; }
        .ob1-carousel-btn:hover { background: rgba(214,168,106,0.15); }
        .ob1-dots { position: absolute; bottom: 10px; right: 14px; display: flex; gap: 5px; z-index: 2; }
        .ob1-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.3); transition: background 0.3s, transform 0.3s; }
        .ob1-dot.active { background: #d6a86a; transform: scale(1.3); }
        .ob1-value-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border-radius: 12px; background: rgba(214,168,106,0.04); border: 1px solid rgba(214,168,106,0.1); }
        .ob1-value-icon { width: 36px; height: 36px; border-radius: 9px; background: rgba(214,168,106,0.1); border: 1px solid rgba(214,168,106,0.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #d6a86a; }
        .ob1-btn-primary { width: 100%; padding: 14px; border-radius: 100px; background: linear-gradient(135deg, #d6a86a, #b8864a); border: none; color: #0c0602; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: inherit; position: relative; overflow: hidden; transition: opacity 0.2s; }
        .ob1-btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .ob1-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .ob1-btn-auth { width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(214,168,106,0.14); color: #cccccc; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, border-color 0.2s; }
        .ob1-btn-auth:hover { background: rgba(214,168,106,0.06); border-color: rgba(214,168,106,0.28); }
        .ob1-btn-auth.ob1-auth-sel { background: rgba(214,168,106,0.12); border-color: rgba(214,168,106,0.55); color: #fff; }
        .ob1-nav { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(8,5,2,0.96); border-top: 1px solid rgba(214,168,106,0.1); backdrop-filter: blur(12px); padding: 12px 20px 24px; display: flex; align-items: center; gap: 10px; z-index: 100; }
        .ob1-btn-back { background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; color: #555; font-size: 12px; padding: 10px 18px; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 4px; transition: border-color 0.2s, color 0.2s; white-space: nowrap; }
        .ob1-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #888; }
        .ob1-btn-continue { flex: 1; padding: 13px; border-radius: 100px; background: linear-gradient(135deg, #d6a86a, #b8864a); border: none; color: #0c0602; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: inherit; position: relative; overflow: hidden; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ob1-btn-continue:hover:not(:disabled) { opacity: 0.88; }
        .ob1-btn-continue:disabled { opacity: 0.5; cursor: not-allowed; }
        .ob1-social-proof { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px; border-radius: 10px; background: rgba(214,168,106,0.04); border: 1px solid rgba(214,168,106,0.1); }
        .ob1-error { padding: 10px 14px; border-radius: 8px; font-size: 12px; line-height: 1.5; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #f87171; margin-bottom: 14px; }
        @media (min-width: 480px) { .ob1-inner { max-width: 440px; margin: 0 auto; } }
      `}</style>

      <div className="ob1" style={{ background: "#080502", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "#dddddd", paddingBottom: 90 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(214,168,106,0.08)", position: "sticky", top: 0, background: "rgba(8,5,2,0.96)", backdropFilter: "blur(12px)", zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, border: "1.5px solid rgba(214,168,106,0.35)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

        <div style={{ padding: "12px 18px 0" }}>
          <div className="ob1-inner">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Step 1 of 9 · Welcome</span>
              <span style={{ fontSize: 11, color: "#d6a86a", fontWeight: 600 }}>9%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
              <div className="ob1-progress-fill" />
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 18px 0" }}>
          <div className="ob1-inner">

            <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease both" }}>
              <div style={{ display: "inline-block", fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#d6a86a", border: "1px solid rgba(214,168,106,0.25)", borderRadius: 100, padding: "4px 12px", background: "rgba(214,168,106,0.05)", marginBottom: 12, position: "relative", overflow: "hidden" }}>
                EnflowAI · Restaurant Intelligence
                <span style={shimmerStyle} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.2, color: "#fff", margin: "0 0 7px" }}>
                Welcome to <span style={{ color: "#d6a86a", fontStyle: "italic" }}>Enflow</span>
              </h1>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.6, margin: 0 }}>
                Run your restaurant smarter. Let ZaraAI handle the boring stuff.
              </p>
            </div>

            <div className="ob1-carousel" style={{ animation: "fadeUp 0.45s ease 0.05s both" }}>
              {SLIDES.map((s, i) => (
                <img key={i} src={s.url} alt={s.caption} className="ob1-slide-img" style={{ opacity: i === slide ? 1 : 0 }} />
              ))}
              <div className="ob1-slide-overlay" />
              <div className="ob1-slide-caption">
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{SLIDES[slide].caption}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{SLIDES[slide].sub}</div>
              </div>
              <button className="ob1-carousel-btn" style={{ left: 10 }} onClick={prevSlide}><ChevronLeft size={15} /></button>
              <button className="ob1-carousel-btn" style={{ right: 10 }} onClick={nextSlide}><ChevronRight size={15} /></button>
              <div className="ob1-dots">
                {SLIDES.map((_, i) => (
                  <div key={i} className={`ob1-dot${i === slide ? " active" : ""}`} onClick={() => setSlide(i)} style={{ cursor: "pointer" }} />
                ))}
              </div>
            </div>

            {errMsg && <div className="ob1-error">⚠ {errMsg}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 12, animation: "fadeUp 0.45s ease 0.1s both" }}>
              <button
                className={`ob1-btn-auth${selectedAuth === "email" ? " ob1-auth-sel" : ""}`}
                onClick={() => { setSelectedAuth("email"); setErrMsg(""); }}
                disabled={advancing}
              >
                Create account with Email
              </button>
              <button
                className={`ob1-btn-auth${selectedAuth === "google" ? " ob1-auth-sel" : ""}`}
                onClick={() => { setSelectedAuth("google"); setErrMsg(""); }}
                disabled={advancing}
              >
                {GOOGLE_ICON} Continue with Google
              </button>
              <button
                className={`ob1-btn-auth${selectedAuth === "apple" ? " ob1-auth-sel" : ""}`}
                onClick={() => { setSelectedAuth("apple"); setErrMsg(""); }}
                disabled={advancing}
              >
                {APPLE_ICON} Continue with Apple
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: "#555", marginBottom: 24 }}>
              Already have an account?{" "}
              <a href="https://dashboard.getenflowai.online" style={{ color: "#d6a86a", textDecoration: "none" }}>Sign in</a>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="ob1-value-card">
                  <div className="ob1-value-icon"><Icon size={16} /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ob1-social-proof">
              <span style={{ fontSize: 12, color: "#888" }}>
                Trusted by <span style={{ color: "#d6a86a", fontWeight: 600 }}>200+</span> restaurants · Rated{" "}
                <span style={{ color: "#d6a86a", fontWeight: 600 }}>4.9</span> / 5
              </span>
            </div>

          </div>
        </div>

        <div className="ob1-nav">
          <div className="ob1-inner" style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
            <button className="ob1-btn-back" onClick={() => navigate(-1)} disabled={advancing}>
              <ChevronLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 10, color: "#3a3a3a", flexShrink: 0 }}>Auto-saved</span>
            <button className="ob1-btn-continue" onClick={goToStep2} disabled={advancing || !selectedAuth}>
              {advancing ? "Please wait…" : <><span>Continue</span><ChevronRight size={14} /></>}
              <span style={shimmerStyle} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
