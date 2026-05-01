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

function AppContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identityData, setIdentityData] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  // Core function that loads identity for any wallet address
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

  // Called when wallet connects via Phantom
  const handleWalletConnected = useCallback(async (walletAddress) => {
    if (walletConnected) return;
    setWalletConnected(true);
    await loadIdentity(walletAddress);
  }, [walletConnected, loadIdentity]);

  // Called when user searches a .sol domain or wallet address
  const handleSearch = async () => {
    const input = searchInput.trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setIdentityData(null);

    try {
      let walletAddress = input;

      // If input ends with .sol, resolve it to a wallet address first
      if (input.toLowerCase().endsWith(".sol")) {
        const resolved = await getWalletFromDomain(input);
        if (!resolved) {
          setError(`Could not find wallet for "${input}". Domain may not exist.`);
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
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"system-ui,sans-serif"}}>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{fontSize:"36px",marginBottom:"8px"}}>◎</div>
        <h1 style={{fontSize:"32px",fontWeight:"800",color:"white",margin:"0 0 8px 0",letterSpacing:"-1px"}}>Sol Identity</h1>
        <p style={{color:"#a78bfa",fontSize:"13px",margin:0}}>On-chain identity and trust scoring for Solana wallets</p>
      </div>

      {/* Search bar */}
      <div style={{width:"100%",maxWidth:"420px",marginBottom:"16px"}}>
        <div style={{display:"flex",gap:"8px"}}>
          <input
            type="text"
            placeholder="Search any .sol domain or wallet address..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"12px",padding:"12px 16px",color:"white",fontSize:"13px",outline:"none"}}
          />
          <button
            onClick={handleSearch}
            style={{background:"#7c3aed",border:"none",borderRadius:"12px",padding:"12px 20px",color:"white",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}
          >
            Search
          </button>
        </div>
        <p style={{color:"#4b5563",fontSize:"11px",textAlign:"center",margin:"8px 0 0 0"}}>
          Try: "bonfida.sol" or paste any wallet address
        </p>
      </div>

      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",maxWidth:"420px",marginBottom:"16px"}}>
        <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.1)"}} />
        <span style={{color:"#4b5563",fontSize:"12px"}}>or connect wallet</span>
        <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.1)"}} />
      </div>

      {/* Wallet connect */}
      <LoginButton onConnected={handleWalletConnected} />

      {/* Loading */}
      {loading && (
        <div style={{marginTop:"32px",color:"#a78bfa",fontSize:"14px"}}>
          Fetching on-chain identity...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{marginTop:"24px",color:"#f87171",fontSize:"13px",textAlign:"center",maxWidth:"380px"}}>{error}</div>
      )}

      {/* Results */}
      {identityData && !loading && (
        <div style={{marginTop:"24px",width:"100%",maxWidth:"420px",display:"flex",flexDirection:"column",gap:"16px"}}>
          <ProfileCard
            walletAddress={identityData.walletAddress}
            domain={identityData.domain}
            records={identityData.records}
          />
          <TrustScore scoreData={identityData.scoreData} />
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"16px",padding:"20px",border:"1px solid rgba(255,255,255,0.1)"}}>
            <p style={{color:"#6b7280",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px 0"}}>Wallet Stats</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",textAlign:"center"}}>
              <div>
                <p style={{color:"white",fontWeight:"700",fontSize:"20px",margin:"0 0 4px 0"}}>{identityData.walletData.balance.toFixed(2)}</p>
                <p style={{color:"#6b7280",fontSize:"11px",margin:0}}>SOL Balance</p>
              </div>
              <div>
                <p style={{color:"white",fontWeight:"700",fontSize:"20px",margin:"0 0 4px 0"}}>{identityData.walletData.transactionCount}</p>
                <p style={{color:"#6b7280",fontSize:"11px",margin:0}}>Transactions</p>
              </div>
              <div>
                <p style={{color:"white",fontWeight:"700",fontSize:"20px",margin:"0 0 4px 0"}}>{identityData.walletData.accountAge}</p>
                <p style={{color:"#6b7280",fontSize:"11px",margin:0}}>Days Old</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
