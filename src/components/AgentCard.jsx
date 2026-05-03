function AgentCard({ agent, theme: t }) {
  const colors = {
    "High Trust": "#34d399",
    "Medium Trust": "#fbbf24",
    "Low Trust": "#fb923c",
    "Very Low Trust": "#f87171"
  };
  const color = colors[agent.trustLevel] || "#f87171";

  const successRate = agent.actionsExecuted > 0
    ? Math.round(((agent.actionsExecuted - agent.actionsFailed) / agent.actionsExecuted) * 100)
    : 0;

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.surfaceBorder}`,
      borderRadius: "16px",
      padding: "20px",
      transition: "all 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", flexShrink: 0
          }}>
            🤖
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ color: t.text, fontSize: "15px", fontWeight: "700", margin: 0 }}>
                {agent.domain}
              </h3>
              {agent.verified && (
                <span style={{
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.3)",
                  borderRadius: "999px", padding: "2px 8px",
                  color: "#34d399", fontSize: "10px", fontWeight: "600"
                }}>
                  VERIFIED
                </span>
              )}
            </div>
            <p style={{ color: t.textMuted, fontSize: "12px", margin: "2px 0 0 0" }}>
              {agent.type}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ color: color, fontSize: "22px", fontWeight: "800", margin: 0, lineHeight: 1 }}>
            {agent.trustScore}
          </p>
          <p style={{ color: color, fontSize: "10px", fontWeight: "600", margin: "2px 0 0 0" }}>
            {agent.trustLevel}
          </p>
        </div>
      </div>

      <p style={{ color: t.textMuted, fontSize: "12px", margin: "0 0 16px 0", lineHeight: 1.5 }}>
        {agent.description}
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: "8px", marginBottom: "16px"
      }}>
        {[
          { label: "Actions", value: agent.actionsExecuted.toLocaleString() },
          { label: "Failed", value: agent.actionsFailed },
          { label: "Success", value: `${successRate}%` },
          { label: "Days Active", value: agent.activeDays },
        ].map(stat => (
          <div key={stat.label} style={{
            background: t.inputBg, borderRadius: "8px",
            padding: "8px", textAlign: "center"
          }}>
            <p style={{ color: t.text, fontSize: "14px", fontWeight: "700", margin: "0 0 2px 0" }}>
              {stat.value}
            </p>
            <p style={{ color: t.textFaint, fontSize: "10px", margin: 0 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        borderTop: `1px solid ${t.surfaceBorder}`,
        paddingTop: "12px",
        display: "flex", flexDirection: "column", gap: "4px"
      }}>
        <p style={{ color: t.textFaint, fontSize: "11px", margin: 0, fontFamily: "monospace" }}>
          Owner: {agent.creatorWallet}
        </p>
        <p style={{ color: t.textFaint, fontSize: "11px", margin: 0, fontFamily: "monospace" }}>
          Agent: {agent.agentWallet || "Not provided"}
        </p>
        <p style={{ color: t.textFaint, fontSize: "11px", margin: 0, textAlign: "right" }}>
          Active {agent.lastActive}
        </p>
      </div>
    </div>
  );
}

export default AgentCard;
