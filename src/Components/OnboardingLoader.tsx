export default function OnboardingLoader({ message = "Checking your session" }: { message?: string }) {
  return (
    <>
      <style>{`
        @keyframes ob-spin { to { transform: rotate(360deg); } }
        @keyframes ob-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes enflow-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        .ob-loader-wrap {
          background: #080502; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 18px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .ob-loader-logo {
          display: flex; align-items: center; gap: 9px;
          margin-bottom: 8px;
        }
        .ob-loader-ring {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 3px solid rgba(214,168,106,0.15);
          border-top-color: #d6a86a;
          animation: ob-spin 0.85s linear infinite;
        }
        .ob-loader-text {
          font-size: 11px; color: #555;
          letter-spacing: 2px; text-transform: uppercase;
          animation: ob-pulse 1.6s ease-in-out infinite;
        }
        .ob-loader-badge {
          font-size: 9px; font-weight: 600; letter-spacing: 3px;
          text-transform: uppercase; color: #d6a86a;
          border: 1px solid rgba(214,168,106,0.25); border-radius: 100px;
          padding: 4px 12px; background: rgba(214,168,106,0.05);
          position: relative; overflow: hidden;
        }
        .ob-shimmer {
          position: absolute; top: 0; left: 0;
          width: 40px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: enflow-shimmer 2.5s infinite;
          pointer-events: none;
        }
      `}</style>
      <div className="ob-loader-wrap">
        <div className="ob-loader-logo">
          <div style={{ width: 30, height: 30, border: "1.5px solid rgba(214,168,106,0.35)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "#d6a86a", fontWeight: 700 }}>E</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>ENFLOW</div>
            <div style={{ fontSize: 8, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>powered by ZaraAI</div>
          </div>
        </div>
        <div className="ob-loader-ring" />
        <span className="ob-loader-text">{message}</span>
        <div className="ob-loader-badge">
          EnflowAI · Restaurant Intelligence
          <span className="ob-shimmer" />
        </div>
      </div>
    </>
  );
}