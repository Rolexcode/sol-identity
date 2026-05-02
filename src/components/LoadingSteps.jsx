// LoadingSteps.jsx
// Shows staged loading progress so users know what is happening
// Makes long RPC calls feel intentional not broken

import { useState, useEffect } from "react";

const STEPS = [
  "Resolving identity...",
  "Fetching wallet data...",
  "Looking up .sol domain...",
  "Calculating trust score...",
];

/**
 * LoadingSteps component
 * Cycles through loading messages every 3 seconds
 * @param {object} theme - Current theme object
 */
function LoadingSteps({ theme: t }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      {/* Spinner */}
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        border: "2px solid rgba(124,58,237,0.2)",
        borderTop: "2px solid #7c3aed",
        margin: "0 auto 16px",
        animation: "spin 0.8s linear infinite"
      }} />

      {/* Step message */}
      <p style={{
        color: t.textMuted, fontSize: "13px", margin: "0 0 12px 0",
        transition: "all 0.3s ease"
      }}>
        {STEPS[step]}
      </p>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i === step ? "#7c3aed" : t.surfaceBorder,
            transition: "background 0.3s ease"
          }} />
        ))}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default LoadingSteps;
