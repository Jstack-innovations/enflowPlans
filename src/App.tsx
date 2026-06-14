import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./Config/enflowApi";
import "./App.css";

type Plan = {
  title: string;
  subtitle: string;
  price: string;
  monthly?: string;
  period: string;
  features: string[];
  cta: string;
  isContact?: boolean;
  amount?: number;
  badge?: string;
  highlight?: boolean;
  trialEnabled?: boolean;
};

type Stat    = { value: string; label: string };
type Benefit = { icon: string; title: string; desc: string };
type FAQ     = { q: string; a: string };

type PageData = {
  plans: Plan[];
  stats: Stat[];
  benefits: Benefit[];
  faqs: FAQ[];
  trialDays: number;
};

const IS_ON_TRIAL = false;

function useIntersecting(ref: React.RefObject<Element>, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function AnimatedSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersecting(ref as React.RefObject<Element>);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{ borderBottom: "1px solid rgba(214,168,106,0.18)", padding: "22px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", letterSpacing: 0.3 }}>{q}</span>
        <span style={{ fontSize: 18, color: "#d6a86a", flexShrink: 0, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease", lineHeight: 1 }}>+</span>
      </div>
      <div style={{ maxHeight: open ? 200 : 0, overflow: "hidden", transition: "max-height 0.4s ease" }}>
        <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "#dddddd", lineHeight: 1.7 }}>{a}</p>
      </div>
    </div>
  );
}

const shimmerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0,
  width: "40px", height: "100%",
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
  animation: "enflow-shimmer 2.5s infinite",
  pointerEvents: "none",
};

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/subscriptionContent`).then(r => r.json()),
      fetch(`${API_BASE}/settings`).then(r => r.json()),
    ]).then(([content, settings]) => {
      setPageData({ ...content, trialDays: settings.trial_days });
    }).catch(err => console.error("Failed to load page content", err));
  }, []);

  const handleCTA = (plan: Plan) => {
    if (plan.isContact) { window.open("mailto:support@artisan.com", "_blank"); return; }
    if (plan.trialEnabled) {
      navigate("/trial-signup", { state: { plan } });
    } else {
      navigate("/checkout", { state: { plan } });
    }
  };

  if (!pageData) return (
    <>
      <style>{`
        @keyframes enflow-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      <div style={{ background: "#080502", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#d6a86a", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Loading...</p>
      </div>
    </>
  );

  const { plans, stats, benefits, faqs, trialDays } = pageData;

  return (
    <>
      <style>{`
        @keyframes enflow-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(214,168,106,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(214,168,106,0); }
        }
        @keyframes trial-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes hero-fade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sub-plan-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        .sub-plan-card:hover { transform: translateY(-5px); }
        .sub-cta-btn { position: relative; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .sub-cta-btn::after {
          content: ''; position: absolute; top: 0; left: 0; width: 40px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: enflow-shimmer 2.5s infinite;
        }
        .sub-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(214,168,106,0.3); }
      `}</style>

      <div style={{ background: "#080502", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "#dddddd", overflowX: "hidden" }}>

        {/* ── HERO ── */}
        <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, zIndex: 0 }}>
            <source src="https://enflow-ai.vercel.app/Video/Hero.mp4" type="video/mp4" />
          </video>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(214,168,106,0.3), transparent)", zIndex: 2 }} />

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 760, animation: "hero-fade 0.9s ease both" }}>
            <div style={{ display: "inline-block", marginBottom: 28, fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", border: "1px solid rgba(214,168,106,0.25)", borderRadius: 100, padding: "6px 20px", background: "rgba(214,168,106,0.05)", position: "relative", overflow: "hidden" }}>
              Enflow · Africa's First Restaurant Intelligence
              <span style={shimmerStyle} />
            </div>
            <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 24, color: "#ffffff" }}>
              Run Smarter.<br /><em style={{ fontStyle: "italic", color: "#d6a86a" }}>Earn More.</em>
            </h1>
            <p style={{ fontSize: 15, color: "#dddddd", lineHeight: 1.75, maxWidth: 500, margin: "0 auto 40px", fontWeight: 300 }}>
              One platform. Every order, every table, every naira — powered by Zara AI. Try free for {trialDays} days, no card needed.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="sub-cta-btn" onClick={() => navigate("/trial-signup")} style={{ padding: "14px 36px", borderRadius: 100, background: "linear-gradient(135deg, #d6a86a, #b8864a)", border: "none", color: "#0c0602", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                Start {trialDays}-Day Free Trial
              </button>
              <button onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "14px 36px", borderRadius: 100, background: "transparent", border: "1px solid rgba(214,168,106,0.3)", color: "#d6a86a", fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" }}>
                See Plans ↓
              </button>
            </div>
            <p style={{ marginTop: 20, fontSize: 11, color: "#666", letterSpacing: 1 }}>No credit card required · Cancel anytime · Full access during trial</p>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <AnimatedSection>
          <div style={{ borderTop: "1px solid rgba(214,168,106,0.1)", borderBottom: "1px solid rgba(214,168,106,0.1)", padding: "36px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 32, maxWidth: 900, margin: "0 auto" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 300, color: "#d6a86a", letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#aaaaaa", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── PLANS ── */}
        <section id="plans" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", marginBottom: 16 }}>Pricing</p>
              <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 300, lineHeight: 1.1, color: "#ffffff" }}>
                Choose Your <em style={{ fontStyle: "italic", color: "#d6a86a" }}>Plan</em>
              </h2>
              <p style={{ marginTop: 16, fontSize: 13, color: "#aaaaaa" }}>
                All plans include a {trialDays}-day free trial — full access, no credit card.
              </p>
            </div>
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, alignItems: "start" }}>
            {plans.map((plan, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div
                  className="sub-plan-card"
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: "relative",
                    background: plan.highlight ? "linear-gradient(160deg, #1a0f07 0%, #0f0804 100%)" : "rgba(255,238,215,0.025)",
                    border: plan.highlight ? "1px solid rgba(214,168,106,0.5)" : hoveredCard === i ? "1px solid rgba(214,168,106,0.25)" : "1px solid rgba(214,168,106,0.1)",
                    borderRadius: 20,
                    padding: "24px 20px",
                    boxShadow: plan.highlight ? "0 0 60px rgba(214,168,106,0.08), inset 0 1px 0 rgba(214,168,106,0.15)" : hoveredCard === i ? "0 20px 60px rgba(0,0,0,0.4)" : "none",
                  }}
                >
                  {plan.badge && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #d6a86a, #b8864a)", color: "#0c0602", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: "5px 16px", borderRadius: 100, animation: "badge-pulse 2.5s infinite", whiteSpace: "nowrap" }}>{plan.badge}</div>
                  )}
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#aaaaaa", marginBottom: 6 }}>{plan.subtitle}</p>
                    <h3 style={{ fontSize: 22, fontWeight: 600, color: "#ffffff", letterSpacing: 0.3 }}>{plan.title}</h3>
                  </div>
                  <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid rgba(214,168,106,0.1)" }}>
                    <span style={{ fontSize: plan.isContact ? 28 : "clamp(30px, 4vw, 40px)", fontWeight: 300, color: plan.highlight ? "#d6a86a" : "#ffffff" }}>{plan.price}</span>
                    {!plan.isContact && <span style={{ fontSize: 12, color: "#aaaaaa", marginLeft: 4 }}>{plan.period}</span>}
                    {plan.monthly && <p style={{ fontSize: 11, color: "#bbbbbb", marginTop: 4, fontStyle: "italic" }}>{plan.monthly}</p>}
                    {!plan.isContact && (
                      <p style={{ marginTop: 10, fontSize: 11, color: "#d6a86a", letterSpacing: 1, animation: "trial-pulse 3s ease-in-out infinite" }}>
                        ◆ {trialDays}-day free trial included
                      </p>
                    )}
                  </div>
                  <ul style={{ listStyle: "none", marginBottom: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                    {plan.features.map((feat, fi) => (
                      <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, lineHeight: 1.5, color: "#dddddd" }}>
                        <span style={{ color: "#d6a86a", flexShrink: 0, marginTop: 1, fontSize: 10 }}>◆</span>{feat}
                      </li>
                    ))}
                  </ul>
                  <button className="sub-cta-btn" onClick={() => handleCTA(plan)} style={{ width: "100%", padding: "13px 0", borderRadius: 100, background: plan.highlight ? "linear-gradient(135deg, #d6a86a, #b8864a)" : plan.isContact ? "transparent" : "rgba(214,168,106,0.08)", border: plan.highlight ? "none" : "1px solid rgba(214,168,106,0.3)", color: plan.highlight ? "#0c0602" : "#d6a86a", fontSize: 12, fontWeight: plan.highlight ? 700 : 600, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                    {plan.isContact ? plan.cta : `Try Free · ${plan.cta}`}
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(214,168,106,0.08)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <AnimatedSection>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", marginBottom: 16 }}>Why Upgrade</p>
                <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300, color: "#ffffff" }}>
                  Built for <em style={{ fontStyle: "italic", color: "#d6a86a" }}>Operators</em>
                </h2>
              </div>
            </AnimatedSection>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {benefits.map((b, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div style={{ padding: "36px 32px", border: "1px solid rgba(214,168,106,0.1)", borderRadius: 16, background: "rgba(255,238,215,0.02)" }}>
                    <div style={{ fontSize: 28, color: "#d6a86a", marginBottom: 20 }}>{b.icon}</div>
                    <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#ffffff" }}>{b.title}</h4>
                    <p style={{ fontSize: 13.5, color: "#dddddd", lineHeight: 1.75 }}>{b.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRIAL CTA BAND ── */}
        {IS_ON_TRIAL && (
          <AnimatedSection>
            <section style={{ margin: "0 auto 80px", borderRadius: 24, background: "linear-gradient(135deg, #1a0f07, #0f0804)", border: "1px solid rgba(214,168,106,0.2)", padding: "60px 40px", textAlign: "center", maxWidth: 1100 }}>
              <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", marginBottom: 16 }}>Your Trial Is Active</p>
              <h3 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 300, marginBottom: 16, color: "#ffffff" }}>Your {trialDays}-Day Trial Ends Soon</h3>
              <p style={{ fontSize: 14, color: "#dddddd", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>Don't lose access to Zara AI, live analytics, and everything that keeps your floor running.</p>
              <button className="sub-cta-btn" onClick={() => navigate("/payment")} style={{ padding: "15px 48px", borderRadius: 100, background: "linear-gradient(135deg, #d6a86a, #b8864a)", border: "none", color: "#0c0602", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                Upgrade Now
              </button>
            </section>
          </AnimatedSection>
        )}

        {/* ── FAQ ── */}
        <section style={{ padding: "80px 24px", maxWidth: 680, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#d6a86a", marginBottom: 16 }}>FAQ</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 300, color: "#ffffff" }}>
                Questions <em style={{ fontStyle: "italic", color: "#d6a86a" }}>Answered</em>
              </h2>
            </div>
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </AnimatedSection>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(214,168,106,0.08)", padding: "32px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>
            © 2026 jsTAck innovaTions · ENFLOW · ALL RIGHTS RESERVED
          </p>
        </footer>

      </div>
    </>
  );
}

