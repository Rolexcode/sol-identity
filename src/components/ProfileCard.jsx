function ProfileCard({ walletAddress, domain, records, theme: t }) {
  return (
    <div style={{
      background:t.surface,borderRadius:"16px",padding:"24px",
      border:`1px solid ${t.surfaceBorder}`,transition:"all 0.3s ease"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"16px"}}>
        <div style={{
          width:"56px",height:"56px",borderRadius:"50%",
          background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"22px",fontWeight:"700",color:"white",flexShrink:0
        }}>
          {domain ? domain[0].toUpperCase() : "?"}
        </div>
        <div>
          {domain ? (
            <h2 style={{color:t.text,fontSize:"18px",fontWeight:"700",margin:"0 0 4px 0",transition:"color 0.3s ease"}}>
              {domain}
            </h2>
          ) : (
            <h2 style={{color:t.textMuted,fontSize:"14px",margin:"0 0 4px 0",transition:"color 0.3s ease"}}>
              No .sol domain found
            </h2>
          )}
          <p style={{color:t.textFaint,fontSize:"12px",margin:0,fontFamily:"monospace",transition:"color 0.3s ease"}}>
            {walletAddress.slice(0,6)}...{walletAddress.slice(-6)}
          </p>
        </div>
      </div>
      <div style={{borderTop:`1px solid ${t.surfaceBorder}`,paddingTop:"16px"}}>
        {records?.twitter && (
          <p style={{color:"#a78bfa",fontSize:"13px",margin:"0 0 8px 0"}}>
            X: @{records.twitter}
          </p>
        )}
        {records?.url && (
          <a href={records.url} target="_blank" rel="noopener noreferrer"
            style={{color:"#a78bfa",fontSize:"13px",textDecoration:"none"}}>
            {records.url}
          </a>
        )}
        {!records?.twitter && !records?.url && (
          <p style={{color:t.textFaint,fontSize:"12px",margin:0,transition:"color 0.3s ease"}}>
            No social records on-chain
          </p>
        )}
      </div>
    </div>
  );
}
export default ProfileCard;
