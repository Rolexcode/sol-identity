function ProfileCard({ walletAddress, domain, records }) {
  return (
    <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"16px",padding:"24px",border:"1px solid rgba(255,255,255,0.1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"16px"}}>
        <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",fontWeight:"700",color:"white"}}>
          {domain ? domain[0].toUpperCase() : "?"}
        </div>
        <div>
          {domain ? (
            <h2 style={{color:"white",fontSize:"18px",fontWeight:"700",margin:"0 0 4px 0"}}>{domain}</h2>
          ) : (
            <h2 style={{color:"#6b7280",fontSize:"14px",margin:"0 0 4px 0"}}>No .sol domain found</h2>
          )}
          <p style={{color:"#6b7280",fontSize:"12px",margin:0,fontFamily:"monospace"}}>
            {walletAddress.slice(0,6)}...{walletAddress.slice(-6)}
          </p>
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"16px"}}>
        {records?.twitter && (
          <p style={{color:"#a78bfa",fontSize:"13px",margin:"0 0 8px 0"}}>X: @{records.twitter}</p>
        )}
        {records?.url && (
          <a href={records.url} target="_blank" rel="noopener noreferrer" style={{color:"#a78bfa",fontSize:"13px"}}>{records.url}</a>
        )}
        {!records?.twitter && !records?.url && (
          <p style={{color:"#4b5563",fontSize:"12px",margin:0}}>No social records on-chain</p>
        )}
      </div>
    </div>
  );
}
export default ProfileCard;
