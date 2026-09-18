import { useState } from "react";

const GREEN = "#1c7c45";
const EMAIL = "support@loopgen.com.au";

export default function ContactModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = EMAIL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,0,0,0.35)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#fff", borderRadius:20,
        boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
        padding:"28px 28px 24px",
        width:"100%", maxWidth:360,
        position:"relative",
        fontFamily:"inherit",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          background:"none", border:"none", cursor:"pointer",
          fontSize:18, color:"#9ca3af", lineHeight:1, padding:4,
        }}>✕</button>

        <div style={{fontWeight:800, fontSize:17, color:"#111", marginBottom:6}}>
          Contact LoopGen
        </div>
        <div style={{fontSize:13, color:"#6b7280", marginBottom:20, lineHeight:1.5}}>
          Need help or have a question?
        </div>

        <div style={{
          background:"#f0fdf4", borderRadius:12,
          padding:"12px 16px", marginBottom:18,
          fontSize:14, fontWeight:700, color:GREEN,
          textAlign:"center", letterSpacing:"0.01em",
        }}>
          {EMAIL}
        </div>

        <div style={{display:"flex", gap:10}}>
          <button onClick={copy} style={{
            flex:1, padding:"11px 0",
            background:GREEN, color:"#fff",
            border:"none", borderRadius:12,
            fontWeight:700, fontSize:13,
            cursor:"pointer", fontFamily:"inherit",
            transition:"opacity 0.15s",
          }}>
            {copied ? "Copied ✓" : "Copy email"}
          </button>
          <a href={"mailto:" + EMAIL} style={{
            flex:1, padding:"11px 0",
            background:"#f3f4f6", color:"#374151",
            border:"none", borderRadius:12,
            fontWeight:600, fontSize:13,
            cursor:"pointer", fontFamily:"inherit",
            textDecoration:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            Open email app
          </a>
        </div>
      </div>
    </div>
  );
}
