// AgentsPage.jsx
// Agent Identity Registry with persistent storage via Upstash Redis
// SNS on-chain verification for domain ownership

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import AgentCard from "./AgentCard";
import { SAMPLE_AGENTS } from "../data/agents";
import { saveAgent, loadAgents } from "../utils/upstash";
import { getWalletFromDomain } from "../utils/sns";

function AgentsPage({ theme: t }) {
  const { connected, publicKey } = useWallet();
  const [agents, setAgents] = useState(SAMPLE_AGENTS);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [verifyError, setVerifyError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "Trading Agent",
    solDomain: "",
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
    if (!form.name || !connected || !publicKey) return;
    setSaving(true);
    setVerifyError(null);

    try {
      const domainName = form.name.toLowerCase().replace(/\s/g, "-");

      // Only verify if they provided a .sol domain
      const solDomain = form.solDomain
        ? form.solDomain.toLowerCase().replace(".sol", "").trim() + ".sol"
        : null;

      let isVerified = false;

      if (solDomain) {
        // Query SNS on-chain program to verify ownership
        const ownerWallet = await getWalletFromDomain(solDomain);

        if (ownerWallet && ownerWallet === publicKey.toString()) {
          // Connected wallet owns this domain
          isVerified = true;
        } else if (ownerWallet && ownerWallet !== publicKey.toString()) {
          // Domain exists but owned by someone else
          setVerifyError(
            `"${solDomain}" is owned by a different wallet. You can only register domains you own.`
          );
          setSaving(false);
          return;
        }
        // If ownerWallet is null — domain doesnt exist, allow unverified
      }

      const newAgent = {
        id: `agent-${Date.now()}`,
        name: domainName,
        domain: solDomain || domainName,
        type: form.type,
        creatorWallet: publicKey.toString().slice(0, 8) + "..." + publicKey.toString().slice(-4),
        agentWallet: form.agentWallet
          ? form.agentWallet.slice(0, 8) + "..." + form.agentWallet.slice(-4)
          : "Not provided",
        trustScore: isVerified ? 40 : 25,
        trustLevel: isVerified ? "Low Trust" : "Very Low Trust",
        actionsExecuted: 0,
        actionsFailed: 0,
        activeDays: 0,
        lastActive: "Just registered",
        description: form.description || "New agent — no actions recorded yet.",
        verified: isVerified,
        onChainVerified: isVerified,
      };

      const saved = await saveAgent(newAgent);
      if (saved) {
        setAgents(prev => [newAgent, ...prev]);
        setShowForm(false);
        setForm({
          name: "",
          type: "Trading Agent",
          solDomain: "",
          agentWallet: "",
          description: "",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setVerifyError("Registration failed. Please try again.");
    }

    setSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "8px"
        }}>
          <h2 style={{ color: t.text, fontSize: "20px", fontWeight: "700", margin: 0 }}>
            Agent Registry
          </h2>
          {connected && (
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
          )}
        </div>
        <p style={{ color: t.textMuted, fontSize: "13px", margin: 0 }}>
          On-chain identity layer for autonomous AI agents on Solana.
          Domain ownership is verified against the SNS program on Solana mainnet.
        </p>
      </div>

      {/* Wallet connection required */}
      {!connected && (
        <div style={{
          background: t.surface, border: `1px solid ${t.surfaceBorder}`,
          borderRadius: "16px", padding: "24px", marginBottom: "20px",
          textAlign: "center"
        }}>
          <p style={{ color: t.textMuted, fontSize: "13px", margin: "0 0 16px 0" }}>
            Connect your wallet to register an agent.
            If you own a .sol domain, your agent will be verified on-chain via SNS.
          </p>
          <WalletMultiButton />
        </div>
      )}

      {/* Connected wallet indicator */}
      {connected && publicKey && (
        <div style={{
          background: "rgba(52,211,153,0.05)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <div style={{
            width: "8px", height: "8px",
            borderRadius: "50%", background: "#34d399"
          }} />
          <p style={{
            color: "#34d399", fontSize: "12px",
            margin: 0, fontFamily: "monospace"
          }}>
            {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-4)} connected
          </p>
        </div>
      )}

      {/* Registration form */}
      {showForm && connected && (
        <div style={{
          background: t.surface, border: `1px solid ${t.surfaceBorder}`,
          borderRadius: "16px", padding: "20px", marginBottom: "20px"
        }}>
          <h3 style={{ color: t.text, fontSize: "14px", fontWeight: "700", margin: "0 0 4px 0" }}>
            Register New Agent
          </h3>
          <p style={{ color: t.textMuted, fontSize: "12px", margin: "0 0 16px 0" }}>
            Give your agent a name and optionally link a .sol domain you own.
            Agents with verified .sol domains get the ON-CHAIN VERIFIED badge.
          </p>

          {verifyError && (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px", padding: "10px 14px", marginBottom: "12px"
            }}>
              <p style={{ color: "#f87171", fontSize: "12px", margin: 0 }}>
                {verifyError}
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Agent name */}
            <div>
              <input
                placeholder="Agent name (e.g. my-trader-bot)"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{
                  width: "100%", background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: "10px", padding: "10px 14px",
                  color: t.text, fontSize: "13px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
              {form.name && (
                <p style={{ color: t.textMuted, fontSize: "11px", margin: "4px 0 0 4px" }}>
                  Agent ID: <strong style={{ color: "#a78bfa" }}>
                    {form.name.toLowerCase().replace(/\s/g, "-")}
                  </strong>
                </p>
              )}
            </div>

            {/* Agent type */}
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

            {/* .sol domain — optional */}
            <div>
              <input
                placeholder=".sol domain you own (optional — enables on-chain verification)"
                value={form.solDomain}
                onChange={e => setForm(p => ({ ...p, solDomain: e.target.value }))}
                style={{
                  width: "100%", background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: "10px", padding: "10px 14px",
                  color: t.text, fontSize: "13px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <p style={{ color: t.textFaint, fontSize: "11px", margin: "4px 0 0 4px" }}>
                If you own a .sol domain, we verify ownership on-chain via SNS
              </p>
            </div>

            {/* Agent wallet */}
            <input
              placeholder="Agent wallet address (the bot wallet that executes transactions)"
              value={form.agentWallet}
              onChange={e => setForm(p => ({ ...p, agentWallet: e.target.value }))}
              style={{
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: "10px", padding: "10px 14px",
                color: t.text, fontSize: "13px", outline: "none"
              }}
            />

            {/* Description */}
            <input
              placeholder="What does this agent do? (optional)"
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
                disabled={saving || !form.name}
                style={{
                  background: "#7c3aed", border: "none", borderRadius: "10px",
                  padding: "10px 20px", color: "white", fontWeight: "600",
                  fontSize: "13px", cursor: "pointer",
                  opacity: (saving || !form.name) ? 0.6 : 1
                }}
              >
                {saving ? "Verifying on-chain..." : "Register Agent"}
              </button>
              <button
                onClick={() => { setShowForm(false); setVerifyError(null); }}
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

      {/* Filter tabs */}
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

      {/* Loading */}
      {loadingAgents && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ color: t.textMuted, fontSize: "13px", margin: 0 }}>
            Loading agents...
          </p>
        </div>
      )}

      {/* Agent cards */}
      {!loadingAgents && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              theme={t}
              connectedWallet={publicKey?.toString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentsPage;
