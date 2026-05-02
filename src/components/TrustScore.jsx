import { getTrustColor } from "../utils/trustScore";

function TrustScore({ scoreData, theme: t }) {
  const { score, level, breakdown } = scoreData;
  const colors = {
    "High Trust":"#34d399",
    "Medium Trust":"#fbbf24",
    "Low Trust":"#fb923c",
    "Very Low Trust":"#f87171"
  };
  const color = colors[level] || "#f87171";

  return (
    <div style={{
      background:t.surface,borderRadius:"16px",padding:"24px",
      border:`1px solid ${t.surfaceBorder}`,transition:"all 0.3s ease"
    }}>
      <h3 style={{color:t.text,fontSize:"16px",fontWeight:"700",margin:"0 0 20px 0",transition:"color 0.3s ease"}}>
        Trust Score
      </h3>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
        <span style={{fontSize:"56px",fontWeight:"800",color:color,lineHeight:1}}>{score}</span>
        <div style={{textAlign:"right"}}>
          <p style={{color:color,fontWeight:"600",fontSize:"16px",margin:"0 0 4px 0"}}>{level}</p>
          <p style={{color:t.textMuted,fontSize:"11px",margin:0}}>out of 100</p>
        </div>
      </div>
      <div style={{background:t.surfaceBorder,borderRadius:"999px",height:"6px",marginBottom:"20px"}}>
        <div style={{
          background:color,height:"6px",borderRadius:"999px",
          width:`${score}%`,transition:"width 0.5s ease"
        }} />
      </div>
      <p style={{
        color:t.textFaint,fontSize:"10px",textTransform:"uppercase",
        letterSpacing:"1.5px",margin:"0 0 12px 0",fontWeight:"600"
      }}>Score Breakdown</p>
      {[
        {label:".sol Domain",pts:breakdown.domain,max:30,desc:breakdown.domain>0?"Verified":"Not found"},
        {label:"Wallet Age",pts:breakdown.age,max:25,desc:`${breakdown.age} / 25 pts`},
        {label:"Transactions",pts:breakdown.transactions,max:25,desc:`${breakdown.transactions} / 25 pts`},
        {label:"SOL Balance",pts:breakdown.balance,max:20,desc:`${breakdown.balance} / 20 pts`},
      ].map(row => (
        <div key={row.label} style={{marginBottom:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
            <span style={{color:t.text,fontSize:"13px",transition:"color 0.3s ease"}}>{row.label}</span>
            <span style={{color:t.textMuted,fontSize:"13px",transition:"color 0.3s ease"}}>{row.desc}</span>
          </div>
          <div style={{background:t.surfaceBorder,borderRadius:"999px",height:"4px"}}>
            <div style={{
              background:"#7c3aed",height:"4px",borderRadius:"999px",
              width:`${(row.pts/row.max)*100}%`,transition:"width 0.5s ease"
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default TrustScore;
