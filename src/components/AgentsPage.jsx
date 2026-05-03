// AgentsPage.jsx
// Agent Identity Registry with persistent storage via Upstash Redis

import { useState, useEffect } from "react";
import AgentCard from "./AgentCard";
import { SAMPLE_AGENTS } from "../data/agents";
import { saveAgent, loadAgents } from "../utils/upstash";

function AgentsPage({ theme: t }) {
  const [agents, setAgents] = useState(SAMPLE_AGENTS);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "Trading Agent",
    creatorWallet: "",
    agentWallet: "",
    description: "",
  });

  const TYPES = ["All", "Trading Agent", "Governance Agent", "NFT Agent", "DeFi Agent", "Custom"];

  useEffect(() => {
    async function fetchAgents() {
      setLoadingAgents(true);
      const saved = await loadAgents();
      if (saved.length > 0) {
        setAgents([...saved, ...SAMPLE_AGENTS]);
      }
      setLoadingAgents(false);
    }
    fetchAgents();
  }, []);

  const filtered = filter === "All"
    ? agents
    : agents.filter(a => a.type === filter);

  const handleRegister = async () => {
    if (!form.name || !form.creatorWallet) return;
    setSaving(true);

    const newAgent = {
      id: `agent-${Date.now()}`,
      name: form.name.toLowerCase().replace(/\s/g, "-"),
      domain: `${form.name.toLowerCase().replace(/\s/g, "-")}.sol`,
      type: form.type,
      creatorWallet: form.creatorWallet.slice(0, 8) + "...",
      agentWallet: form.agentWallet
        ? form.agentWallet.slice(0, 8) + "..." + form.agentWallet.slice(-4)
        : "Not provided",
      trustScore: 25,
      trustLevel: "Low Trust",
      actionsExecuted: 0,
      actionsFailed: 0,
      activeDays: 0,
      lastActive: "Just registered",
      description: form.description || "New agent — no actions recorded yet.",
      verified: false,
    };

    const saved = await saveAgent(newAgent);

    if (saved) {
      setAgents(prev => [newAgent, ...prev]);
      setShowForm(false);
      setForm({
        name: "",
        type: "Trading Agent",
        creatorWallet: "",
        agentWallet: "",
        description: "",
      });
    }

    setSaving(false);
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 style={{ color: t.text, fontSize: "20px", fontWeight: "700", margin: 0 }}>
            Agent Registry
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "#7c3aed", border: "none", borderRadius: "10px",
              padding: "8px 16px", color: "white", fontWeight: "600",
              fontSize: "12px", cursor: "pointer"
            }}
          >
            + Register Agent
          </button>
        </div>
        <p style={{ color: t.textMuted, fontSize: "13px", margin: 0 }}>
          On-chain identity layer for autonomous AI agents on Solana
        </p>
      </div>

      {showForm && (
        <div style={{
          background: t.surface, border: `1px solid ${t.surfaceBorder}`,
          borderRadius: "16px", padding: "20px", marginBottom: "20px"
        }}>
          <h3 style={{ color: t.text, fontSize: "14px", fontWeight: "700", margin: "0 0 16px 0" }}>
            Register New Agent
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              placeholder="Agent name (e.g. my-trader-bot)"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: "10px", padding: "10px 14px",
                color: t.text, fontSize: "13px", outline: "none"
              }}
            />
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              style={{
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: "10px", padding: "10px 14px",
                color: t.text, fontSize: "13px", outline: "none"
              }}
            >
              {TYPES.filter(type => type !== "All").map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              placeholder="Your wallet address (agent owner)"
              value={form.creatorWallet}
              onChange={e => setForm(p => ({ ...p, creatorWallet: e.target.value }))}
              style={{
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: "10px", padding: "10px 14px",
                color: t.text, fontSize: "13px", outline: "none"
              }}
            />
            <input
              placeholder="Agent wallet address (the bot wallet)"
              value={form.agentWallet}
              onChange={e => setForm(p => ({ ...p, agentWallet: e.target.value }))}
              style={{
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: "10px", padding: "10px 14px",
                color: t.text, fontSize: "13px", outline: "none"
              }}
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              style={{
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: "10px", padding: "10px 14px",
                color: t.text, fontSize: "13px", outline: "none"
              }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleRegister}
                disabled={saving}
                style={{
                  background: "#7c3aed", border: "none", borderRadius: "10px",
                  padding: "10px 20px", color: "white", fontWeight: "600",
                  fontSize: "13px", cursor: "pointer", opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? "Registering..." : "Register"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                  borderRadius: "10px", padding: "10px 20px",
                  color: t.textMuted, fontWeight: "600",
                  fontSize: "13px", cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {TYPES.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              background: filter === type ? "#7c3aed" : t.inputBg,
              border: `1px solid ${filter === type ? "#7c3aed" : t.inputBorder}`,
              borderRadius: "999px", padding: "6px 14px",
              color: filter === type ? "white" : t.textMuted,
              fontSize: "11px", fontWeight: "600", cursor: "pointer"
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {loadingAgents && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ color: t.textMuted, fontSize: "13px", margin: 0 }}>
            Loading agents...
          </p>
        </div>
      )}

      {!loadingAgents && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(agent => (
            <AgentCard key={agent.id} agent={agent} theme={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentsPage;
