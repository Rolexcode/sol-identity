// AgentActions.jsx
// Displays action history for an agent
// Also allows logging new actions

import { useState, useEffect } from "react";
import { logAgentAction, loadAgentActions } from "../utils/upstash";

const ACTION_TYPES = [
  "Swap",
  "Transfer",
  "Vote",
  "Stake",
  "Unstake",
  "Mint",
  "Burn",
  "Custom",
];

/**
 * AgentActions component
 * @param {string} agentId - Agent ID
 * @param {boolean} isOwner - Whether connected wallet is the agent owner
 * @param {object} theme - Current theme
 */
function AgentActions({ agentId, isOwner, theme: t }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "Swap",
    details: "",
  });

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const data = await loadAgentActions(agentId);
      setActions(data);
      setLoading(false);
    }
    fetch();
  }, [agentId]);

  const handleLog = async () => {
    if (!form.details) return;
    setSaving(true);

    const success = await logAgentAction(agentId, {
      type: form.type,
      details: form.details,
    });

    if (success) {
      const updated = await loadAgentActions(agentId);
      setActions(updated);
      setForm({ type: "Swap", details: "" });
      setShowForm(false);
    }

    setSaving(false);
  };

  const timeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  };

  const typeColors = {
    Swap: "#a78bfa",
    Transfer: "#60a5fa",
    Vote: "#34d399",
    Stake: "#fbbf24",
    Unstake: "#fb923c",
    Mint: "#f472b6",
    Burn: "#f87171",
    Custom: "#94a3b8",
  };

  return (
    <div
      style={{
        borderTop: `1px solid ${t.surfaceBorder}`,
        paddingTop: "16px",
        marginTop: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            color: t.textFaint,
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            margin: 0,
            fontWeight: "600",
          }}
        >
          Action Log
        </p>
        {isOwner && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: "8px",
              padding: "4px 10px",
              color: "#a78bfa",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Log Action
          </button>
        )}
      </div>

      {/* Log action form */}
      {showForm && isOwner && (
        <div
          style={{
            background: t.inputBg,
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "12px",
            border: `1px solid ${t.inputBorder}`,
          }}
        >
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              style={{
                background: t.surface,
                border: `1px solid ${t.inputBorder}`,
                borderRadius: "8px",
                padding: "6px 10px",
                color: t.text,
                fontSize: "12px",
                outline: "none",
              }}
            >
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              placeholder="Action details..."
              value={form.details}
              onChange={(e) =>
                setForm((p) => ({ ...p, details: e.target.value }))
              }
              style={{
                flex: 1,
                background: t.surface,
                border: `1px solid ${t.inputBorder}`,
                borderRadius: "8px",
                padding: "6px 10px",
                color: t.text,
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleLog}
              disabled={saving || !form.details}
              style={{
                background: "#7c3aed",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                color: "white",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                opacity: saving || !form.details ? 0.6 : 1,
              }}
            >
              {saving ? "Logging..." : "Log"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "transparent",
                border: `1px solid ${t.inputBorder}`,
                borderRadius: "8px",
                padding: "6px 14px",
                color: t.textMuted,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action list */}
      {loading && (
        <p style={{ color: t.textFaint, fontSize: "12px", margin: 0 }}>
          Loading actions...
        </p>
      )}

      {!loading && actions.length === 0 && (
        <p style={{ color: t.textFaint, fontSize: "12px", margin: 0 }}>
          No actions logged yet.
        </p>
      )}

      {!loading && actions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {actions.map((action, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 0",
                borderBottom:
                  i < actions.length - 1
                    ? `1px solid ${t.surfaceBorder}`
                    : "none",
              }}
            >
              <span
                style={{
                  background: `${typeColors[action.type] || "#94a3b8"}20`,
                  border: `1px solid ${typeColors[action.type] || "#94a3b8"}40`,
                  borderRadius: "6px",
                  padding: "2px 8px",
                  color: typeColors[action.type] || "#94a3b8",
                  fontSize: "10px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {action.type}
              </span>
              <p
                style={{
                  color: t.textMuted,
                  fontSize: "12px",
                  margin: 0,
                  flex: 1,
                }}
              >
                {action.details}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "2px",
                }}
              >
                <p
                  style={{
                    color: t.textFaint,
                    fontSize: "11px",
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {timeAgo(action.timestamp)}
                </p>
                {action.auto && (
                  <span
                    style={{
                      color: "#34d399",
                      fontSize: "9px",
                      fontWeight: "600",
                    }}
                  >
                    AUTO
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentActions;
