// LandingPage.jsx — LoopGen · Premium brand experience · 18–45 market
// Visual/UX redesign: editorial hero + discovery section
// No marketplace inventory shown. No listings. No prices.
// All existing CTA handlers (onBrowse, onSell, onSignIn, onRegister) preserved.

import { useState, useEffect, useRef } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#f7f6f3",
  surface: "#ffffff",
  ink:     "#0f0f0f",
  ink2:    "#3d3d3d",
  ink3:    "#888",
  border:  "#e8e8e5",
  g:       "#1a6b3a",
  gBr:     "#22c55e",
  gBg:     "rgba(26,107,58,0.08)",
  gRing:   "rgba(26,107,58,0.20)",
  sand:    "#ede9e3",
};

// ─── Hero bento tiles — reference-matched photography ────────────────────────
// Overlay: 20-25% per reference image (bright, editorial, not dark luxury).
// Subtitles shown on all tiles including bottom row.
const BENTO_TILES = [
  {
    // Bright vintage collector desk: camera, vinyl and analogue memories.
    // Less dark than previous version so the product is visible on mobile.
    img:     "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=1200&q=88&auto=format&fit=crop",
    overlay: "rgba(0,0,0,0.18)",
    word:    "VINTAGE",
    sub:     "Stories worth owning",
    anim:    "lp-float",
  },
  {
    // Premium watch close-up for rarity and collector value.
    // Replaces sneaker / fashion feel with rare-object appeal.
    img:     "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&q=88&auto=format&fit=crop",
    overlay: "rgba(0,0,0,0.16)",
    word:    "RARE",
    sub:     "One of a kind",
    anim:    "lp-float2",
  },
  {
    // Local maker / Australian art direction: artwork, ceramics, greenery, warm home styling.
    // Replaces car/sofa imagery; feels young, local, creative and marketplace-relevant.
    img:     "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=88&auto=format&fit=crop",
    overlay: "rgba(0,0,0,0.14)",
    word:    "LOCAL",
    sub:     "Art. Makers. Nearby.",
    anim:    "lp-float",
  },
  {
    // Curated collector flatlay: watch / camera / everyday premium objects.
    // Avoids single luxury-ad image; feels like a styled editorial collection.
    img:     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=88&auto=format&fit=crop",
    overlay: "rgba(0,0,0,0.16)",
    word:    "CURATED",
    sub:     "Picked with taste",
    anim:    "lp-float2",
  },
];

// ─── Discovery section cards — reference-matched photography ─────────────────
// Overlay: 10-15% per reference (much brighter than bento, editorial Pinterest feel).
// No accent line in reference — removed. Arrow button added to match reference.
const DISCOVERY_CARDS = [
  {
    label:    "Vintage",
    headline: "Find stories\nworth owning.",
    sub:      "Cameras \u00b7 Vinyl \u00b7 Collectibles",
    // Bright analogue setup: camera, vinyl, small collectible details.
    img:      "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=900&q=88&auto=format&fit=crop",
    overlay:  "rgba(0,0,0,0.10)",
    accent:   "#60a5fa",
  },
  {
    label:    "Tech",
    headline: "Upgrade without\npaying retail.",
    sub:      "Consoles \u00b7 Audio \u00b7 Gadgets",
    // Youthful gaming/audio setup, brighter and more marketplace-friendly.
    img:      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=900&q=88&auto=format&fit=crop",
    overlay:  "rgba(0,0,0,0.12)",
    accent:   "#a78bfa",
  },
  {
    label:    "Home",
    headline: "Pieces that make\nspaces yours.",
    sub:      "Furniture \u00b7 Art \u00b7 Lighting",
    // Interior styling with art/decor feeling; keeps the younger Pinterest mood.
    img:      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=88&auto=format&fit=crop",
    overlay:  "rgba(0,0,0,0.08)",
    accent:   "#fbbf24",
  },
  {
    label:    "Fashion",
    headline: "Stand out.\nDon\u2019t blend in.",
    sub:      "Sneakers \u00b7 Streetwear \u00b7 Bags",
    // Streetwear flatlay direction rather than luxury-ad fashion.
    img:      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900&q=88&auto=format&fit=crop",
    overlay:  "rgba(0,0,0,0.10)",
    accent:   "#f472b6",
  },
];

const STEPS = [
  { n:"01", label:"List or browse" },
  { n:"02", label:"Chat & agree"   },
  { n:"03", label:"Meet & trade"   },
];

const FEATURES = [
  { emoji:"🏷️", color:"#f0fdf4", border:"rgba(26,107,58,0.14)",
    title:"Better Deals",              body:"Find great items at fair prices." },
  { emoji:"⚡",  color:"#fffbeb", border:"rgba(180,120,20,0.15)",
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
  @keyframes lp-word-in {
    from { opacity:0; transform:translateY(10px) scale(0.95); }
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }

  .lp-ticker-inner {
    display:flex; width:max-content;
    animation:lp-ticker 36s linear infinite; will-change:transform;
  }
  @media (min-width:768px) { .lp-ticker-inner { animation-duration:40s; } }

  @media (min-width:768px) {
    .lp-bento-bottom { height:200px !important; }
    .lp-disco-grid   { grid-template-columns:repeat(4,1fr) !important; }
  }

  @media (prefers-reduced-motion:reduce) {
    .lp-reveal { transition:opacity 0.2s ease !important; }
  }

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

  .lp-disco-card {
    position:relative; border-radius:16px; overflow:hidden; cursor:pointer;
    transition:transform 0.22s ease, box-shadow 0.22s ease;
    -webkit-tap-highlight-color:transparent;
  }
  .lp-disco-card:active { transform:scale(0.97); }
  @media (hover:hover) {
    .lp-disco-card:hover { transform:scale(1.03);
      box-shadow:0 12px 32px rgba(0,0,0,0.18) !important; }
    .lp-disco-card:hover img { transform:scale(1.04); }
  }

  /* Bento tile photo zoom on hover */
  .lp-btile-img {
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; object-position:center;
    transition:transform 0.5s ease;
    will-change:transform;
  }
  @media (hover:hover) {
    .lp-btile-wrap:hover .lp-btile-img { transform:scale(1.06); }
  }
  .lp-btile-wrap:active .lp-btile-img { transform:scale(1.03); }

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
    }, { threshold:0.08, root, rootMargin:"0px 0px -8px 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return ref;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
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

function SHead({ eyebrow, title, action, onAction, center = false, pad = false }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="lp-reveal"
      style={{ display:"flex", alignItems:"flex-end",
        justifyContent: center ? "center" : "space-between",
        flexDirection:  center ? "column" : "row",
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
      <section style={{ background:T.surface, paddingBottom:32 }}>

        {/* Nav bar */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 20px 10px",
          opacity:   entered ? 1 : 0,
          transform: entered ? "none" : "translateY(-6px)",
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
          opacity:   entered ? 1 : 0,
          transform: entered ? "none" : "translateY(18px)",
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
            <a href="/terms"   style={{ color:T.g, textDecoration:"none", fontWeight:600 }}>Terms</a>
            {" & "}
            <a href="/privacy" style={{ color:T.g, textDecoration:"none", fontWeight:600 }}>Privacy Policy</a>
          </p>
        </div>

        {/* Editorial bento mosaic — no product data, bold typography */}
        <HeroBento entered={entered} onTap={() => go(onBrowse)} />
      </section>

      {/* ══ TICKER ════════════════════════════════════════════════════════ */}
      <Ticker />

      {/* ══ DISCOVERY — "Find Your Next Obsession" ════════════════════════ */}
      <DiscoverySection onBrowse={() => go(onBrowse)} />

      {/* ══ WHY ═══════════════════════════════════════════════════════════ */}
      <Divider />
      <section style={{ padding:"40px 22px 0", background:T.bg }}>
        <SHead eyebrow="Why LoopGen" title="The smarter way to trade." />
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.title} item={f} delay={i} />)}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <Divider />
      <section style={{ padding:"40px 22px 36px", background:T.surface }}>
        <SHead eyebrow="How it works" title="Three steps. That's it." />
        <div style={{ background:T.bg, borderRadius:20, padding:"18px 16px",
          display:"flex", alignItems:"center", gap:6 }}>
          {STEPS.map((s, i) => (
            <StepRow key={s.n} step={s} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </section>

      {/* ══ CTA + FOOTER ══════════════════════════════════════════════════ */}
      <Divider />
      <CtaAndFooter onBrowse={() => go(onBrowse)} onRegister={() => go(onRegister)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HERO BENTO — editorial lifestyle mosaic
//  Pure CSS gradients + bold typography. No product data. No images to fetch.
//  Layout, animations and responsiveness are identical to before.
// ─────────────────────────────────────────────────────────────────────────────
function HeroBento({ entered, onTap }) {
  const delay = n => `${0.22 + n * 0.09}s`;
  const tile  = (n, extra = {}) => ({
    borderRadius:18, overflow:"hidden", position:"relative",
    cursor:"pointer", boxShadow:"0 8px 28px rgba(0,0,0,0.22)",
    ...extra,
    opacity:   entered ? 1 : 0,
    transform: entered ? "none" : "translateY(18px) scale(0.95)",
    transition:`opacity 0.6s ease ${delay(n)}, transform 0.6s ease ${delay(n)}`,
    animation: entered
      ? `${BENTO_TILES[n].anim} ${4 + n * 0.6}s ease-in-out ${1 + n * 0.25}s infinite`
      : "none",
  });

  return (
    <div onClick={onTap} style={{ margin:"24px 22px 0" }}>

      {/* Top row — two tall tiles. 1fr 1fr matches reference (equal widths). */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
        {[0,1].map(n => (
          <BentoTile key={n} tile={BENTO_TILES[n]} style={tile(n, { height:200 })} />
        ))}
      </div>

      {/* Bottom row — same height as top row per reference */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[2,3].map(n => (
          <BentoTile key={n} tile={BENTO_TILES[n]}
            style={tile(n, { height:200 })} className="lp-bento-bottom" />
        ))}
      </div>
    </div>
  );
}

// Single bento tile — real photo + light overlay + editorial typography + arrow button
// All tiles identical treatment per reference image (no small/large distinction)
function BentoTile({ tile, style, className }) {
  return (
    <div style={style} className={`${className || ""} lp-btile-wrap`}>
      {/* Marketplace photo — lazy loaded, covers tile, zooms on hover */}
      <img
        src={tile.img}
        alt={tile.word}
        loading="lazy"
        className="lp-btile-img"
        onError={e => { e.target.style.display = "none"; }}
      />

      {/* Light overlay — 20-25% per reference (bright, not dark luxury) */}
      <div style={{ position:"absolute", inset:0, background:tile.overlay }} />

      {/* Bottom scrim — gradient for text legibility only at bottom third */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        height:"55%",
        background:"linear-gradient(to top,rgba(0,0,0,0.68) 0%,rgba(0,0,0,0.20) 60%,transparent 100%)",
      }} />

      {/* Text block — bottom-left, always shown */}
      <div style={{
        position:"absolute", bottom:12, left:14, right:48,
      }}>
        <div style={{
          fontSize:  20,
          fontWeight: 900,
          color:      "white",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          lineHeight: 1.1,
          marginBottom: 3,
          textShadow: "0 1px 6px rgba(0,0,0,0.5)",
        }}>
          {tile.word}
        </div>
        <div style={{
          fontSize: 11, fontWeight:500, color:"rgba(255,255,255,0.82)",
          letterSpacing:"0.01em", lineHeight:1.3,
          textShadow:"0 1px 4px rgba(0,0,0,0.5)",
        }}>
          {tile.sub}
        </div>
      </div>

      {/* Arrow button — bottom-right, matches reference */}
      <div style={{
        position:"absolute", bottom:12, right:12,
        width:32, height:32, borderRadius:"50%",
        background:"white",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="#0f0f0f"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DISCOVERY SECTION — "Find Your Next Obsession"
//  4 editorial lifestyle cards. No listings. No prices. No seller data.
// ─────────────────────────────────────────────────────────────────────────────
function DiscoverySection({ onBrowse }) {
  const ref = useReveal();
  return (
    <section style={{ background:T.surface, padding:"44px 0 40px" }}>

      {/* Heading */}
      <div ref={ref} className="lp-reveal" style={{ padding:"0 22px", marginBottom:28 }}>
        <div style={{ fontSize:10, fontWeight:800, color:T.g,
          textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:6 }}>
          Discover
        </div>
        <h2 style={{ fontSize:26, fontWeight:900, color:T.ink,
          letterSpacing:"-0.6px", lineHeight:1.15, marginBottom:8 }}>
          Find Your Next<br />
          <span style={{ color:T.g }}>Obsession.</span>
        </h2>
        <p style={{ fontSize:13, color:T.ink3, lineHeight:1.65, maxWidth:300 }}>
          Discover unique finds, hidden gems and everyday treasures.
        </p>
      </div>

      {/* 2×2 grid on mobile, 1×4 on desktop */}
      <div className="lp-disco-grid" style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:12,
        padding:"0 22px",
      }}>
        {DISCOVERY_CARDS.map((card, i) => (
          <DiscoveryCard key={card.label} card={card} index={i} onBrowse={onBrowse} />
        ))}
      </div>

      {/* Single CTA below the grid */}
      <div style={{ padding:"28px 22px 0" }}>
        <button onClick={onBrowse}
          className="lp-btn-g"
          style={{ width:"100%", padding:"15px 0", fontSize:14, letterSpacing:"0.01em" }}>
          Explore All Listings
        </button>
      </div>
    </section>
  );
}

function DiscoveryCard({ card, index, onBrowse }) {
  const ref = useReveal(`d${index + 1}`);
  return (
    <div
      ref={ref}
      className={`lp-reveal lp-disco-card d${index + 1}`}
      onClick={onBrowse}
      role="button"
      tabIndex={0}
      aria-label={`Explore ${card.label}`}
      onKeyDown={e => e.key === "Enter" && onBrowse()}
      style={{ boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}
    >
      {/* Card face — taller per reference (220px), clips photo */}
      <div style={{
        height:   220,
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Photo — lazy loaded, bright per reference (10-15% overlay) */}
        <img
          src={card.img}
          alt={card.label}
          loading="lazy"
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center",
            transition:"transform 0.5s ease",
          }}
          onError={e => { e.target.style.display = "none"; }}
        />

        {/* Very light overlay — 10-15% per reference */}
        <div style={{ position:"absolute", inset:0, background:card.overlay }} />

        {/* Bottom scrim — only bottom 50% for text legibility */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:"55%",
          background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.20) 65%,transparent 100%)",
        }} />

        {/* Category pill — top-left, dark background per reference */}
        <div style={{
          position:"absolute", top:12, left:12,
          background:"rgba(0,0,0,0.65)",
          backdropFilter:"blur(6px)",
          borderRadius:50, padding:"4px 10px",
          fontSize:9, fontWeight:800, color:"white",
          letterSpacing:"0.10em", textTransform:"uppercase",
        }}>
          {card.label}
        </div>

        {/* Arrow button — bottom-right per reference */}
        <div style={{
          position:"absolute", bottom:12, right:12,
          width:28, height:28, borderRadius:"50%",
          background:"white",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 6px rgba(0,0,0,0.18)",
          flexShrink:0,
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#0f0f0f"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Headline + sub — bottom-left */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:44,
          padding:"0 12px 12px",
        }}>
          <div style={{
            fontSize:14, fontWeight:800, color:"white",
            letterSpacing:"-0.2px", lineHeight:1.2, marginBottom:4,
            textShadow:"0 1px 6px rgba(0,0,0,0.5)",
            whiteSpace:"pre-wrap",
          }}>
            {card.headline}
          </div>
          <div style={{
            fontSize:10, fontWeight:500,
            color:"rgba(255,255,255,0.75)",
            letterSpacing:"0.03em",
          }}>
            {card.sub}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TICKER — unchanged
// ─────────────────────────────────────────────────────────────────────────────
function Ticker() {
  const words = ["Cameras","Vinyl","Sneakers","Gaming","Fashion",
    "Kitchen","Furniture","Tech","Books","Jewellery","Collectibles","Sports","Vintage","Toys"];
  const doubled = [...words, ...words];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${T.border}`,
      borderBottom:`1px solid ${T.border}`, background:T.surface, padding:"9px 0" }}>
      <div className="lp-ticker-inner">
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

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURE CARD — unchanged
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({ item, delay }) {
  const ref = useReveal(`d${delay + 1}`);
  return (
    <div ref={ref} className={`lp-reveal lp-card d${delay + 1}`}
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
//  STEP ROW — unchanged
// ─────────────────────────────────────────────────────────────────────────────
function StepRow({ step, index, isLast }) {
  const ref = useReveal(`d${index + 1}`);
  return (
    <div ref={ref} className={`lp-reveal d${index + 1}`}
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
//  CTA + FOOTER — unchanged
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

        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:130, height:130,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
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
            <a href="/terms"   style={{ color:"rgba(163,255,196,0.85)",
              textDecoration:"none", fontWeight:700 }}>Terms</a>{" "}and{" "}
            <a href="/privacy" style={{ color:"rgba(163,255,196,0.85)",
              textDecoration:"none", fontWeight:700 }}>Privacy Policy</a>
          </span>
        </label>

        <button onClick={onRegister} disabled={!agreed}
          style={{ width:"100%", padding:"15px", borderRadius:50, border:"none",
            background: agreed ? "white" : "rgba(255,255,255,0.22)",
            color:      agreed ? T.g   : "rgba(255,255,255,0.45)",
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

      <footer>
        <div style={{ display:"flex", justifyContent:"center",
          gap:18, marginBottom:12, flexWrap:"wrap" }}>
          {[["Terms","/terms"],["Privacy","/privacy"],["Trust & Safety","/trust"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:11, color:T.ink3,
              textDecoration:"none", fontWeight:600 }}>{l}</a>
          ))}
          <a href="mailto:support@loopgen.com.au"
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
