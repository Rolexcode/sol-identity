import { useState, useCallback } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import LoginButton from "./components/LoginButton";
import ProfileCard from "./components/ProfileCard";
import TrustScore from "./components/TrustScore";
import { getWalletData } from "./utils/solana";
import { getDomainFromWallet, getDomainRecords, getWalletFromDomain } from "./utils/sns";
import { calculateTrustScore } from "./utils/trustScore";

const endpoint = clusterApiUrl("mainnet-beta");
const wallets = [new PhantomWalletAdapter()];

const THEMES = {
  dark: {
    bg: "#0a0a0f",
    surface: "rgba(255,255,255,0.02)",
    surfaceBorder: "rgba(255,255,255,0.06)",
    inputBg: "rgba(255,255,255,0.03)",
    inputBorder: "rgba(255,255,255,0.08)",
    text: "#ffffff",
    textMuted: "#52525b",
    textFaint: "#27272a",
    divider: "rgba(255,255,255,0.06)",
    badge: "rgba(124,58,237,0.1)",
    badgeBorder: "rgba(124,58,237,0.3)",
    badgeText: "#a78bfa",
    glow: "rgba(124,58,237,0.15)",
    sdkBg: "rgba(124,58,237,0.06)",
    sdkBorder: "rgba(124,58,237,0.15)",
    toggleBg: "rgba(255,255,255,0.06)",
    toggleIcon: "☀️",
  },
  light: {
    bg: "#f0ece8",
    surface: "rgba(0,0,0,0.03)",
    surfaceBorder: "rgba(0,0,0,0.08)",
    inputBg: "rgba(0,0,0,0.04)",
    inputBorder: "rgba(0,0,0,0.1)",
    text: "#1a1523",
    textMuted: "#6b6570",
    textFaint: "#9d99a3",
    divider: "rgba(0,0,0,0.07)",
    badge: "rgba(124,58,237,0.08)",
    badgeBorder: "rgba(124,58,237,0.2)",
    badgeText: "#6d28d9",
    glow: "rgba(124,58,237,0.08)",
    sdkBg: "rgba(124,58,237,0.05)",
    sdkBorder: "rgba(124,58,237,0.12)",
    toggleBg: "rgba(0,0,0,0.06)",
    toggleIcon: "🌙",
  }
};

function AppContent() {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identityData, setIdentityData] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const t = isDark ? THEMES.dark : THEMES.light;

  const loadIdentity = useCallback(async (walletAddress) => {
    setLoading(true);
    setError(null);
    setIdentityData(null);
    try {
      const walletData = await getWalletData(walletAddress);
      const domain = await getDomainFromWallet(walletAddress);
      const records = domain ? await getDomainRecords(domain) : {};
      const scoreData = calculateTrustScore(walletData, !!domain);
      setIdentityData({ walletAddress, domain, records, scoreData, walletData });
    } catch (err) {
      setError("Failed to load identity. Please check the address and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWalletConnected = useCallback(async (walletAddress) => {
    if (walletConnected) return;
    setWalletConnected(true);
    await loadIdentity(walletAddress);
  }, [walletConnected, loadIdentity]);

  const handleSearch = async () => {
    const input = searchInput.trim();
    if (!input) return;
    setLoading(true);
    setError(null);
    setIdentityData(null);
    try {
      let walletAddress = input;
      if (input.toLowerCase().endsWith(".sol")) {
        const resolved = await getWalletFromDomain(input);
        if (!resolved) {
          setError(`Domain "${input}" not found on-chain.`);
          setLoading(false);
          return;
        }
        walletAddress = resolved;
      }
      await loadIdentity(walletAddress);
    } catch (err) {
      setError("Search failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:t.bg,
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      padding:"24px",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      transition:"background 0.3s ease"
    }}>

      {/* Ambient glow */}
      <div style={{
        position:"fixed",top:"-20%",left:"50%",transform:"translateX(-50%)",
        width:"600px",height:"400px",
        background:`radial-gradient(ellipse,${t.glow} 0%,transparent 70%)`,
        pointerEvents:"none",zIndex:0,transition:"background 0.3s ease"
      }} />

      {/* Theme toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        style={{
          position:"fixed",top:"20px",right:"20px",
          background:t.toggleBg,border:`1px solid ${t.surfaceBorder}`,
          borderRadius:"10px",padding:"8px 12px",
          cursor:"pointer",fontSize:"16px",zIndex:10,
          transition:"all 0.3s ease"
        }}
      >
        {t.toggleIcon}
      </button>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:"480px"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:"8px",
            background:t.badge,border:`1px solid ${t.badgeBorder}`,
            borderRadius:"999px",padding:"6px 14px",marginBottom:"20px",
            transition:"all 0.3s ease"
          }}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#7c3aed"}} />
            <span style={{color:t.badgeText,fontSize:"11px",fontWeight:"600",letterSpacing:"1px",textTransform:"uppercase"}}>
              Solana Mainnet
            </span>
          </div>
          <h1 style={{
            fontSize:"38px",fontWeight:"800",color:t.text,
            margin:"0 0 10px 0",letterSpacing:"-1.5px",lineHeight:1.1,
            transition:"color 0.3s ease"
          }}>
            Sol<span style={{color:"#7c3aed"}}>Identity</span>
          </h1>
          <p style={{color:t.textMuted,fontSize:"14px",margin:0,lineHeight:1.6,transition:"color 0.3s ease"}}>
            On-chain identity and trust scoring<br/>for any Solana wallet or .sol domain
          </p>
        </div>

        {/* Search */}
        <div style={{marginBottom:"20px"}}>
          <div style={{
            display:"flex",gap:"8px",
            background:t.inputBg,
            border:`1px solid ${t.inputBorder}`,
            borderRadius:"14px",padding:"6px 6px 6px 16px",
            transition:"all 0.3s ease"
          }}>
            <input
              type="text"
              placeholder="Enter .sol domain or wallet address..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                flex:1,background:"transparent",border:"none",
                color:t.text,fontSize:"14px",outline:"none",padding:"6px 0",
                transition:"color 0.3s ease"
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                background:"#7c3aed",border:"none",borderRadius:"10px",
                padding:"10px 20px",color:"white",fontWeight:"600",
                fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap",
                opacity:loading?0.6:1
              }}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
          <p style={{color:t.textFaint,fontSize:"11px",textAlign:"center",margin:"8px 0 0 0"}}>
            Try: bonfida.sol · wallet.sol · or paste any address
          </p>
        </div>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{flex:1,height:"1px",background:t.divider}} />
          <span style={{color:t.textFaint,fontSize:"11px",letterSpacing:"0.5px"}}>OR CONNECT WALLET</span>
          <div style={{flex:1,height:"1px",background:t.divider}} />
        </div>

        {/* Wallet connect */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:"32px"}}>
          <LoginButton onConnected={handleWalletConnected} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{
              width:"32px",height:"32px",borderRadius:"50%",
              border:"2px solid rgba(124,58,237,0.2)",
              borderTop:"2px solid #7c3aed",
              margin:"0 auto 16px",
              animation:"spin 0.8s linear infinite"
            }} />
            <p style={{color:t.textMuted,fontSize:"13px",margin:0}}>
              Fetching on-chain identity...
            </p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background:"rgba(239,68,68,0.08)",
            border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:"12px",padding:"14px 16px",marginBottom:"16px"
          }}>
            <p style={{color:"#f87171",fontSize:"13px",margin:0}}>{error}</p>
          </div>
        )}

        {/* Results */}
        {identityData && !loading && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <ProfileCard
              walletAddress={identityData.walletAddress}
              domain={identityData.domain}
              records={identityData.records}
              theme={t}
            />
            <TrustScore scoreData={identityData.scoreData} theme={t} />
            <div style={{
              background:t.surface,border:`1px solid ${t.surfaceBorder}`,
              borderRadius:"16px",padding:"20px",transition:"all 0.3s ease"
            }}>
              <p style={{
                color:t.textFaint,fontSize:"10px",textTransform:"uppercase",
                letterSpacing:"1.5px",margin:"0 0 16px 0",fontWeight:"600"
              }}>Wallet Stats</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",textAlign:"center"}}>
                <div>
                  <p style={{color:t.text,fontWeight:"700",fontSize:"22px",margin:"0 0 4px 0",letterSpacing:"-0.5px"}}>
                    {identityData.walletData.balance.toFixed(2)}
                  </p>
                  <p style={{color:t.textFaint,fontSize:"11px",margin:0}}>SOL Balance</p>
                </div>
                <div>
                  <p style={{color:t.text,fontWeight:"700",fontSize:"22px",margin:"0 0 4px 0",letterSpacing:"-0.5px"}}>
                    {identityData.walletData.transactionCount.toLocaleString()}
                  </p>
                  <p style={{color:t.textFaint,fontSize:"11px",margin:0}}>Transactions</p>
                </div>
                <div>
                  <p style={{color:t.text,fontWeight:"700",fontSize:"22px",margin:"0 0 4px 0",letterSpacing:"-0.5px"}}>
                    {identityData.walletData.accountAge}
                  </p>
                  <p style={{color:t.textFaint,fontSize:"11px",margin:0}}>Days Old</p>
                </div>
              </div>
            </div>

            {/* SDK callout */}
            <div style={{
              background:t.sdkBg,border:`1px solid ${t.sdkBorder}`,
              borderRadius:"16px",padding:"16px 20px",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              transition:"all 0.3s ease"
            }}>
              <div>
                <p style={{color:t.badgeText,fontSize:"12px",fontWeight:"600",margin:"0 0 2px 0"}}>
                  Use this in your dApp
                </p>
                <p style={{color:t.textMuted,fontSize:"11px",margin:0,fontFamily:"monospace"}}>
                    const id = await getIdentity("wallet.sol")
                </p>
              </div>
              
             <a   href="https://github.com/Rolexcode/sol-identity"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.3)",
                  borderRadius:"8px",padding:"6px 12px",color:"#a78bfa",
                  fontSize:"11px",fontWeight:"600",textDecoration:"none",whiteSpace:"nowrap"
                }}
              >
                View Docs
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:"32px"}}>
          <p style={{color:t.textFaint,fontSize:"11px",margin:0}}>
            Powered by SNS · Built on Solana
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
