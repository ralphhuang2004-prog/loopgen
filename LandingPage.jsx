// LandingPage.jsx — LoopGen · Premium redesign for 18–45 market
// 390×844 px · inside Phone wrapper · zero external deps

import { useState, useEffect, useRef } from "react";

// ─── Design tokens — bold, modern, youthful ───────────────────────────────────
const T = {
  bg:       "#f7f6f3",
  surface:  "#ffffff",
  ink:      "#0f0f0f",
  ink2:     "#3d3d3d",
  ink3:     "#888",
  border:   "#e8e8e5",
  g:        "#1a6b3a",
  gBr:      "#22c55e",
  gBg:      "rgba(26,107,58,0.08)",
  gRing:    "rgba(26,107,58,0.20)",
  sand:     "#ede9e3",
  accent:   "#1a6b3a",
};

// ─── Listings — reordered: Vintage · Retro · Sneakers · Y2K · Gaming · Fashion ─
const LISTINGS = [
  { id:"l1", img:"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
    title:"Vintage Polaroid OneStep Camera", category:"Vintage & Collectibles",
    price:"$85",  tags:["Vintage","Collector"], loc:"Fitzroy, VIC" },
  { id:"l2", img:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
    title:"Retro PlayStation 1 + Controllers", category:"Vintage & Collectibles",
    price:"$120", tags:["Retro","90s"],         loc:"Newtown, NSW" },
  { id:"l3", img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    title:"Carhartt WIP Detroit Jacket — M",   category:"Fashion",
    price:"$130", tags:["Vintage","Good"],      loc:"Brunswick, VIC" },
  { id:"l4", img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    title:"Air Jordan 4 Retro — White Cement",  category:"Fashion",
    price:"$260", tags:["Sneakers","Good"],     loc:"Surry Hills, NSW" },
  { id:"l5", img:"https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80",
    title:"Pink Floyd — The Wall (Vinyl)",      category:"Vintage & Collectibles",
    price:"$40",  tags:["Vintage","Collector"], loc:"Paddington, NSW" },
  { id:"l6", img:"https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80",
    title:"Nintendo Switch OLED — White",       category:"Gaming",
    price:"$320", tags:["Like New","Gaming"],   loc:"Newstead, QLD" },
];

const HERO_TILES = [
  { img:"https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=500&q=80", tag:"Cameras"  },
  { img:"https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&q=80", tag:"Vinyl"    },
  { img:"https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=500&q=80", tag:"Gaming"   },
  { img:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80",    tag:"Kitchen"  },
];

const STEPS = [
  { n:"01", label:"List or browse" },
  { n:"02", label:"Chat & agree"   },
  { n:"03", label:"Meet & trade"   },
];

const FEATURES = [
  { emoji:"🏷️", color:"#f0fdf4", border:"rgba(26,107,58,0.14)",
    title:"Better Deals",              body:"Find great items at fair prices." },
  { emoji:"⚡", color:"#fffbeb", border:"rgba(180,120,20,0.15)",
    title:"Fast & Direct",             body:"Connect and deal without the hassle." },
  { emoji:"🔄", color:"#eff6ff", border:"rgba(59,100,220,0.14)",
    title:"Built for Everyday Trading",body:"From quick sales to bigger finds." },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes lp-float  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-7px)}  }
  @keyframes lp-float2 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
  @keyframes lp-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes lp-ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes lp-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
  @keyframes lp-in     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .lp-shimmer {
    background:linear-gradient(90deg,#ede9e3 25%,#f5f3ef 50%,#ede9e3 75%);
    background-size:200% 100%; animation:lp-shimmer 1.4s ease infinite;
  }
  .lp-reveal { opacity:0; transform:translateY(16px);
    transition:opacity 0.5s ease, transform 0.5s ease; }
  .lp-reveal.vis { opacity:1; transform:translateY(0); }
  .lp-reveal.d1 { transition-delay:0.07s }
  .lp-reveal.d2 { transition-delay:0.14s }
  .lp-reveal.d3 { transition-delay:0.21s }
  .lp-reveal.d4 { transition-delay:0.28s }

  .lp-card { transition:transform 0.18s ease, box-shadow 0.18s ease; }
  .lp-card:active { transform:scale(0.968); }

  .lp-btn-p {
    background:#0f0f0f; color:#fff; border:none; border-radius:100px;
    font-family:inherit; font-weight:700; letter-spacing:0.01em; cursor:pointer;
    transition:background 0.15s, transform 0.12s;
  }
  .lp-btn-p:active { background:#2d2d2d; transform:scale(0.97); }

  .lp-btn-g {
    background:linear-gradient(135deg,#1a6b3a,#1f8046); color:#fff;
    border:none; border-radius:100px;
    font-family:inherit; font-weight:700; cursor:pointer;
    box-shadow:0 6px 20px rgba(26,107,58,0.35);
    transition:box-shadow 0.15s, transform 0.12s;
  }
  .lp-btn-g:active { box-shadow:0 2px 8px rgba(26,107,58,0.25); transform:scale(0.97); }

  .lp-btn-s {
    background:transparent; color:#0f0f0f;
    border:1.5px solid #d4d0c9; border-radius:100px;
    font-family:inherit; font-weight:600; cursor:pointer;
    transition:border-color 0.15s, background 0.15s;
  }
  .lp-btn-s:active { background:#f0ede8; }

  .lp-save { transition:color 0.14s, transform 0.14s; cursor:pointer; }
  .lp-save:active { transform:scale(1.3); }

  .lp-checkbox { width:16px; height:16px; cursor:pointer; accent-color:#1a6b3a; flex-shrink:0; }
`;

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useEnter(ms = 60) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), ms); return () => clearTimeout(t); }, []);
  return on;
}

function useReveal(d = "") {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const root = el.closest("[data-scroll-root]") || null;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("vis"); if (d) el.classList.add(d); io.disconnect(); }
    }, { threshold: 0.08, root, rootMargin:"0px 0px -8px 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return ref;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function LazyImg({ src, alt, style = {} }) {
  const [ok, setOk] = useState(false);
  return (
    <div style={{ position:"relative", overflow:"hidden", ...style }}>
      {!ok && <div className="lp-shimmer" style={{ position:"absolute", inset:0 }} />}
      <img src={src} alt={alt} onLoad={() => setOk(true)}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block",
          opacity: ok ? 1 : 0, transition:"opacity 0.3s" }} />
    </div>
  );
}

function LoopGenLogo({ height = 32, style = {} }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div style={{ display:"flex", alignItems:"center", gap:7, ...style }}>
      <div style={{ width:height, height:height, borderRadius:Math.round(height*0.28),
        background:"linear-gradient(135deg,#1a6b3a,#22c55e)",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:"white", fontWeight:900, fontSize:Math.round(height*0.5) }}>L</span>
      </div>
      <span style={{ fontSize:Math.round(height*0.56), fontWeight:800, color:T.ink, letterSpacing:-0.3 }}>LoopGen</span>
    </div>
  );
  return (
    <img src="/loopgen-logo.png" alt="LoopGen" onError={() => setErr(true)}
      style={{ height, width:"auto", maxWidth:height*2.8, display:"block",
        objectFit:"contain", flexShrink:0,
        filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.08))", ...style }} />
  );
}

// Category pill
function CatPill({ label }) {
  return (
    <span style={{ display:"inline-block", padding:"3px 10px",
      background:"rgba(0,0,0,0.48)", backdropFilter:"blur(6px)",
      color:"white", fontSize:9, fontWeight:700, letterSpacing:"0.07em",
      borderRadius:50, textTransform:"uppercase" }}>
      {label}
    </span>
  );
}

// Section heading
function SHead({ eyebrow, title, action, onAction, center = false, pad = false }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="lp-reveal"
      style={{ display:"flex", alignItems:"flex-end",
        justifyContent: center ? "center" : "space-between",
        flexDirection: center ? "column" : "row",
        marginBottom:18,
        padding: pad ? "0 22px" : undefined,
        textAlign: center ? "center" : "left" }}>
      <div>
        <div style={{ fontSize:10, fontWeight:800, color:T.g,
          textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:4 }}>
          {eyebrow}
        </div>
        <div style={{ fontSize:20, fontWeight:900, color:T.ink,
          letterSpacing:"-0.4px", lineHeight:1.2 }}>
          {title}
        </div>
      </div>
      {action && onAction && (
        <button onClick={onAction} style={{ background:"none", border:"none",
          cursor:"pointer", fontFamily:"inherit", fontSize:12,
          fontWeight:700, color:T.g, padding:0, flexShrink:0 }}>
          {action} →
        </button>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ height:1, background:T.border, margin:"0 22px" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage({ onBrowse, onSell, onSignIn, onRegister, demoMode = false }) {
  const go = fn => fn && fn();
  const entered = useEnter(50);

  return (
    <div data-scroll-root
      style={{ flex:1, overflowY:"auto", overflowX:"hidden", background:T.bg,
        fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
        scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
      <style>{CSS}</style>

      {demoMode && (
        <div style={{ background:"#0f0f0f", color:"rgba(255,255,255,0.55)",
          fontSize:10, fontWeight:700, textAlign:"center",
          padding:"6px 0", letterSpacing:"0.09em" }}>
          DEMO MODE
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section style={{ background:T.surface, paddingBottom:28 }}>

        {/* Nav bar */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 20px 10px",
          opacity: entered ? 1 : 0, transform: entered ? "none" : "translateY(-6px)",
          transition:"opacity 0.4s ease, transform 0.4s ease",
        }}>
          <LoopGenLogo height={32} />
          <div style={{ display:"flex", gap:8 }}>
            <button className="lp-btn-s" onClick={() => go(onSignIn)}
              style={{ padding:"7px 14px", fontSize:12 }}>Sign in</button>
            <button className="lp-btn-p" onClick={() => go(onRegister)}
              style={{ padding:"7px 14px", fontSize:12 }}>Join free</button>
          </div>
        </div>

        {/* Hero headline */}
        <div style={{
          padding:"28px 22px 0",
          opacity: entered ? 1 : 0, transform: entered ? "none" : "translateY(18px)",
          transition:"opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}>
          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:7,
            background:T.gBg, border:`1px solid ${T.gRing}`,
            borderRadius:50, padding:"5px 14px", marginBottom:18 }}>
            <span style={{ width:6, height:6, borderRadius:"50%",
              background:T.gBr, display:"inline-block",
              animation:"lp-pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize:10, fontWeight:800, color:T.g,
              textTransform:"uppercase", letterSpacing:"0.09em" }}>
              Next Gen Marketplace
            </span>
          </div>

          {/* Big headline */}
          <h1 style={{ fontSize:34, fontWeight:900, color:T.ink,
            lineHeight:1.05, letterSpacing:"-1px", marginBottom:12 }}>
            Find rare.<br />
            <span style={{ color:T.g }}>Trade smart.</span>
          </h1>

          <p style={{ fontSize:14, color:T.ink2, lineHeight:1.6, marginBottom:6 }}>
            Vintage, tech, fashion — all in one place.
          </p>
          <p style={{ fontSize:11, color:T.ink3, fontWeight:700,
            letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:26 }}>
            Simple. Done.
          </p>
          {/* Soft positioning line */}
          <p style={{ fontSize:11, color:T.ink3, fontWeight:500,
            letterSpacing:"0.02em", marginBottom:22 }}>
            Trending: Vintage · Sneakers · Tech · Home
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <button className="lp-btn-g" onClick={() => go(onBrowse)}
              style={{ flex:2, padding:"14px 0", fontSize:14 }}>
              Explore Listings
            </button>
            <button className="lp-btn-s" onClick={() => go(onRegister)}
              style={{ flex:1, padding:"14px 0", fontSize:13 }}>
              Join free
            </button>
          </div>
          <p style={{ fontSize:10, color:T.ink3, textAlign:"center", marginTop:8 }}>
            By continuing, you agree to our{" "}
            <a href="/terms" style={{ color:T.g, textDecoration:"none", fontWeight:600 }}>Terms</a>
            {" & "}
            <a href="/privacy" style={{ color:T.g, textDecoration:"none", fontWeight:600 }}>Privacy Policy</a>
          </p>
        </div>

        {/* Photo mosaic */}
        <HeroBento entered={entered} onTap={() => go(onBrowse)} />
      </section>

      {/* ══ TICKER ════════════════════════════════════════════════════════ */}
      <Ticker />

      {/* ══ TRENDING ══════════════════════════════════════════════════════ */}
      <section style={{ background:T.surface, paddingTop:40, paddingBottom:4 }}>
        <SHead eyebrow="Live now" title="Trending on LoopGen"
          action="See all" onAction={() => go(onBrowse)} pad />
        <div style={{ display:"flex", gap:12, overflowX:"auto",
          padding:"4px 22px 22px", scrollbarWidth:"none" }}>
          {LISTINGS.map((item, i) => (
            <ListingCard key={item.id} item={item} delay={i} onTap={() => go(onBrowse)} />
          ))}
        </div>
      </section>

      <Divider />

      {/* ══ WHY ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"40px 22px 0", background:T.bg }}>
        <SHead eyebrow="Why LoopGen" title="The smarter way to trade." />
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.title} item={f} delay={i} />)}
        </div>
      </section>

      <Divider />

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section style={{ padding:"40px 22px 36px", background:T.surface }}>
        <SHead eyebrow="How it works" title="Three steps. That's it." />
        <div style={{ background:T.bg, borderRadius:20, padding:"18px 16px",
          display:"flex", alignItems:"center", gap:6 }}>
          {STEPS.map((s, i) => (
            <StepRow key={s.n} step={s} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </section>

      <Divider />

      {/* ══ CTA + FOOTER ══════════════════════════════════════════════════ */}
      <CtaAndFooter onBrowse={() => go(onBrowse)} onRegister={() => go(onRegister)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HERO BENTO
// ─────────────────────────────────────────────────────────────────────────────
function HeroBento({ entered, onTap }) {
  const delay = n => `${0.22 + n * 0.09}s`;
  const tile = (n, anim, extra = {}) => ({
    borderRadius:18, overflow:"hidden", position:"relative",
    cursor:"pointer",
    boxShadow:"0 8px 28px rgba(0,0,0,0.12)",
    ...extra,
    opacity: entered ? 1 : 0,
    transform: entered ? "none" : "translateY(18px) scale(0.95)",
    transition:`opacity 0.6s ease ${delay(n)}, transform 0.6s ease ${delay(n)}`,
    animation: entered ? `${anim} ${4 + n * 0.6}s ease-in-out ${1 + n * 0.25}s infinite` : "none",
  });

  return (
    <div onClick={onTap} style={{ margin:"24px 22px 0" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:10, marginBottom:10 }}>
        <div style={tile(0, "lp-float", { height:172 })}>
          <LazyImg src={HERO_TILES[0].img} alt={HERO_TILES[0].tag} style={{ height:"100%" }} />
          <div style={{ position:"absolute", top:10, right:10,
            background:"white", borderRadius:50, padding:"4px 10px",
            fontSize:9, fontWeight:800, color:T.g,
            boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
            ✓ Member
          </div>
          <div style={{ position:"absolute", bottom:10, left:10 }}>
            <CatPill label={HERO_TILES[0].tag} />
          </div>
        </div>
        <div style={tile(1, "lp-float2", { height:172 })}>
          <LazyImg src={HERO_TILES[1].img} alt={HERO_TILES[1].tag} style={{ height:"100%" }} />
          <div style={{ position:"absolute", bottom:10, left:10 }}>
            <CatPill label={HERO_TILES[1].tag} />
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[2,3].map(i => (
          <div key={i} style={tile(i, i%2===0?"lp-float":"lp-float2", { height:108 })}>
            <LazyImg src={HERO_TILES[i].img} alt={HERO_TILES[i].tag} style={{ height:"100%" }} />
            <div style={{ position:"absolute", bottom:8, left:8 }}>
              <CatPill label={HERO_TILES[i].tag} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TICKER
// ─────────────────────────────────────────────────────────────────────────────
function Ticker() {
  const words = ["Cameras","Vinyl","Sneakers","Gaming","Fashion",
    "Kitchen","Furniture","Tech","Books","Jewellery","Collectibles","Sports","Vintage","Toys"];
  const doubled = [...words, ...words];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${T.border}`,
      borderBottom:`1px solid ${T.border}`, background:T.surface, padding:"9px 0" }}>
      <div style={{ display:"flex", width:"max-content", animation:"lp-ticker 24s linear infinite" }}>
        {doubled.map((w, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:8,
            padding:"0 16px", fontSize:10, fontWeight:700, color:T.ink3,
            textTransform:"uppercase", letterSpacing:"0.10em", whiteSpace:"nowrap" }}>
            <span style={{ width:4, height:4, borderRadius:"50%",
              background:T.gBr, display:"inline-block" }} />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Tag colour map — mirrors App.jsx TAG_COLORS ─────────────────────────────
const TAG_COLORS = {
  "Vintage":         { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  "Retro":           { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
  "Collector":       { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Like New":        { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Good":            { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "90s":             { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  "Y2K":             { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Limited Edition": { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  "80s":             { bg:"#fff1f2", text:"#9f1239", border:"#fecdd3" },
  "Gaming":          { bg:"#eef2ff", text:"#3730a3", border:"#c7d2fe" },
  "Fashion":         { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  "Sneakers":        { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
};

function LPTag({ label }) {
  const c = TAG_COLORS[label] || { bg:"#f3f4f6", text:"#374151", border:"#e5e7eb" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center",
      padding:"4px 10px", borderRadius:50,
      fontSize:11, fontWeight:800, letterSpacing:"0.02em",
      background:c.bg, color:c.text, border:`1.5px solid ${c.border}`,
      flexShrink:0 }}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LISTING CARD — matches home screen style
// ─────────────────────────────────────────────────────────────────────────────
function ListingCard({ item, delay, onTap }) {
  const ref = useReveal(`d${Math.min(delay+1,4)}`);
  const [saved, setSaved] = useState(false);
  return (
    <div ref={ref} className={`lp-reveal lp-card d${Math.min(delay+1,4)}`}
      onClick={onTap}
      style={{ flexShrink:0, width:168, background:T.surface,
        borderRadius:22, border:`1px solid ${T.border}`,
        overflow:"hidden", cursor:"pointer",
        boxShadow:"0 4px 18px rgba(0,0,0,0.10)" }}>
      <div style={{ position:"relative" }}>
        <LazyImg src={item.img} alt={item.title} style={{ height:160 }} />
        {/* Save button */}
        <button className="lp-save"
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          style={{ position:"absolute", top:10, right:10, width:32, height:32,
            borderRadius:"50%", background:"rgba(255,255,255,0.92)",
            backdropFilter:"blur(8px)", border:"none", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
            color: saved ? "#e53935" : "#aaa", padding:0,
            boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
          {saved ? "♥" : "♡"}
        </button>
        {/* Category — frosted dark pill, bottom-left */}
        <div style={{ position:"absolute", bottom:10, left:10,
          background: item.category === "Vintage & Collectibles"
            ? "rgba(109,40,217,0.88)" : "rgba(0,0,0,0.55)",
          backdropFilter:"blur(8px)",
          color:"white", fontSize:10, fontWeight:800,
          letterSpacing:"0.06em", padding:"4px 10px",
          borderRadius:50, textTransform:"uppercase" }}>
          {item.category === "Vintage & Collectibles" ? "✦ VINTAGE" : item.category}
        </div>
      </div>
      <div style={{ padding:"11px 12px 13px" }}>
        <div style={{ fontSize:17, fontWeight:900, color:T.ink,
          lineHeight:1, marginBottom:4, letterSpacing:"-0.3px" }}>
          {item.price}
        </div>
        <div style={{ fontSize:12, fontWeight:600, color:T.ink2,
          overflow:"hidden", textOverflow:"ellipsis",
          whiteSpace:"nowrap", marginBottom:5 }}>
          {item.title}
        </div>
        {/* Location — same as home screen card */}
        <div style={{ fontSize:11, color:"#aaa", marginBottom:8,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          📍 {item.loc}
        </div>
        {/* Multiple colour tag pills — same as home screen */}
        {item.tags?.length > 0 && (
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {item.tags.slice(0,2).map(t => <LPTag key={t} label={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({ item, delay }) {
  const ref = useReveal(`d${delay+1}`);
  return (
    <div ref={ref} className={`lp-reveal lp-card d${delay+1}`}
      style={{ display:"flex", gap:14, alignItems:"flex-start",
        background:T.surface, border:`1px solid ${item.border}`,
        borderRadius:20, padding:"18px 16px",
        boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ width:46, height:46, borderRadius:14, flexShrink:0,
        background:item.color, border:`1px solid ${item.border}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22 }}>
        {item.emoji}
      </div>
      <div>
        <div style={{ fontSize:14, fontWeight:800, color:T.ink, marginBottom:5 }}>
          {item.title}
        </div>
        <div style={{ fontSize:12, color:T.ink2, lineHeight:1.65 }}>
          {item.body}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP ROW — horizontal pill
// ─────────────────────────────────────────────────────────────────────────────
function StepRow({ step, index, isLast }) {
  const ref = useReveal(`d${index+1}`);
  return (
    <div ref={ref} className={`lp-reveal d${index+1}`}
      style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
      <div style={{ width:34, height:34, borderRadius:50, flexShrink:0,
        background:"linear-gradient(145deg,#1a6b3a,#1f8046)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:800, color:"white",
        boxShadow:"0 3px 10px rgba(26,107,58,0.30)" }}>
        {step.n}
      </div>
      <span style={{ fontSize:12, fontWeight:700, color:T.ink, lineHeight:1.3 }}>
        {step.label}
      </span>
      {!isLast && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink:0, marginLeft:"auto", opacity:0.25 }}>
          <path d="M4 8h8M9 5l3 3-3 3" stroke={T.ink}
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CTA + FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function CtaAndFooter({ onBrowse, onRegister }) {
  const ref = useReveal();
  const [agreed, setAgreed] = useState(false);

  return (
    <section style={{ padding:"40px 22px 36px", background:T.bg }}>
      <div ref={ref} className="lp-reveal"
        style={{ background:"linear-gradient(150deg,#0a2415 0%,#1a6b3a 100%)",
          borderRadius:28, padding:"38px 24px",
          position:"relative", overflow:"hidden", marginBottom:32 }}>

        {/* Ambient circles */}
        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:130, height:130,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        {/* Dot texture */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",
          backgroundSize:"20px 20px" }} />

        <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.45)",
          textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:12 }}>
          Ready?
        </div>
        <h2 style={{ fontSize:24, fontWeight:900, color:"white",
          letterSpacing:"-0.6px", lineHeight:1.15, marginBottom:10 }}>
          Start buying &amp; selling<br />
          <span style={{ color:"rgba(163,255,196,0.95)" }}>today.</span>
        </h2>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)",
          lineHeight:1.6, marginBottom:24 }}>
          Free to join. No listing fees.
        </p>

        <label style={{ display:"flex", alignItems:"flex-start", gap:9,
          marginBottom:20, cursor:"pointer" }}>
          <input type="checkbox" className="lp-checkbox"
            checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.58)", lineHeight:1.55 }}>
            I agree to the{" "}
            <a href="/terms" style={{ color:"rgba(163,255,196,0.85)",
              textDecoration:"none", fontWeight:700 }}>Terms</a>{" "}and{" "}
            <a href="/privacy" style={{ color:"rgba(163,255,196,0.85)",
              textDecoration:"none", fontWeight:700 }}>Privacy Policy</a>
          </span>
        </label>

        <button onClick={onRegister} disabled={!agreed}
          style={{ width:"100%", padding:"15px", borderRadius:50, border:"none",
            background: agreed ? "white" : "rgba(255,255,255,0.22)",
            color: agreed ? T.g : "rgba(255,255,255,0.45)",
            fontSize:15, fontWeight:800, cursor: agreed ? "pointer" : "default",
            fontFamily:"inherit", marginBottom:10,
            boxShadow: agreed ? "0 8px 24px rgba(0,0,0,0.22)" : "none",
            transition:"all 0.2s" }}>
          Create Free Account
        </button>

        <button onClick={onBrowse}
          style={{ width:"100%", padding:"13px", borderRadius:50,
            border:"1.5px solid rgba(255,255,255,0.22)",
            background:"transparent", color:"rgba(255,255,255,0.78)",
            fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          Explore Listings
        </button>
      </div>

      {/* Footer */}
      <footer>
        <div style={{ display:"flex", justifyContent:"center",
          gap:18, marginBottom:12, flexWrap:"wrap" }}>
          {[["Terms","/terms"],["Privacy","/privacy"],
            ["Trust & Safety","/trust"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize:11, color:T.ink3,
              textDecoration:"none", fontWeight:600 }}>{l}</a>
          ))}
          <a href="mailto:loopgensupport@gmail.com"
            style={{ fontSize:11, color:T.ink3, textDecoration:"none", fontWeight:600 }}>
            Contact
          </a>
        </div>
        <p style={{ fontSize:10, color:"#bbb", textAlign:"center", lineHeight:1.7 }}>
          LoopGen is operated by NexaraX Pty Ltd<br />
          ACN 696 134 620 · ABN 43 696 134 620
        </p>
      </footer>
    </section>
  );
}
