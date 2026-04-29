// ╔══════════════════════════════════════════════════════════════╗
// ║  LoopGen  ·  Beta v0.1.0                                    ║
// ║  Auth · Listings · Vintage · Chat · Saved · Profile         ║
// ╚══════════════════════════════════════════════════════════════╝
//
// SUPABASE SETUP (one-time):
//   1. Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env.local
//   2. Run loopgen-schema.sql in Supabase SQL Editor
//   3. Enable Email Auth: Supabase > Authentication > Providers > Email
//   4. Create storage bucket "listing-images" (public)
//   5. Enable Realtime on messages table:
//      Database > Replication > supabase_realtime > messages
//
// OPTIONAL:
//   6. Deploy supabase/functions/loopgen-ai-desc
//      supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import LandingPage from "./LandingPage.jsx";

// ── ENV VARS ─────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const HAS_SUPABASE  = !!(SUPABASE_URL && SUPABASE_KEY);

// Supabase client (lazy — only if env vars are present)
const supabase = HAS_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── CONSTANTS ────────────────────────────────────────────────────
const GREEN = "#1c7c45";

// ── LoopGen Logo component — use everywhere branding is needed ────────────────
// height: desired display height in px. Width scales automatically (ratio ~1.61:1).
// Works on light or dark backgrounds because the PNG has a transparent background.
function LoopGenLogo({ height = 28, style = {} }) {
  const [err, setErr] = useState(false);
  if (err) {
    // Inline fallback: gradient box + wordmark
    return (
      <div style={{ display:"flex", alignItems:"center", gap:7, ...style }}>
        <div style={{ width:height, height:height, borderRadius:Math.round(height*0.28),
          background:"linear-gradient(135deg,#1c7c45,#22c55e)",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0 }}>
          <span style={{ color:"white", fontWeight:900,
            fontSize:Math.round(height*0.5) }}>L</span>
        </div>
        <span style={{ fontSize:Math.round(height*0.56), fontWeight:800,
          color:"#111", letterSpacing:-0.3 }}>LoopGen</span>
      </div>
    );
  }
  return (
    <img
      src="/loopgen-logo.png"
      alt="LoopGen"
      onError={() => setErr(true)}
      style={{
        height,
        width: "auto",
        maxWidth: height * 2.8,
        display: "block",
        objectFit: "contain",
        flexShrink: 0,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
        ...style,
      }}
    />
  );
}

// ── DEMO SELLER PROFILES ─────────────────────────────────────────
// Five curated demo sellers, each with a distinct niche identity
const DEMO_SELLERS = {
  VintageHunter: {
    username: "VintageHunter",
    bio: "Sourcing pre-loved treasures across Melbourne's op-shops & markets. Specialising in film cameras, vinyl, and retro tech. 🎞️",
    location: "Fitzroy, VIC",
    joined: "Jan 2023",
    rating: 4.9,
    avatar_initial: "V",
  },
  RetroCollector: {
    username: "RetroCollector",
    bio: "Sydney's go-to for retro gaming gear. PS1, N64, SNES — if it's got cartridges, I've probably got it. 🎮",
    location: "Newtown, NSW",
    joined: "Mar 2022",
    rating: 4.8,
    avatar_initial: "R",
  },
  StreetwearArchive: {
    username: "StreetwearArchive",
    bio: "Curating archive streetwear, 90s sportswear & Y2K fashion from Sydney. Deadstock and vintage only. 👟",
    location: "Surry Hills, NSW",
    joined: "Jun 2023",
    rating: 4.7,
    avatar_initial: "S",
  },
  FilmCameraClub: {
    username: "FilmCameraClub",
    bio: "Analog photography enthusiast. Selling and trading 35mm + medium format cameras, lenses & darkroom gear. 📸",
    location: "Glebe, NSW",
    joined: "Sep 2021",
    rating: 5.0,
    avatar_initial: "F",
  },
  RetroGamesStore: {
    username: "RetroGamesStore",
    bio: "Brisbane's largest private retro game collection. Tested, cleaned, and ready to play. No fakes, no repros. 🕹️",
    location: "Newstead, QLD",
    joined: "Feb 2022",
    rating: 4.8,
    avatar_initial: "G",
  },
};

// ── DEMO LISTINGS — 30 items across 5 categories ────────────────
// Vintage & Collectibles (12 items)
const DEMO_VINTAGE = [
  { id:"v1",  title:"Vintage Polaroid OneStep Camera",         price:85,  category:"Vintage & Collectibles", sub:"Polaroid Cameras",    condition:"Good",     location:"Fitzroy, VIC",        seller_username:"VintageHunter",    rating:4.9, time:"1h ago",  image_urls:["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"], is_saved:false, tags:["Vintage","Collector"],          description:"Original Polaroid OneStep in great working condition. Tested with fresh 600 film — colours are vibrant. Minor cosmetic wear on the body, nothing affecting function. Comes with original strap." },
  { id:"v2",  title:"Retro PlayStation 1 + 2 Controllers",     price:120, category:"Vintage & Collectibles", sub:"Retro Games",          condition:"Good",     location:"Newtown, NSW",        seller_username:"RetroCollector",   rating:4.8, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80"], is_saved:false, tags:["Retro","90s","Collector"],      description:"OG PlayStation 1 (SCPH-7002) with 2 original Sony controllers. Fully tested, plays CDs perfectly. Controllers have zero stick drift. No memory card but easy to grab one cheap." },
  { id:"v3",  title:"90s Nike Windbreaker Jacket – Size M",    price:60,  category:"Vintage & Collectibles", sub:"Vintage Clothing",     condition:"Used",     location:"Surry Hills, NSW",    seller_username:"StreetwearArchive",rating:4.7, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80"], is_saved:false, tags:["90s","Y2K","Vintage"],          description:"Authentic 90s Nike windbreaker in classic navy/white/red colourway. Size M, fits true to size. Light pilling on cuffs consistent with age. Rare colourway you won't find anymore." },
  { id:"v4",  title:"Lord of the Rings Extended DVD Box Set",  price:25,  category:"Vintage & Collectibles", sub:"DVD / Blu-ray",        condition:"Like New", location:"Fremantle, WA",      seller_username:"VintageHunter",    rating:4.9, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&q=80"], is_saved:false, tags:["Collector","Limited Edition"],  description:"Complete LOTR Extended Edition 4-film box set. All discs play perfectly, no scratches. Bonus appendix discs included. The definitive version — theatrical cuts can't compete." },
  { id:"v5",  title:"Vinyl Record – Pink Floyd The Wall",      price:40,  category:"Vintage & Collectibles", sub:"Vinyl Records",        condition:"Good",     location:"Paddington, NSW",     seller_username:"VintageHunter",    rating:4.9, time:"4h ago",  image_urls:["https://images.unsplash.com/photo-1542208998-f6dbbb5b2e6f?w=600&q=80"], is_saved:false, tags:["Vintage","Collector"],          description:"Original double-LP pressing of The Wall. Plays beautifully with minimal surface noise. Sleeve has expected shelf wear. A must-have for any serious vinyl collection." },
  { id:"v6",  title:"Sony Walkman TPS-L2 Cassette Player",    price:95,  category:"Vintage & Collectibles", sub:"Cassette Tapes",       condition:"For Parts", location:"Collingwood, VIC",   seller_username:"VintageHunter",    rating:4.9, time:"6h ago",  image_urls:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"], is_saved:false, tags:["Retro","Vintage","80s"],        description:"Original Sony Walkman TPS-L2 — the one that started it all. Sold for restoration/display. Belt needs replacing (common issue). Cosmetically excellent, original headphones included." },
  { id:"v7",  title:"Film Camera – Canon AE-1 Program",       price:140, category:"Vintage & Collectibles", sub:"Film Cameras",         condition:"Like New",  location:"Glebe, NSW",         seller_username:"FilmCameraClub",   rating:5.0, time:"8h ago",  image_urls:["https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&q=80"], is_saved:false, tags:["Vintage","Collector"],          description:"Canon AE-1 Program in near-mint condition. Shutter fires crisply at all speeds. Light seals fresh. Comes with Canon FD 50mm f/1.8 lens — deadly sharp. Shot one roll to confirm everything works." },
  { id:"v8",  title:"Y2K Diesel Cargo Pants – Size 32",       price:75,  category:"Vintage & Collectibles", sub:"Vintage Clothing",     condition:"Good",     location:"Fitzroy, VIC",        seller_username:"StreetwearArchive",rating:4.7, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80"], is_saved:false, tags:["Y2K","Vintage"],               description:"Authentic Diesel cargo pants from 2001-ish. Wide leg, multi-pocket, the real Y2K energy. Size 32 waist, 30 inseam. Some fading on knees adding to the vibe. Waistband logo intact." },
  { id:"v9",  title:"Nintendo Game Boy Color – Teal",          price:90,  category:"Vintage & Collectibles", sub:"Retro Games",          condition:"Good",     location:"Newtown, NSW",        seller_username:"RetroCollector",   rating:4.8, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&q=80"], is_saved:false, tags:["Retro","90s","Collector"],      description:"Original teal Game Boy Color in great condition. Screen is clear with no scratches. Sound works on all channels. Comes with Pokémon Yellow — saves are working. Batteries not included." },
  { id:"v10", title:"Vintage Adidas Track Jacket – Size L",   price:70,  category:"Vintage & Collectibles", sub:"Vintage Clothing",     condition:"Good",     location:"Surry Hills, NSW",    seller_username:"StreetwearArchive",rating:4.7, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"], is_saved:false, tags:["Retro","Vintage","90s"],        description:"Three-stripe Adidas track jacket from the late 90s in navy/gold. Trefoil logo, not the modern badge. Size L, roomy fit. Zip is smooth, no holes in lining. Perfect layering piece." },
  { id:"v11", title:"Retro Game Cartridge – Zelda: OoT",      price:45,  category:"Vintage & Collectibles", sub:"Retro Games",          condition:"Good",     location:"Newstead, QLD",       seller_username:"RetroGamesStore",  rating:4.8, time:"4h ago",  image_urls:["https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"], is_saved:false, tags:["Retro","90s","Collector"],      description:"Authentic Zelda: Ocarina of Time N64 cartridge (gold label). Save battery still holds — 3 file slots working. Contacts cleaned, tested on my own N64. Label is in great shape, 9/10." },
  { id:"v12", title:"Skateboard Deck – Santa Cruz Reissue",   price:50,  category:"Vintage & Collectibles", sub:"Collectible Toys",     condition:"Like New", location:"Bondi, NSW",          seller_username:"StreetwearArchive",rating:4.7, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=600&q=80"], is_saved:false, tags:["Retro","Collector"],            description:"Santa Cruz Screaming Hand reissue deck. Never mounted — it would be a crime to skate this. 8.5\" width. Graphics are perfect. Deck-only, trucks not included. For the collector." },
];

// Fashion (6 items)
// Electronics (5 items)
// Home (4 items)
// Sports (3 items)
const DEMO_LISTINGS = [
  // ── Fashion ──────────────────────────────────────────────────
  { id:"f1",  title:"Air Jordan 4 Retro – White Cement",       price:260, category:"Fashion",               sub:"Shoes",               condition:"Good",     location:"Surry Hills, NSW",    seller_username:"StreetwearArchive",rating:4.8, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"], is_saved:false, tags:["Sneakers","Retro","Good","Streetwear"],                              description:"Air Jordan 4 White Cement in a solid 8/10 condition. Some yellowing on the sole which is expected for the age. No creasing on the toe box — stored properly. US10, fits true." },
  { id:"f2",  title:"Nike Dunk Low Panda – Size 10",            price:220, category:"Fashion",               sub:"Shoes",               condition:"Like New", location:"Fortitude Valley, QLD", seller_username:"StreetwearArchive",rating:5.0, time:"4h ago",  image_urls:["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80"], is_saved:false, tags:["Sneakers","Like New","Streetwear"],                              description:"Nike Dunk Low Panda worn twice. Absolutely no creasing, lightly tried on. Comes with original box and both lace sets. Size US10. Selling because I prefer the Black Panda colourway." },
  { id:"f3",  title:"Levi's 501 Original Jeans – W32 L30",     price:65,  category:"Fashion",               sub:"Clothing",            condition:"Good",     location:"Richmond, VIC",       seller_username:"StreetwearArchive",rating:4.7, time:"6h ago",  image_urls:["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80"], is_saved:false, tags:["Fashion","Vintage","Good"],                              description:"Classic Levi's 501s in the original fit. W32 L30. Naturally worn knees and fading — looks incredible, not damaged. Iconic red tab intact. Washed cold and hung, never tumble dried." },
  { id:"f4",  title:"Supreme Box Logo Hoodie – Navy, Size L",   price:310, category:"Fashion",               sub:"Hoodies",             condition:"Good",     location:"Paddington, NSW",     seller_username:"StreetwearArchive",rating:4.7, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80"], is_saved:false, tags:["Fashion","Streetwear","Collector","Good"],                              description:"FW19 Supreme Box Logo Hooded Sweatshirt in Navy. Size Large. Worn maybe 4x, washed once on delicate. Logo is crisp, no cracking. 100% authentic — happy to verify in person." },
  { id:"f5",  title:"Vintage Carhartt WIP Detroit Jacket – M",  price:130, category:"Fashion",               sub:"Jackets",             condition:"Used",     location:"Brunswick, VIC",      seller_username:"StreetwearArchive",rating:4.7, time:"7h ago",  image_urls:["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"], is_saved:false, tags:["Fashion","Vintage","Streetwear","Used"],                              description:"90s era Carhartt WIP Detroit Jacket in dark brown. Waxed canvas has beautiful patina. All pockets zip/button correctly. Minor wear on cuffs. Size M, slightly boxy. A genuine workhorse." },
  { id:"f6",  title:"New Balance 550 – Grey/White, Size 9.5",   price:150, category:"Fashion",               sub:"Shoes",               condition:"Like New", location:"Newtown, NSW",        seller_username:"StreetwearArchive",rating:4.7, time:"9h ago",  image_urls:["https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80"], is_saved:false, tags:["Sneakers","Like New","Minimal"],                              description:"NB 550 in the grey/white colourway. Worn twice to try sizing — I'm a 9 so these are too big. No creases, soles are clean. Size US9.5. OG box included. Timeless silhouette." },
  // ── Electronics ──────────────────────────────────────────────
  { id:"e1",  title:"Sony Alpha A6400 Camera Body",             price:750, category:"Electronics",           sub:"Cameras",             condition:"Like New", location:"Newstead, QLD",       seller_username:"FilmCameraClub",   rating:5.0, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"], is_saved:false, tags:["Camera","Electronics","Like New"],                              description:"Sony A6400 body, shutter count under 3000 — essentially new. Comes with original battery, charger, strap, and box. Switching to full-frame so this needs a new home. Flawless sensor." },
  { id:"e2",  title:"AirPods Pro 2nd Gen – Like New",           price:195, category:"Electronics",           sub:"Audio",               condition:"Like New", location:"Manly, NSW",          seller_username:"RetroCollector",   rating:4.8, time:"6h ago",  image_urls:["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80"], is_saved:true,  tags:["Electronics","Like New"],                              description:"AirPods Pro Gen 2 purchased 6 months ago. Used lightly — primarily at the gym. All ear tips included, case is unscratched. Battery health still showing 100% in Settings." },
  { id:"e3",  title:"iPad Air 5th Gen – 256GB, Space Grey",     price:550, category:"Electronics",           sub:"Tablets",             condition:"Good",     location:"South Yarra, VIC",    seller_username:"RetroCollector",   rating:4.8, time:"2d ago",  image_urls:["https://images.unsplash.com/photo-1544244015-0df4592ab731?w=600&q=80"], is_saved:false, tags:["Electronics","Good"],                              description:"iPad Air 5 in Space Grey, 256GB WiFi. 87% battery health. No cracks or chips on screen — using a case since day one. Comes with Apple USB-C cable but no charger brick." },
  { id:"e4",  title:"Dyson V11 Cordless Vacuum",                price:280, category:"Electronics",           sub:"Appliances",          condition:"Good",     location:"Camberwell, VIC",     seller_username:"VintageHunter",    rating:4.9, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80"], is_saved:false, tags:["Electronics","Good"],                              description:"Dyson V11 Animal in good working order. 45-55 min runtime on eco mode. Comes with all attachments and docking station. One small crack on the bin (non-structural). Cleaned thoroughly." },
  { id:"e5",  title:"Nintendo Switch OLED – White",             price:320, category:"Electronics",           sub:"Gaming Consoles",     condition:"Like New", location:"Newstead, QLD",       seller_username:"RetroGamesStore",  rating:4.8, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80"], is_saved:false, tags:["Gaming","Electronics","Like New"],                              description:"Switch OLED in white, used for 4 months. Screen is perfect — no dead pixels or burn-in. Dock, HDMI, Joy-Cons and USB-C charger all included. No Joy-Con drift. Comes with carrying case." },
  // ── Home ─────────────────────────────────────────────────────
  { id:"h1",  title:"IKEA KALLAX Shelving Unit – White 4x2",   price:85,  category:"Home",                  sub:"Furniture",           condition:"Good",     location:"Fitzroy, VIC",        seller_username:"VintageHunter",    rating:4.9, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"], is_saved:true,  tags:["Furniture","Good","Minimal"],                              description:"IKEA Kallax 8-cube unit in white. Perfect for vinyl, books, or general storage. Minor scuff on the bottom-right cube (barely visible). Disassembled for easy transport, all hardware included." },
  { id:"h2",  title:"Smeg Retro Kettle – Cream",                price:65,  category:"Home",                  sub:"Kitchen",             condition:"Like New", location:"Collingwood, VIC",    seller_username:"VintageHunter",    rating:4.9, time:"8h ago",  image_urls:["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"], is_saved:false, tags:["Retro","Like New","Collector"],                              description:"Smeg KLF03 retro kettle in cream. Used about 15 times before moving to a different kitchen aesthetic. Heating element is pristine. Comes with original box and instructions." },
  { id:"h3",  title:"Vintage Turkish Kilim Rug – 150x240cm",    price:190, category:"Home",                  sub:"Rugs & Decor",        condition:"Good",     location:"Brunswick, VIC",      seller_username:"VintageHunter",    rating:4.9, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80"], is_saved:false, tags:["Vintage","Furniture","Handmade","Good"],                     description:"Hand-woven Turkish kilim rug in a warm red/orange/navy palette. 150x240cm — ideal for living rooms. Some natural wear along the edges consistent with age. Professionally cleaned 6 months ago." },
  { id:"h4",  title:"Nespresso Vertuo Next + Milk Frother",    price:110, category:"Home",                  sub:"Kitchen",             condition:"Like New", location:"Surry Hills, NSW",    seller_username:"RetroCollector",   rating:4.8, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"], is_saved:false, tags:["Like New","Minimal"],                              description:"Nespresso Vertuo Next machine with the Aeroccino3 milk frother. Both work perfectly. Descaled 2 months ago. Comes with welcome capsule kit (still sealed). Reason for selling: upgrading to a proper espresso machine." },
  // ── Sports ───────────────────────────────────────────────────
  { id:"s1",  title:"Trek Marlin 5 Mountain Bike – Medium",    price:580, category:"Sports",                sub:"Bikes",               condition:"Used",     location:"Fremantle, WA",       seller_username:"RetroCollector",   rating:4.8, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"], is_saved:false, tags:["Used","Imported"],                              description:"2021 Trek Marlin 5 in medium frame. 21-speed, hydraulic disc brakes. New tyres fitted 3 months ago. Some trail scratches on the down tube but nothing structural. Rides brilliantly on any surface." },
  { id:"s2",  title:"Rogue Echo Bike – Commercial Grade",      price:650, category:"Sports",                sub:"Gym Equipment",       condition:"Good",     location:"South Melbourne, VIC", seller_username:"VintageHunter",    rating:4.9, time:"12h ago", image_urls:["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"], is_saved:false, tags:["Good","Rare"],                              description:"Rogue Echo Bike — built like a tank. Used daily for 18 months, belt is in excellent condition. Console working correctly. Selling because I'm moving interstate and it won't fit in the van." },
  { id:"s3",  title:"Surfboard – Firewire Seaside 5'7\"",      price:480, category:"Sports",                sub:"Surf & Watersports",  condition:"Good",     location:"Manly, NSW",          seller_username:"RetroCollector",   rating:4.8, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80"], is_saved:false, tags:["Good","Custom"],                              description:"Firewire Seaside 5'7\" in Thunderbolt construction. Ideal for small-to-medium surf. Two small dings repaired with solar resin — fully watertight. Comes with Futures fin set (3 fins) and leash." },
];

const DEMO_CONVOS = [
  { id:"c1", other_user:"Sarah", other_avatar:"https://i.pravatar.cc/80?img=47", listing_title:"Air Jordan 4", last_message:"Sure, 6pm works!", last_time:"2m", unread:0, online:true,
    messages:[{id:1,from_me:false,content:"Hi! Is this still available?",created_at:"2:30 PM"},{id:2,from_me:true,content:"Yes, it is!",created_at:"2:31 PM"},{id:3,from_me:false,content:"Can I pick up tonight?",created_at:"2:32 PM"},{id:4,from_me:true,content:"Sure, 6pm works!",created_at:"2:33 PM"}]},
  { id:"c2", other_user:"Jake M.", other_avatar:"https://i.pravatar.cc/80?img=12", listing_title:"Sony Camera", last_message:"Is the lens included?", last_time:"15m", unread:2, online:true,
    messages:[{id:1,from_me:false,content:"Is the lens included?",created_at:"1:20 PM"}]},
];

// ═══════════════════════════════════════════════════════
//  DATABASE HELPERS
// ═══════════════════════════════════════════════════════

async function dbGetListings(userId) {
  if (!supabase) return [...DEMO_VINTAGE, ...DEMO_LISTINGS];
  // Build select: include saved_items filtered to current user if logged in
  const savedSelect = userId
    ? `*, profiles(username, avatar_url), saved_items!left(id, user_id)`
    : `*, profiles(username, avatar_url)`;
  const { data, error } = await supabase
    .from("listings")
    .select(savedSelect)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) { console.error("getListings:", error); return [...DEMO_VINTAGE, ...DEMO_LISTINGS]; }
  return (data || []).map(l => ({
    ...l,
    seller_username: l.profiles?.username || "user",
    seller_avatar:   l.profiles?.avatar_url,
    is_saved: userId
      ? (l.saved_items || []).some(s => s.user_id === userId)
      : false,
    image_urls: l.image_urls || [],
    tags: l.tags || [],
    time: timeSince(l.created_at),
  }));
}

async function dbCreateListing(listing, userId) {
  if (!supabase) { console.warn("No Supabase — demo mode"); return null; }
  const { data, error } = await supabase
    .from("listings")
    .insert({ ...listing, seller_id: userId, status: "active" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbToggleSave(listingId, userId, isSaved) {
  if (!supabase) return;
  if (isSaved) {
    await supabase.from("saved_items").delete()
      .match({ listing_id: listingId, user_id: userId });
  } else {
    await supabase.from("saved_items").insert({ listing_id: listingId, user_id: userId });
  }
}

async function dbGetConversations(userId) {
  if (!supabase) return DEMO_CONVOS;
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      buyer_profile:profiles!conversations_buyer_id_fkey(username, avatar_url),
      seller_profile:profiles!conversations_seller_id_fkey(username, avatar_url),
      listing:listing_id(title),
      messages(content, created_at, sender_id)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (error) {
    // Fallback: simpler query without nested joins if FK alias fails
    console.error("getConversations:", error);
    const { data: simple } = await supabase
      .from("conversations")
      .select("*, listing:listing_id(title), messages(content, created_at, sender_id)")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("updated_at", { ascending: false });
    if (!simple) return DEMO_CONVOS;
    return (simple || []).map(c => {
      const isBuyer = c.buyer_id === userId;
      const lastMsg = (c.messages || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
      return { ...c, other_user: isBuyer ? "Seller" : "Buyer", other_avatar: null,
        listing_title: c.listing?.title || "Item",
        last_message: lastMsg?.content || "", last_time: lastMsg ? timeSince(lastMsg.created_at) : "",
        unread: 0, online: false };
    });
  }
  return (data || []).map(c => {
    const isBuyer = c.buyer_id === userId;
    const otherProfile = isBuyer ? c.seller_profile : c.buyer_profile;
    const lastMsg = (c.messages || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      ...c,
      other_user: otherProfile?.username || (isBuyer ? "Seller" : "Buyer"),
      other_avatar: otherProfile?.avatar_url || null,
      listing_title: c.listing?.title || "Item",
      last_message: lastMsg?.content || "",
      last_time: lastMsg ? timeSince(lastMsg.created_at) : "",
      unread: 0,
      online: false,
    };
  });
}

async function dbGetMessages(conversationId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) { console.error("getMessages:", error); return []; }
  return data || [];
}

async function dbSendMessage(conversationId, senderId, content) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  return data;
}

async function dbGetOrCreateConversation(listingId, buyerId, sellerId) {
  if (!supabase) return null;
  // Check existing — use maybeSingle() so no error is thrown when no row exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
  if (existing) return existing;
  // Create new
  const { data, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbGetProfile(userId) {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

async function dbUpsertProfile(userId, updates) {
  if (!supabase) return;
  await supabase.from("profiles").upsert({ id: userId, ...updates });
}

async function dbUploadImage(file, userId) {
  if (!supabase) return null;
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("listing-images").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
  return publicUrl;
}

async function dbGetUserListings(userId) {
  if (!supabase) return [];
  const { data } = await supabase.from("listings").select("*")
    .eq("seller_id", userId)
    .in("status", ["active","sold"])
    .order("created_at", { ascending: false });
  return data || [];
}

async function dbMarkAsSold(listingId) {
  if (!supabase) return;
  const { error } = await supabase.from("listings")
    .update({ status: "sold", updated_at: new Date().toISOString() })
    .eq("id", listingId);
  if (error) throw error;
}

async function dbDeleteListing(listingId) {
  if (!supabase) return;
  const { error } = await supabase.from("listings")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", listingId);
  if (error) throw error;
}

async function dbGetSavedListings(userId) {
  if (!supabase) return DEMO_LISTINGS.filter(l => l.is_saved);
  const { data } = await supabase
    .from("saved_items")
    .select("listings(*, profiles(username, avatar_url))")
    .eq("user_id", userId);
  return (data || [])
    .map(s => s.listings)
    .filter(Boolean)
    .map(l => ({
      ...l,
      seller_username: l.profiles?.username || "user",
      seller_avatar:   l.profiles?.avatar_url,
      tags: l.tags || [],
      is_saved: true,
      time: timeSince(l.created_at),
    }));
}

// Stub — real impl calls Supabase Edge Function "loopgen-ai-desc"
async function dbAiDescription(title, category, condition) {
  if (!supabase) return null;
  const { data, error } = await supabase.functions.invoke("loopgen-ai-desc", {
    body: { title, category, condition }
  });
  if (error) throw error;
  return data?.description || null;
}

// P3 — Save offer (Supabase if available, else local state fallback handled in caller)
async function dbSaveOffer({ listing_id, buyer_id, seller_id, price }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("offers")
    .insert({ listing_id, buyer_id, seller_id, price: parseFloat(price), created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) {
    // Table may not exist yet — fail silently, local state handles it
    console.warn("dbSaveOffer:", error.message);
    return null;
  }
  return data;
}

// P4 — Save report (Supabase if available, else local state fallback handled in caller)
async function dbSaveReport({ listing_id, user_id, reason }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reports")
    .insert({ listing_id, user_id, reason, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) {
    console.warn("dbSaveReport:", error.message);
    return null;
  }
  return data;
}

function timeSince(dateStr) {
  if (!dateStr) return "";
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
}

// ═══════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════
const IcoSearch  = ({c="#374151"}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7.5" stroke={c} strokeWidth="2" fill="none"/><path d="M11 7.5a3.5 3.5 0 0 0-3.5 3.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/><path d="M17.5 17.5L21 21" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></svg>;
const IcoUser    = ({c="#374151"}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7.5" r="3.5" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.12"/><path d="M4.5 20.5c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>;
const IcoBack    = ({light}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={light?"rgba(255,255,255,0.15)":"#f3f4f6"}/><path d="M14 8l-4 4 4 4" stroke={light?"white":"#111"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoSend    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.25"/></svg>;
const IcoCamera  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const IcoHome    = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="nhg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs>{a?<><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" fill="url(#nhg)" fillOpacity="0.18"/><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="url(#nhg)" strokeWidth="2" strokeLinejoin="round"/><rect x="9" y="13" width="6" height="10" rx="1.5" fill="url(#nhg)" fillOpacity="0.4" stroke="url(#nhg)" strokeWidth="1.5"/></>:<><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="#c4c9d4" strokeWidth="2" strokeLinejoin="round"/><rect x="9" y="13" width="6" height="10" rx="1.5" stroke="#c4c9d4" strokeWidth="1.5"/></>}</svg>;
const IcoExplore = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="neg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs><circle cx="11" cy="11" r="8" stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="2" fill={a?"url(#neg)":""} fillOpacity={a?"0.12":"0"}/><path d="M11 7a1 1 0 00-1 1" stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/><path d="M7.5 14.5l3-5 5-3-3 5-5 3z" fill={a?"url(#neg)":"#c4c9d4"} stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="1" strokeLinejoin="round"/><path d="M17.5 17.5L21 21" stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="2.2" strokeLinecap="round"/></svg>;
const IcoChats   = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="ncg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs><path d="M21 14.5a2 2 0 01-2 2H7.5l-4 4V5a2 2 0 012-2h13a2 2 0 012 2v9.5z" fill={a?"url(#ncg)":"none"} fillOpacity={a?"0.15":"0"} stroke={a?"url(#ncg)":"#c4c9d4"} strokeWidth="2" strokeLinejoin="round"/>{a&&<><line x1="8" y1="9" x2="16" y2="9" stroke="url(#ncg)" strokeWidth="1.6" strokeLinecap="round"/><line x1="8" y1="12.5" x2="13" y2="12.5" stroke="url(#ncg)" strokeWidth="1.6" strokeLinecap="round"/></>}</svg>;
const IcoProfile = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="npg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs><circle cx="12" cy="8" r="3.5" stroke={a?"url(#npg)":"#c4c9d4"} strokeWidth="2" fill={a?"url(#npg)":""} fillOpacity={a?"0.18":"0"}/><path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={a?"url(#npg)":"#c4c9d4"} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>;

// ═══════════════════════════════════════════════════════
//  CATEGORY ICONS
// ═══════════════════════════════════════════════════════
const CatFashionIcon     = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><path d="M14 18L8 26h8v14h24V26h8l-6-8" fill="#ec4899" fillOpacity="0.18" stroke="#ec4899" strokeWidth="2" strokeLinejoin="round"/><path d="M20 14c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" fill="none"/><path d="M20 14L14 18M36 14l6 4" stroke="#f472b6" strokeWidth="2.2" strokeLinecap="round"/></svg>;
const CatElectronicsIcon = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><rect x="12" y="18" width="32" height="14" rx="2.5" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="2"/><rect x="15" y="21" width="26" height="8" rx="1.5" fill="#60a5fa" opacity="0.5"/><rect x="10" y="32" width="36" height="3" rx="1.5" fill="#3b82f6" opacity="0.3"/><circle cx="28" cy="35" r="1.5" fill="#3b82f6"/></svg>;
const CatHomeIcon        = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><path d="M10 26L28 12l18 14" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><rect x="16" y="26" width="24" height="16" rx="1" fill="#fbbf24" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2"/><rect x="24" y="32" width="8" height="10" rx="1.5" fill="#fbbf24" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="1.5"/></svg>;
const CatSportsIcon      = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><circle cx="28" cy="28" r="14" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2.2"/><path d="M28 22l4 3-1.5 4.5h-5L24 25z" fill="#34d399" stroke="#10b981" strokeWidth="1" fillOpacity="0.8"/><circle cx="22" cy="22" r="3" fill="white" opacity="0.25"/></svg>;
const CatVehiclesIcon    = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><path d="M12 28h32l-4-10H16z" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round"/><rect x="10" y="28" width="36" height="9" rx="2" fill="#8b5cf6" fillOpacity="0.15" stroke="#8b5cf6" strokeWidth="2"/><circle cx="19" cy="38" r="4" stroke="#8b5cf6" strokeWidth="2" fill="none"/><circle cx="37" cy="38" r="4" stroke="#8b5cf6" strokeWidth="2" fill="none"/></svg>;
const CatAllIcon         = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><rect x="12" y="12" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.25" stroke={GREEN} strokeWidth="2"/><rect x="30" y="12" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.15" stroke={GREEN} strokeWidth="2"/><rect x="12" y="30" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.15" stroke={GREEN} strokeWidth="2"/><rect x="30" y="30" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.25" stroke={GREEN} strokeWidth="2"/></svg>;

const CatVintageIcon = () => (
  <svg viewBox="0 0 56 56" fill="none" width="34" height="34">
    {/* Vinyl record */}
    <circle cx="28" cy="28" r="16" fill="#7c3aed" fillOpacity="0.18" stroke="#7c3aed" strokeWidth="2"/>
    <circle cx="28" cy="28" r="10" fill="#a78bfa" fillOpacity="0.25" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="28" cy="28" r="4" fill="#7c3aed" fillOpacity="0.7" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="28" cy="28" r="1.5" fill="white"/>
    {/* Cassette spool hint */}
    <path d="M22 14 Q24 11 28 11 Q32 11 34 14" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const CAT_ICONS = { All: CatAllIcon, Fashion: CatFashionIcon, Electronics: CatElectronicsIcon, Home: CatHomeIcon, Sports: CatSportsIcon, Vehicles: CatVehiclesIcon, "Vintage & Collectibles": CatVintageIcon };

// ═══════════════════════════════════════════════════════
//  LAYOUT PRIMITIVES
// ═══════════════════════════════════════════════════════
function Phone({ children }) {
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:"#dde1e7",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center",padding:20}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px;}
        input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif;}
        body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
        button{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
        input,textarea{touch-action:auto;-webkit-user-select:text;user-select:text;}
        input:focus,textarea:focus,select:focus{outline:none;border-color:#1c7c45 !important;box-shadow:0 0 0 3px rgba(28,124,69,0.12);}
        @keyframes loopgen-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes loopgen-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .lg-screen-enter{animation:loopgen-fadein 0.2s ease forwards;}
      `}</style>
      <div style={{width:390,height:844,background:"white",borderRadius:52,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",boxShadow:"0 60px 140px rgba(0,0,0,0.32),0 0 0 10px #1c1c1e,0 0 0 13px #3a3a3a"}}>
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px 6px",fontSize:12,fontWeight:700,color:"#111",flexShrink:0}}>
      <span>9:41</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#111"><rect x="0" y="6" width="2.5" height="5" rx="1"/><rect x="3.5" y="4" width="2.5" height="7" rx="1"/><rect x="7" y="2" width="2.5" height="9" rx="1"/><rect x="10.5" y="0" width="2.5" height="11" rx="1"/></svg>
        <svg width="24" height="12" viewBox="0 0 24 12"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="#111" strokeWidth="1.2" fill="none"/><rect x="2" y="2" width="13" height="8" rx="1.5" fill="#111"/><path d="M22 4v4a2 2 0 000-4z" fill="#111"/></svg>
      </div>
    </div>
  );
}

function BottomNav({ active, onNav }) {
  const tabs = [
    {id:"home",    label:"Home",     icon: a => <IcoHome a={a}/>},
    {id:"explore", label:"Search",   icon: a => <IcoExplore a={a}/>},
    {id:"sell",    label:"Sell",     icon: null},
    {id:"chats",   label:"Messages", icon: a => <IcoChats a={a}/>},
    {id:"profile", label:"Profile",  icon: a => <IcoProfile a={a}/>},
  ];
  return (
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f0f1f3",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 4px 24px",zIndex:20,boxShadow:"0 -4px 24px rgba(0,0,0,0.07)"}}>
      {tabs.map(t => (
        <div key={t.id} onClick={() => onNav(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",minWidth:52,position:"relative"}}>
          {t.id==="sell"
            ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,marginTop:-4}}>
                <div style={{width:58,height:58,borderRadius:18,background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-20,boxShadow:`0 8px 24px rgba(28,124,69,0.38)`,border:"3px solid white"}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:GREEN,letterSpacing:0.1}}>Sell</span>
              </div>
            : <><div style={{width:44,height:34,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,background:active===t.id?"rgba(28,124,69,0.09)":"transparent",transition:"background 0.2s"}}>{t.icon(active===t.id)}</div><span style={{fontSize:10,fontWeight:active===t.id?700:500,color:active===t.id?GREEN:"#b0b7c3",letterSpacing:0.1}}>{t.label}</span></>
          }
        </div>
      ))}
    </div>
  );
}

function GreenBtn({ children, onClick, mt=16, disabled=false, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{width:"100%",marginTop:mt,padding:"16px",borderRadius:18,background:disabled?"#d1fae5":GREEN,border:"none",color:"white",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",boxShadow:disabled?"none":`0 6px 22px ${GREEN}44`,letterSpacing:0.2,...style}}>
      {children}
    </button>
  );
}

function FInp({ placeholder, value="", onChange=()=>{}, type="text", readOnly=false }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} readOnly={readOnly}
    style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px",fontSize:14,outline:"none",marginBottom:12,color:"#374151",background:readOnly?"#f9fafb":"white"}}/>;
}

function FSel({ ph, value, onChange, opts }) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px",fontSize:14,outline:"none",marginBottom:12,color:value?"#374151":"#9ca3af",background:"white",appearance:"none"}}>
    {opts.map(o => <option key={o} value={o} style={{color:"#374151"}}>{o||ph}</option>)}
  </select>;
}

// ═══════════════════════════════════════════════════════
//  TOAST COMPONENT
// ═══════════════════════════════════════════════════════
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{position:"absolute",bottom:100,left:20,right:20,background:"#111",color:"white",padding:"12px 18px",borderRadius:16,fontSize:13,fontWeight:600,textAlign:"center",zIndex:100,boxShadow:"0 8px 28px rgba(0,0,0,0.28)",animation:"fadeIn 0.2s ease"}}>
      {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  CONFIRM MODAL
// ═══════════════════════════════════════════════════════
function ConfirmModal({ confirm, onCancel }) {
  if (!confirm) return null;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,borderRadius:52}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",width:"100%",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:15,fontWeight:600,color:"#111",marginBottom:20,textAlign:"center",lineHeight:1.5}}>{confirm.msg}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,fontSize:14,cursor:"pointer",color:"#374151"}}>Cancel</button>
          <button onClick={confirm.onConfirm} style={{flex:1,padding:"14px",borderRadius:14,border:"none",background:"#ef4444",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── P1: Offer Modal ───────────────────────────────────────────────────────────
function OfferModal({ modal, offerPrice, setOfferPrice, onSubmit, onClose }) {
  if (!modal) return null;
  const item = modal.item;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,borderRadius:52}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",width:"100%",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111",marginBottom:4}}>Make an Offer</div>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:20}}>
          Listed at <strong style={{color:"#111"}}>${item.price}</strong> · {item.title}
        </div>
        <div style={{display:"flex",alignItems:"center",background:"#f9fafb",borderRadius:14,border:"1.5px solid #e5e7eb",padding:"12px 16px",marginBottom:16,gap:8}}>
          <span style={{fontSize:18,fontWeight:700,color:"#111"}}>$</span>
          <input
            type="number"
            placeholder="Your offer amount"
            value={offerPrice}
            onChange={e => setOfferPrice(e.target.value)}
            style={{flex:1,border:"none",background:"transparent",fontSize:18,fontWeight:700,color:"#111",outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}
            autoFocus
          />
        </div>
        <div style={{fontSize:11,color:"#9ca3af",marginBottom:20,lineHeight:1.5}}>
          Your offer will be sent to the seller. They can accept, decline, or counter.
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,fontSize:14,cursor:"pointer",color:"#374151"}}>
            Cancel
          </button>
          <button
            disabled={!offerPrice || isNaN(parseFloat(offerPrice)) || parseFloat(offerPrice) <= 0}
            onClick={onSubmit}
            style={{flex:2,padding:"14px",borderRadius:14,border:"none",
              background:GREEN,color:"white",fontWeight:700,fontSize:14,
              cursor: (offerPrice && parseFloat(offerPrice) > 0) ? "pointer" : "default",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              opacity: offerPrice && parseFloat(offerPrice) > 0 ? 1 : 0.45}}>
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── P1: Report Modal ──────────────────────────────────────────────────────────
function ReportModal({ modal, onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  if (!modal) return null;
  const reasons = ["Misleading description","Wrong category","Suspected fake item","Prohibited item","Spam / duplicate","Other"];
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,borderRadius:52}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",width:"100%",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111",marginBottom:4}}>Report Listing</div>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:16}}>What's the issue with this listing?</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {reasons.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{padding:"11px 14px",borderRadius:12,textAlign:"left",cursor:"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:600,
                border:`1.5px solid ${reason===r ? GREEN : "#e5e7eb"}`,
                background: reason===r ? "#f0fdf4" : "white",
                color: reason===r ? GREEN : "#374151"}}>
              {r}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,fontSize:14,cursor:"pointer",color:"#374151"}}>
            Cancel
          </button>
          <button onClick={() => { if (!reason) return; onSubmit(reason); }}
            style={{flex:2,padding:"14px",borderRadius:14,border:"none",
              background:"#ef4444",color:"white",fontWeight:700,fontSize:14,
              cursor: reason ? "pointer" : "default",fontFamily:"'Plus Jakarta Sans',sans-serif",
              opacity: reason ? 1 : 0.45}}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Tag colour palette
// ── Tag Taxonomy ──────────────────────────────────────────────────────────────
// All predefined tags grouped by type. System tags not exposed in UI.
const TAG_TAXONOMY = {
  style:     ["Vintage","Retro","Antique","Collector","Rare","Limited Edition"],
  type:      ["Camera","Vinyl","Sneakers","Furniture","Watch","Gaming","Electronics","Fashion"],
  condition: ["New","Like New","Good","Used","Needs Repair"],
  era:       ["90s","Y2K","80s","Minimal","Streetwear","Analog","Film","Handmade","Imported","Custom"],
  // system: ["Trending","Hot","New Listing","Price Drop"] — not exposed in UI
};
const ALL_USER_TAGS = [
  ...TAG_TAXONOMY.style,
  ...TAG_TAXONOMY.type,
  ...TAG_TAXONOMY.condition,
  ...TAG_TAXONOMY.era,
];
const MAX_TAGS = 5;

// ── Auto-tag assist — deterministic, no AI ────────────────────────────────────
function autoTagAssist(title = "", category = "", condition = "") {
  const t = title.toLowerCase();
  const cat = category.toLowerCase();
  const suggested = new Set();

  // Type detection from title
  if (/polaroid|canon ae|olympus|pentax|film|35mm|slr|rangefinder|leica/.test(t)) {
    suggested.add("Camera"); suggested.add("Film");
  }
  if (/vinyl|lp\b|record|album|pressing/.test(t)) suggested.add("Vinyl");
  if (/nike|jordan|adidas|new balance|converse|vans|reebok|puma|sneaker|trainer|dunk/.test(t)) suggested.add("Sneakers");
  if (/watch|rolex|seiko|omega|casio|citizen/.test(t)) suggested.add("Watch");
  if (/game|gameboy|playstation|nintendo|xbox|sega|atari|cartridge/.test(t)) suggested.add("Gaming");
  if (/sofa|couch|chair|table|desk|shelf|wardrobe|furniture/.test(t)) suggested.add("Furniture");

  // Style/era detection from title
  if (/vintage|antique|retro|classic/.test(t)) suggested.add("Vintage");
  if (/retro/.test(t)) suggested.add("Retro");
  if (/90s|nineties/.test(t)) suggested.add("90s");
  if (/y2k|2000s/.test(t)) suggested.add("Y2K");
  if (/80s|eighties/.test(t)) suggested.add("80s");
  if (/streetwear|supreme|palace|bape|off.white/.test(t)) suggested.add("Streetwear");
  if (/collector|rare|limited edition|limited ed/.test(t)) suggested.add("Collector");
  if (/rare\b/.test(t)) suggested.add("Rare");
  if (/limited/.test(t)) suggested.add("Limited Edition");
  if (/handmade|hand made|hand-made/.test(t)) suggested.add("Handmade");
  if (/imported|import/.test(t)) suggested.add("Imported");
  if (/custom|bespoke/.test(t)) suggested.add("Custom");
  if (/minimal|minimalist/.test(t)) suggested.add("Minimal");
  if (/analog|analogue/.test(t)) suggested.add("Analog");

  // Category → type tag
  if (cat.includes("vintage")) { suggested.add("Vintage"); }
  if (cat.includes("fashion")) suggested.add("Fashion");
  if (cat.includes("electronics")) suggested.add("Electronics");
  if (cat.includes("sports")) suggested.add("Gaming"); // keep for gaming items in sports

  // Condition → condition tag
  const condMap = {
    "New": "New", "Like New": "Like New", "Good": "Good",
    "Used": "Used", "For Parts": "Needs Repair",
  };
  if (condMap[condition]) suggested.add(condMap[condition]);

  return [...suggested].slice(0, MAX_TAGS);
}

const TAG_COLORS = {
  // Style / Collector
  "Vintage":         { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  "Retro":           { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
  "Antique":         { bg:"#fef3c7", text:"#92400e", border:"#fde68a" },
  "Collector":       { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Rare":            { bg:"#fff1f2", text:"#9f1239", border:"#fecdd3" },
  "Limited Edition": { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  // Type
  "Camera":          { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Vinyl":           { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  "Sneakers":        { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
  "Furniture":       { bg:"#f9fafb", text:"#374151", border:"#d1d5db" },
  "Watch":           { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Gaming":          { bg:"#eef2ff", text:"#3730a3", border:"#c7d2fe" },
  "Electronics":     { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Fashion":         { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  // Condition
  "New":             { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Like New":        { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Good":            { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Used":            { bg:"#f9fafb", text:"#374151", border:"#d1d5db" },
  "Needs Repair":    { bg:"#fef2f2", text:"#991b1b", border:"#fecaca" },
  // Era / Context
  "90s":             { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  "Y2K":             { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "80s":             { bg:"#fff1f2", text:"#9f1239", border:"#fecdd3" },
  "Minimal":         { bg:"#f9fafb", text:"#374151", border:"#d1d5db" },
  "Streetwear":      { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  "Analog":          { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Film":            { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Handmade":        { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  "Imported":        { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Custom":          { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  // Legacy / category display
  "For Parts":       { bg:"#fef2f2", text:"#991b1b", border:"#fecaca" },
  "Cameras":         { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Kitchen":         { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  "Sports":          { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Books":           { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
};

function VintageTag({ label }) {
  const c = TAG_COLORS[label] || { bg:"#f3f4f6", text:"#374151", border:"#e5e7eb" };
  return (
    <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",
      borderRadius:50,fontSize:11,fontWeight:700,letterSpacing:0.1,
      background:c.bg,color:c.text,border:`1.5px solid ${c.border}`,flexShrink:0}}>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════
//  LISTING CARD
// ═══════════════════════════════════════════════════════
function ListingCard({ item, onTap, onSave, compact=false }) {
  const img = item.image_urls?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";
  const isVintage = item.category === "Vintage & Collectibles";

  if (compact) {
    return (
      <div onClick={() => onTap(item)} style={{background:"white",borderRadius:22,overflow:"hidden",
        boxShadow:"0 4px 18px rgba(0,0,0,0.10)",cursor:"pointer",flexShrink:0,width:168}}>
        <div style={{position:"relative"}}>
          <img src={img} alt={item.title} style={{width:"100%",height:160,objectFit:"cover"}}
            onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
          {/* Save */}
          <div onClick={e => onSave(item.id, e)} style={{position:"absolute",top:10,right:10,
            width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.92)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
            cursor:"pointer",backdropFilter:"blur(6px)",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
            {item.is_saved ? "❤️" : "🤍"}
          </div>
          {/* Category badge */}
          {isVintage && (
            <div style={{position:"absolute",bottom:10,left:10,
              background:"rgba(109,40,217,0.88)",color:"white",
              fontSize:10,fontWeight:800,padding:"4px 10px",
              borderRadius:50,backdropFilter:"blur(6px)",letterSpacing:"0.04em"}}>
              ✦ VINTAGE
            </div>
          )}
        </div>
        <div style={{padding:"11px 12px 13px"}}>
          <div style={{fontWeight:900,fontSize:17,color:"#111",letterSpacing:"-0.3px"}}>${item.price}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",marginTop:3,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:3,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {item.location}</div>
          {item.tags?.length > 0 && (
            <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
              {item.tags.slice(0,2).map(t => <VintageTag key={t} label={t}/>)}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div onClick={() => onTap(item)} style={{background:"white",borderRadius:22,overflow:"hidden",
      boxShadow:"0 3px 14px rgba(0,0,0,0.08)",cursor:"pointer",display:"flex",
      flexDirection:"row",alignItems:"stretch",width:"100%",gap:0}}>
      <div style={{position:"relative",flexShrink:0,width:120,minWidth:120,height:115}}>
        <img src={img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
        {item.condition==="New"&&<div style={{position:"absolute",top:7,left:7,background:GREEN,color:"white",fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:8}}>NEW</div>}
        {isVintage&&<div style={{position:"absolute",bottom:7,left:7,background:"rgba(109,40,217,0.88)",color:"white",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:50,backdropFilter:"blur(4px)"}}>✦ VINTAGE</div>}
      </div>
      <div style={{padding:"13px 14px",flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{fontWeight:900,fontSize:18,color:"#111",letterSpacing:"-0.3px"}}>${item.price}</div>
            <div onClick={e => onSave(item.id, e)} style={{fontSize:18,cursor:"pointer",flexShrink:0}}>{item.is_saved?"❤️":"🤍"}</div>
          </div>
          <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{item.condition} · {item.category}</div>
          {item.tags?.length > 0 && (
            <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
              {item.tags.slice(0,3).map(t => <VintageTag key={t} label={t}/>)}
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <div style={{fontSize:11,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>📍 {item.location}</div>
          <div style={{fontSize:10,color:"#bbb",flexShrink:0,marginLeft:4}}>🕐 {item.time}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SKELETON CARD — shown while listings are loading
// ═══════════════════════════════════════════════════════
function SkeletonCard({ compact=false }) {
  const shine = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "loopgen-shimmer 1.4s ease-in-out infinite",
  };
  if (compact) {
    return (
      <div style={{background:"white",borderRadius:22,overflow:"hidden",flexShrink:0,width:162,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
        <div style={{...shine,height:148}}/>
        <div style={{padding:"10px 11px 14px",display:"flex",flexDirection:"column",gap:7}}>
          <div style={{...shine,height:14,borderRadius:6,width:"50%"}}/>
          <div style={{...shine,height:12,borderRadius:6,width:"80%"}}/>
          <div style={{...shine,height:10,borderRadius:6,width:"60%"}}/>
        </div>
      </div>
    );
  }
  return (
    <div style={{background:"white",borderRadius:22,overflow:"hidden",boxShadow:"0 3px 14px rgba(0,0,0,0.06)",display:"flex",flexDirection:"row",alignItems:"stretch",width:"100%",gap:0}}>
      <div style={{...shine,flexShrink:0,width:120,minWidth:120,height:115}}/>
      <div style={{padding:"13px 14px",flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{...shine,height:16,borderRadius:6,width:"35%"}}/>
        <div style={{...shine,height:13,borderRadius:6,width:"75%"}}/>
        <div style={{...shine,height:11,borderRadius:6,width:"55%"}}/>
        <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between"}}>
          <div style={{...shine,height:10,borderRadius:6,width:"40%"}}/>
          <div style={{...shine,height:10,borderRadius:6,width:"20%"}}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  DEMO MODE BANNER
// ═══════════════════════════════════════════════════════
function DemoBanner() {
  if (HAS_SUPABASE) return null;
  return (
    <div style={{background:`linear-gradient(90deg,#0d5c33,#1c7c45)`,padding:"7px 16px",fontSize:11,fontWeight:700,color:"white",textAlign:"center",flexShrink:0,letterSpacing:0.2,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      <span>✨</span>
      <span>LoopGen Beta — Exploring demo mode · Real listings coming soon</span>
    </div>
  );
}

// ── Horizontal scrolling category ticker (home screen) ───────────────────────
function HomeTicker() {
  const words = [
    "Cameras","Vinyl","Sneakers","Gaming","Fashion",
    "Kitchen","Furniture","Tech","Books","Jewellery",
    "Collectibles","Sports","Tools","Vintage","Toys",
  ];
  const doubled = [...words, ...words];
  return (
    <div style={{
      overflow:"hidden",
      borderTop:"1px solid #e9e3db",
      borderBottom:"1px solid #e9e3db",
      background:"#ffffff",
      padding:"9px 0",
      flexShrink:0,
    }}>
      <style>{`
        @keyframes home-ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>
      <div style={{
        display:"flex",
        width:"max-content",
        animation:"home-ticker 24s linear infinite",
      }}>
        {doubled.map((w, i) => (
          <span key={i} style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"0 16px", fontSize:10, fontWeight:600,
            color:"#908880", textTransform:"uppercase", letterSpacing:"0.10em",
            whiteSpace:"nowrap",
          }}>
            <span style={{
              width:4, height:4, borderRadius:"50%",
              background:"#21a054", display:"inline-block", flexShrink:0,
            }} />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ERROR MESSAGE MAPPING
// ═══════════════════════════════════════════════════════

function mapAuthError(error, mode) {
  if (!error) return "Something went wrong. Please try again.";

  const msg = (error.message || "").toLowerCase();
  const code = error.code || error.status || "";

  // ── Email / user already exists ───────────────────────
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered") ||
    msg.includes("already registered") ||
    msg.includes("email already") ||
    msg.includes("duplicate") ||
    code === "23505" ||
    code === "user_already_exists"
  ) {
    return "This email is already registered. Tap 'Sign In' below to log in instead.";
  }

  // ── Email not confirmed ───────────────────────────────
  if (msg.includes("email not confirmed") || msg.includes("confirm your email")) {
    return "Please check your inbox and confirm your email before signing in.";
  }

  // ── Wrong password / invalid credentials ──────────────
  if (
    msg.includes("invalid login") ||
    msg.includes("invalid credentials") ||
    msg.includes("wrong password") ||
    msg.includes("invalid password") ||
    msg.includes("email or password") ||
    code === "invalid_credentials"
  ) {
    return "Incorrect email or password. Please check and try again.";
  }

  // ── Weak password ─────────────────────────────────────
  if (msg.includes("password") && (msg.includes("short") || msg.includes("least 6") || msg.includes("weak"))) {
    return "Your password must be at least 6 characters long.";
  }

  // ── Invalid email format ──────────────────────────────
  if (msg.includes("invalid email") || msg.includes("valid email") || msg.includes("email format")) {
    return "Please enter a valid email address.";
  }

  // ── Too many attempts / rate limited ──────────────────
  if (
    msg.includes("too many") ||
    msg.includes("rate limit") ||
    msg.includes("email rate limit") ||
    msg.includes("try again later") ||
    msg.includes("for security purposes") ||
    code === "over_request_rate_limit" ||
    code === "email_rate_limit_exceeded" ||
    code === 429
  ) {
    return "You've made too many attempts. Please wait a few minutes and try again.";
  }

  // ── Network / connection error ────────────────────────
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout") ||
    msg.includes("connection") ||
    msg.includes("failed to fetch")
  ) {
    return "Connection problem. Please check your internet and try again.";
  }

  // ── Database / profile save error ────────────────────
  if (
    msg.includes("database") ||
    msg.includes("saving") ||
    msg.includes("profiles") ||
    msg.includes("violates") ||
    msg.includes("foreign key") ||
    code === "42501" ||
    code === "42P01"
  ) {
    if (mode === "register") {
      return "We had trouble setting up your account. Please try again — it usually works on the second attempt.";
    }
    return "Something went wrong on our end. Please try again.";
  }

  // ── User not found ────────────────────────────────────
  if (msg.includes("user not found") || msg.includes("no user")) {
    return "No account found with this email. Try registering instead.";
  }

  // ── Generic fallback ──────────────────────────────────
  if (mode === "register") {
    return "We couldn't create your account right now. Please try again.";
  }
  return "Sign in failed. Please check your details and try again.";
}

function mapListingError(error) {
  if (!error) return "Something went wrong. Please try again.";
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout")) {
    return "Connection problem. Check your internet and try again.";
  }
  if (msg.includes("storage") || msg.includes("upload")) {
    return "Photo upload failed. Try a smaller image or check your connection.";
  }
  if (msg.includes("row-level") || msg.includes("permission") || msg.includes("policy")) {
    return "You need to be signed in to post a listing.";
  }
  return "Couldn't post your listing. Please try again.";
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
export default function LoopGenApp() {
  // ── Core state ──────────────────────────────────────
  const [screen,    setScreen]  = useState("splash");
  const [history,   setHistory] = useState([]);
  const [user,      setUser]    = useState(null);   // Supabase user object
  const [profile,   setProfile] = useState(null);   // profiles row
  const [authMode,  setAuthMode]= useState("login"); // "login" | "register"
  const [authForm,  setAuthForm]= useState({email:"",password:"",username:""});
  const [authError, setAuthError]= useState("");
  const [authLoading,setAuthLoading]= useState(false);
  const [sessionReady, setSessionReady] = useState(!HAS_SUPABASE);

  // ── Data state ───────────────────────────────────────
  const [listings,  setListings]= useState([...DEMO_VINTAGE, ...DEMO_LISTINGS]);
  const [convos,    setConvos]  = useState(HAS_SUPABASE ? [] : DEMO_CONVOS);
  const [detail,    setDetail]  = useState(null);
  const [convo,     setConvo]   = useState(null);
  const [chatMsgs,  setChatMsgs]= useState([]);
  const [userListings, setUserListings]= useState([]);
  const [savedListings,setSavedListings]=useState([]);

  // ── Sell state ───────────────────────────────────────
  const [sellStep,  setSellStep]= useState(1);
  const [sell,      setSell]    = useState({title:"",price:"",category:"",sub:"",condition:"",desc:"",location:"",image_urls:[],tags:[]});
  const [sellImages,setSellImages]=useState([]);
  const [uploadingImg,setUploadingImg]=useState(false);

  // ── UI state ─────────────────────────────────────────
  const [search,    setSearch]  = useState("");
  const [catFilter, setCatF]    = useState("All");
  const [msgText,   setMsgText] = useState("");
  const [aiLoading, setAiLoading]=useState(false);
  const [loading,   setLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [toast,     setToast]   = useState(null);
  const [confirm,   setConfirm] = useState(null); // { msg, onConfirm }
  // P1 — Offer modal
  const [offerModal, setOfferModal] = useState(null); // { item } | null
  const [offerPrice, setOfferPrice] = useState("");
  const [offerSent,  setOfferSent]  = useState({}); // { [listingId]: price }
  // P1 — Report listing
  const [reportModal, setReportModal] = useState(null); // { item } | null
  // P5 — Terms agreement for register
  const [agreeTerms, setAgreeTerms] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const listingsLoaded = useRef(false);

  // ── T2: Auto-merge tags when title/category/condition change ────────────────
  useEffect(() => {
    if (!sell.category) return;
    const suggested = autoTagAssist(sell.title, sell.category, sell.condition);
    if (!suggested.length) return;
    setSell(f => {
      const cur = f.tags || [];
      const toAdd = suggested.filter(t => !cur.includes(t));
      if (!toAdd.length) return f; // nothing new — no re-render
      const merged = [...cur, ...toAdd].slice(0, MAX_TAGS);
      return { ...f, tags: merged };
    });
  }, [sell.title, sell.category, sell.condition]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setSessionReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null); setProfile(null);
      }
      setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data on screen change ────────────────────────
  useEffect(() => {
    if (screen === "home" || screen === "explore") {
      loadListings();
    }
    if (screen === "chats") {
      if (user) {
        setConvos([]); // Clear any demo/stale data first
        loadConversations();
      } else {
        setConvos([]); // Guest sees empty chat list, not demo data
      }
    }
    if ((screen === "profile" || screen === "my-listings" || screen === "saved-items") && user) {
      loadProfileData();
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a real user logs in/out, force-refresh listings with their saved state
  useEffect(() => {
    if (!HAS_SUPABASE) return; // demo mode never needs this
    listingsLoaded.current = false;
    if (screen === "home" || screen === "explore") {
      loadListings({ force: true });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime messages ────────────────────────────────
  useEffect(() => {
    if (!supabase || !convo?.id || String(convo.id).startsWith("mock_")) return;
    realtimeSub.current = supabase
      .channel(`messages:${convo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convo.id}` },
        payload => {
          const msg = payload.new;
          setChatMsgs(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, { ...msg, from_me: msg.sender_id === user?.id }];
          });
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .subscribe();
    return () => { realtimeSub.current?.unsubscribe(); };
  }, [convo, user]);

  // ── Data loaders ─────────────────────────────────────
  async function loadListings({ force = false } = {}) {
    // ── Demo mode: data is synchronous, never show skeletons ──────────────
    if (!HAS_SUPABASE) {
      const data = [...DEMO_VINTAGE, ...DEMO_LISTINGS];
      setListings(data);
      listingsLoaded.current = true;
      return; // no loading state touched — listings already in state from init
    }
    // ── Supabase mode: only fetch once per session unless forced ──────────
    if (listingsLoaded.current && !force) return;
    setListingsLoading(true);
    try {
      const data = await dbGetListings(user?.id);
      const hasVintage = data.some(l => l.category === "Vintage & Collectibles");
      setListings(hasVintage ? data : [...DEMO_VINTAGE, ...data]);
      listingsLoaded.current = true;
    } catch (err) {
      console.error("loadListings:", err);
      // Keep showing demo data on error — do not blank the feed
    } finally {
      setListingsLoading(false);
    }
  }

  async function loadProfile(uid) {
    const p = await dbGetProfile(uid);
    if (p) setProfile(p);
    else {
      // Auto-create profile on first login
      const email = supabase ? (await supabase.auth.getUser()).data.user?.email : "";
      const username = email?.split("@")[0] || "user";
      await dbUpsertProfile(uid, { username, avatar_url: null });
      setProfile({ id: uid, username });
    }
  }

  async function loadConversations(uid) {
    const id = uid || user?.id;
    if (!id) return;
    const data = await dbGetConversations(id);
    setConvos(data);
  }

  async function loadProfileData() {
    if (!user) return;
    const [ul, sl] = await Promise.all([
      dbGetUserListings(user.id),
      dbGetSavedListings(user.id),
    ]);
    setUserListings(ul);
    setSavedListings(sl);
  }

  // ── Navigation ───────────────────────────────────────
  const push = s => { setHistory(h => [...h, screen]); setScreen(s); };
  const pop  = () => { const h=[...history]; const prev=h.pop()||"home"; setHistory(h); setScreen(prev); };
  const nav  = s => {
    if (s === "sell" && !sessionReady) { showToast("Loading…"); return; }
    if (s === "sell" && !user) { showToast("Sign in to sell items"); push("auth"); return; }
    if (s === "sell") { setSellStep(1); setSell({title:"",price:"",category:"",sub:"",condition:"",desc:"",location:"",image_urls:[],tags:[]}); setSellImages([]); }
    setHistory([]); setScreen(s); setDetail(null); setConvo(null);
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  // ── Auth ─────────────────────────────────────────────
  async function handleAuth() {
    if (!supabase) { showToast("Connect Supabase to enable auth"); nav("home"); return; }
    // P2: enforce terms acceptance server-side, not just via disabled button
    if (authMode === "register" && !agreeTerms) {
      setAuthError("You must agree to the Terms of Service and Privacy Policy to register.");
      return;
    }
    setAuthLoading(true); setAuthError("");
    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({ email: authForm.email, password: authForm.password });
        if (error) throw error;
        if (data.user && data.session) {
          // Email confirmation OFF — user is fully signed in immediately
          await dbUpsertProfile(data.user.id, { username: authForm.username || authForm.email.split("@")[0] });
          setUser(data.user);
          showToast("🎉 Account created! Welcome to LoopGen.");
          nav("home");
        } else if (data.user && !data.session) {
          // Email confirmation ON — user created but needs to verify email
          setAuthError("✅ Account created! Check your email to confirm before signing in.");
        } else {
          setAuthError("Something went wrong. Please try again.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
        if (error) throw error;
        setUser(data.user);
        await loadProfile(data.user.id);
        showToast("👋 Welcome back!");
        nav("home");
        // Pre-load conversations so chats tab is ready immediately
        loadConversations(data.user.id);
      }
    } catch (e) {
      setAuthError(mapAuthError(e, authMode));
    }
    setAuthLoading(false);
  }

  async function handleSignOut() {
    try { if (supabase) await supabase.auth.signOut(); } catch { /* ignore network errors */ }
    setUser(null); setProfile(null);
    nav("splash");
    showToast("Signed out");
  }

  // ── Listings ─────────────────────────────────────────
  const toggleSave = async (id, e) => {
    e?.stopPropagation();
    const item = listings.find(x => x.id === id);
    if (!item) return;
    // Optimistic update — listings list + detail screen
    setListings(ls => ls.map(x => x.id===id ? {...x, is_saved:!x.is_saved} : x));
    if (detail?.id === id) setDetail(d => d ? {...d, is_saved:!d.is_saved} : d);
    showToast(item.is_saved ? "Removed from saved" : "❤️ Saved!");
    if (user) await dbToggleSave(id, user.id, item.is_saved);
  };

  const handleMarkSold = (listingId) => {
    setConfirm({
      msg: "Mark this item as sold?",
      onConfirm: async () => {
        try {
          await dbMarkAsSold(listingId);
          setUserListings(ls => ls.map(l => l.id===listingId ? {...l, status:"sold"} : l));
          showToast("✅ Marked as sold!");
        } catch { showToast("Couldn't mark as sold. Please try again."); }
        setConfirm(null);
      }
    });
  };

  const handleDeleteListing = (listingId) => {
    setConfirm({
      msg: "Remove this listing? This can't be undone.",
      onConfirm: async () => {
        try {
          await dbDeleteListing(listingId);
          setUserListings(ls => ls.filter(l => l.id !== listingId));
          setListings(ls => ls.filter(l => l.id !== listingId));
          showToast("Listing removed.");
        } catch { showToast("Couldn't remove listing. Please try again."); }
        setConfirm(null);
      }
    });
  };

  const openDetail = item => { setDetail(item); push("detail"); };

  // ── Sell / Photo upload ───────────────────────────────
  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!user) { showToast("Sign in to upload photos"); return; }
    // Validate file sizes (max 10MB each)
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length) { showToast(`${oversized.length} photo(s) exceed 10MB limit`); return; }
    setUploadingImg(true);
    try {
      const urls = await Promise.all(files.slice(0,5).map(f => dbUploadImage(f, user.id)));
      const valid = urls.filter(Boolean);
      setSellImages(prev => [...prev, ...valid].slice(0, 5));
      setSell(f => ({...f, image_urls:[...f.image_urls, ...valid].slice(0, 5)}));
      showToast(`📸 ${valid.length} photo(s) uploaded`);
    } catch (e) {
      showToast(mapListingError(e));
    }
    setUploadingImg(false);
  }

  async function handleList() {
    if (!sell.title || !sell.price || !sell.category || !sell.condition) {
      showToast("Please fill all required fields"); return;
    }
    setLoading(true);
    try {
      const listing = {
        title: sell.title,
        price: parseFloat(sell.price),
        category: sell.category,
        sub: sell.sub,
        condition: sell.condition,
        description: sell.desc,
        location: sell.location || "Australia",
        image_urls: sell.image_urls,
        tags: sell.tags || [],
        seller_id: user?.id,
      };
      if (user && supabase) {
        await dbCreateListing(listing, user.id);
        showToast("🎉 Listed! Your item is live.");
        listingsLoaded.current = false;
        await loadListings({ force: true });
      } else {
        // Demo mode — add locally
        const newItem = { ...listing, id: `local_${Date.now()}`, seller_username: "you", time: "Just now", is_saved: false };
        setListings(ls => [newItem, ...ls]);
        showToast("🎉 Listed! (Demo mode)");
      }
      setSellStep(1);
      setSell({title:"",price:"",category:"",sub:"",condition:"",desc:"",location:"",image_urls:[],tags:[]});
      setSellImages([]);
      nav("home");
    } catch (e) {
      showToast(mapListingError(e));
    }
    setLoading(false);
  }

  // ── AI description ─────────────────────────────────────
  const aiGen = async () => {
    if (!sell.title) { showToast("Add a title first!"); return; }
    if (!supabase) { showToast("AI requires Supabase Edge Function"); return; }
    setAiLoading(true);
    try {
      const desc = await dbAiDescription(sell.title, sell.category, sell.condition);
      if (desc) { setSell(f=>({...f, desc})); showToast("✨ AI description ready!"); }
      else showToast("AI unavailable");
    } catch { showToast("AI unavailable"); }
    setAiLoading(false);
  };

  // ── Chat ──────────────────────────────────────────────
  const openConvo = async (c) => {
    setConvo(c);
    // UUID ids are strings — check truthy and not a mock id
    const isRealConvo = supabase && user && c.id && !String(c.id).startsWith("mock_");
    if (isRealConvo) {
      const msgs = await dbGetMessages(c.id);
      setChatMsgs(msgs.map(m => ({...m, from_me: m.sender_id === user.id})));
    } else {
      setChatMsgs(c.messages || []);
    }
    push("chat");
  };

  const openSellerChat = async (item) => {
    if (!sessionReady) { showToast("Loading…"); return; }
    if (!user) { showToast("Sign in to message seller"); push("auth"); return; }
    if (item.seller_id === user.id) { showToast("That's your own listing!"); return; }
    showToast("💬 Opening chat…");

    // Build a contextual mock convo — always available regardless of backend
    const mockConvo = {
      id: `mock_${item.id}`,
      other_user: item.seller_username || "Seller",
      other_avatar: null,
      listing_title: item.title || "Item",
      last_message: "",
      last_time: "now",
      unread: 0,
      online: false,
      messages: [],
    };

    try {
      if (supabase && item.seller_id) {
        const conv = await dbGetOrCreateConversation(item.id, user.id, item.seller_id);
        if (conv) {
          const enriched = {
            ...conv,
            other_user: item.seller_username || "Seller",
            other_avatar: item.seller_avatar || null,
            listing_title: item.title || "Item",
            last_message: "",
            last_time: "now",
            unread: 0,
            online: false,
          };
          // Add to convos list if not already there
          setConvos(cs => cs.find(c => c.id === conv.id) ? cs : [enriched, ...cs]);
          openConvo(enriched);
          return;
        }
      }
      // No Supabase or no seller_id — open contextual mock chat (never a dead button)
      openConvo(mockConvo);
    } catch {
      // Backend failure — still open contextual mock chat, no crash
      openConvo(mockConvo);
    }
  };

  const sendMsg = async () => {
    if (!msgText.trim()) return;
    const text = msgText;
    setMsgText("");
    const time = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const optimistic = {id:`opt_${Date.now()}`, from_me:true, content:text, created_at:time};
    setChatMsgs(m => [...m, optimistic]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior:"smooth"}), 50);
    if (supabase && user && convo?.id && !String(convo.id).startsWith("mock_")) {
      try { await dbSendMessage(convo.id, user.id, text); }
      catch { showToast("Message didn't send. Please try again."); }
    }
  };

  // ── Derived data ──────────────────────────────────────
  const filtered = listings.filter(l => {
    const ms = l.title?.toLowerCase().includes(search.toLowerCase()) || l.category?.toLowerCase().includes(search.toLowerCase()) || l.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return ms && (catFilter==="All" || l.category===catFilter);
  });

  const CATS = ["All","Vintage & Collectibles","Fashion","Electronics","Home","Sports","Vehicles"];
  const currentUser = user ? (profile?.username || user.email?.split("@")[0] || "You") : "Guest";
  const isGuest = !user;

  // ════════════════════════════
  //  SPLASH  (LandingPage component)
  // ════════════════════════════
  if (screen === "splash") return (
    <Phone>
      <LandingPage
        onBrowse={() => nav("home")}
        onSell={() => nav("sell")}
        onSignIn={() => { setAuthMode("login"); push("auth"); }}
        onRegister={() => { setAuthMode("register"); push("auth"); }}
        demoMode={!HAS_SUPABASE}
      />
    </Phone>
  );

  //  AUTH
  // ════════════════════════════
  if (screen === "auth") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 28px 40px",display:"flex",flexDirection:"column"}}>
        <div onClick={pop} style={{cursor:"pointer",marginBottom:24}}><IcoBack/></div>
        <LoopGenLogo height={36} style={{marginBottom:20}} />
        <div style={{fontSize:26,fontWeight:900,color:"#111",marginBottom:4}}>{authMode==="login"?"Welcome back 👋":"Join LoopGen 🌱"}</div>
        <div style={{marginBottom:6,fontSize:13,fontWeight:800,color:GREEN}}>Buy and sell with ease.</div>
        <div style={{fontSize:14,color:"#6b7280",marginBottom:28}}>{authMode==="login"?"Sign in to your account":"Create your free account"}</div>

        {!HAS_SUPABASE && (
          <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",marginBottom:20,fontSize:12,color:"#166534",fontWeight:600,border:"1px solid #bbf7d0"}}>
            🌱 This is a demo build — accounts aren't live yet. Use "Explore the Demo →" on the previous screen to browse listings.
          </div>
        )}

        {authMode==="register" && <FInp placeholder="Username" value={authForm.username} onChange={v=>setAuthForm(f=>({...f,username:v}))}/>}
        <FInp placeholder="Email" type="email" value={authForm.email} onChange={v=>setAuthForm(f=>({...f,email:v}))}/>
        <FInp placeholder="Password" type="password" value={authForm.password} onChange={v=>setAuthForm(f=>({...f,password:v}))}/>

        {authMode==="register" && (
          <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:16,cursor:"pointer"}}>
            <input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)}
              style={{width:16,height:16,marginTop:2,accentColor:GREEN,flexShrink:0,cursor:"pointer"}}/>
            <span style={{fontSize:12,color:"#6b7280",lineHeight:1.55}}>
              I agree to the{" "}
              <a href="/terms" style={{color:GREEN,fontWeight:700,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" style={{color:GREEN,fontWeight:700,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>Privacy Policy</a>
            </span>
          </label>
        )}

        {authError && (
          <div style={{
            display:"flex", alignItems:"flex-start", gap:10,
            background: authError.startsWith("✅") ? "#f0fdf4" : "#fff8f8",
            border: `1.5px solid ${authError.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`,
            borderRadius:12, padding:"12px 14px", marginBottom:14,
          }}>
            <span style={{fontSize:16,flexShrink:0,marginTop:1}}>
              {authError.startsWith("✅") ? "✅" : "⚠️"}
            </span>
            <span style={{
              fontSize:13, lineHeight:1.5,
              color: authError.startsWith("✅") ? "#166534" : "#b91c1c",
              fontWeight:500,
            }}>
              {authError.replace(/^✅\s*/, "")}
            </span>
          </div>
        )}

        <GreenBtn onClick={handleAuth} disabled={authLoading || (authMode==="register" && !agreeTerms)} mt={8}>
          {authLoading ? "Loading…" : authMode==="login" ? "Sign In" : "Create Account"}
        </GreenBtn>

        <div style={{textAlign:"center",marginTop:20,fontSize:13,color:"#6b7280"}}>
          {authMode==="login" ? "No account? " : "Have an account? "}
          <span onClick={() => { setAuthMode(authMode==="login"?"register":"login"); setAuthError(""); setAgreeTerms(false); }}
            style={{color:GREEN,fontWeight:700,cursor:"pointer"}}>
            {authMode==="login" ? "Register" : "Sign In"}
          </span>
        </div>
      </div>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  HOME
  // ════════════════════════════
  if (screen === "home") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:84}}>

        {/* ── TOP NAV BAR ── */}
        <div style={{padding:"8px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f5f5f5"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <LoopGenLogo height={28} />
          </div>
          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>nav("explore")} style={{width:36,height:36,borderRadius:12,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IcoSearch c="#374151"/></div>
            <div onClick={()=>nav("profile")} style={{width:36,height:36,borderRadius:12,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IcoUser c="#374151"/></div>
          </div>
        </div>

        {/* ── HERO SECTION ── */}
        <div style={{background:`linear-gradient(145deg,#0d5c33 0%,${GREEN} 55%,#22c55e 100%)`,padding:"26px 20px 28px",position:"relative",overflow:"hidden"}}>
          {/* Decorative circles */}
          <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
          <div style={{position:"absolute",bottom:-20,right:20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
          <div style={{position:"absolute",top:20,right:-10,width:60,height:60,borderRadius:"50%",background:"rgba(34,197,94,0.25)"}}/>

          <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:600,letterSpacing:0.3,marginBottom:6}}>
            Hey {isGuest?"there":currentUser} 👋
          </div>
          <h1 style={{color:"white",fontSize:24,fontWeight:900,lineHeight:1.2,marginBottom:6,letterSpacing:-0.5}}>
            Discover unique items<br/>around you
          </h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:500,marginBottom:20,lineHeight:1.5}}>
            Buy and sell in a smarter circular marketplace.
          </p>

          {/* Hero search bar */}
          <div onClick={()=>nav("explore")} style={{background:"white",borderRadius:14,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
            <IcoSearch c="#9ca3af"/>
            <span style={{color:"#9ca3af",fontSize:14,flex:1}}>Search vintage, tech, fashion…</span>
          </div>

          {/* Hero CTAs */}
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={()=>nav("explore")} style={{flex:1,padding:"12px",borderRadius:12,border:"2px solid rgba(255,255,255,0.7)",background:"transparent",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Browse Items
            </button>
            <button onClick={()=>nav("sell")} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:"white",color:GREEN,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
              + Sell an Item
            </button>
          </div>
        </div>

        <HomeTicker />

        {/* ── CATEGORIES GRID ── */}
        <div style={{padding:"20px 16px 4px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:16,fontWeight:900,color:"#111",letterSpacing:"-0.3px"}}>Browse by Category</span>
            <span onClick={()=>nav("explore")} style={{fontSize:12,color:GREEN,fontWeight:700,cursor:"pointer"}}>See all ›</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[
              { cat:"Vintage & Collectibles", label:"Vintage",
                bg:"linear-gradient(160deg,#1a0040 0%,#4c1d95 100%)",
                glow:"#a78bfa", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=90",
                imgPos:"center" },
              { cat:"Electronics", label:"Tech",
                bg:"linear-gradient(160deg,#001433 0%,#1e3a8a 100%)",
                glow:"#60a5fa", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=90",
                imgPos:"center 40%" },
              { cat:"Fashion", label:"Fashion",
                bg:"linear-gradient(160deg,#3b0019 0%,#be123c 100%)",
                glow:"#fb7185", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=90",
                imgPos:"center top" },
              { cat:"Home", label:"Home",
                bg:"linear-gradient(160deg,#1a0e00 0%,#b45309 100%)",
                glow:"#fbbf24", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=90",
                imgPos:"center" },
              { cat:"Sports", label:"Sports",
                bg:"linear-gradient(160deg,#001a10 0%,#065f46 100%)",
                glow:"#34d399", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&q=90",
                imgPos:"center" },
              { cat:"All", label:"All Items",
                bg:"linear-gradient(160deg,#0a1a2a 0%,#1e3a5f 100%)",
                glow:"#93c5fd", tintOpacity:0.35,
                img:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=90",
                imgPos:"center" },
            ].map(({cat,label,bg,glow,img,imgPos,tintOpacity})=>(
              <div key={cat} onClick={()=>{setCatF(cat);nav("explore");}}
                style={{
                  borderRadius:22,
                  overflow:"hidden",
                  cursor:"pointer",
                  position:"relative",
                  aspectRatio:"1/1.15",
                  boxShadow:"0 6px 22px rgba(0,0,0,0.28)",
                  border:"1px solid rgba(255,255,255,0.06)",
                }}>
                {/* Full-bleed photo */}
                <img src={img} alt={label}
                  style={{position:"absolute",inset:0,width:"100%",height:"100%",
                    objectFit:"cover",objectPosition:imgPos||"center",display:"block"}}
                  onError={e=>{e.target.style.display="none"}}/>
                {/* Glass colour tint — per-tile opacity */}
                <div style={{position:"absolute",inset:0,background:bg,opacity:tintOpacity||0.50}}/>
                {/* Bottom gradient for label */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",
                  background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 100%)"}}/>
                {/* Label */}
                <div style={{position:"absolute",bottom:11,left:0,right:0,
                  textAlign:"center",zIndex:3}}>
                  <span style={{fontSize:14,fontWeight:900,color:"white",
                    letterSpacing:"0.02em",
                    textShadow:"0 2px 6px rgba(0,0,0,0.5)"}}>
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* ── TRENDING VINTAGE ── */}
        {(() => {
          const vintageItems = listings.filter(l => l.category === "Vintage & Collectibles").slice(0, 8);
          if (!vintageItems.length) return null;
          return (
            <div style={{marginTop:22,marginBottom:4}}>
              <div style={{padding:"0 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:15,fontWeight:800,color:"#111"}}>🔥 Trending near you</span>
                </div>
                <span onClick={()=>{setCatF("Vintage & Collectibles");nav("explore");}} style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>See all ›</span>
              </div>
              {/* Category banner */}
              <div style={{margin:"0 16px 12px",borderRadius:18,background:"linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#a855f7 100%)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,overflow:"hidden",position:"relative"}}>
                <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
                <div style={{fontSize:28}}>🎵</div>
                <div>
                  <div style={{color:"white",fontWeight:800,fontSize:13,letterSpacing:0.2}}>Vintage & Collectibles</div>
                  <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,marginTop:1}}>Vinyl · Cameras · Retro games · Y2K fashion</div>
                </div>
              </div>
              <div style={{display:"flex",gap:12,overflowX:"auto",paddingLeft:16,paddingRight:16,paddingBottom:6,scrollbarWidth:"none"}}>
                {listingsLoading
                  ? Array.from({length:4}).map((_,i) => <SkeletonCard key={i} compact/>)
                  : vintageItems.map(item => (
                      <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave} compact/>
                    ))
                }
              </div>
            </div>
          );
        })()}

        {/* ── NEW LISTINGS ── */}
        <div style={{padding:"20px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:15,fontWeight:800,color:"#111"}}>✨ New listings</span>
            <span onClick={()=>nav("explore")} style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>See all ›</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {listingsLoading
              ? Array.from({length:4}).map((_,i) => <SkeletonCard key={i}/>)
              : listings.slice(0,6).map(item => (
                  <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave}/>
                ))
            }
          </div>
          {listings.length > 6 && (
            <button onClick={()=>nav("explore")} style={{width:"100%",marginTop:14,padding:"14px",borderRadius:14,border:`1.5px solid ${GREEN}`,background:"white",color:GREEN,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              View all {listings.length} listings →
            </button>
          )}
        </div>

        {/* ── POPULAR ITEMS ── */}
        {(() => {
          // Popular = highest rated / most-saved items across all categories, excluding vintage (already shown)
          const popular = listings
            .filter(l => l.category !== "Vintage & Collectibles")
            .sort((a,b) => (b.rating||0) - (a.rating||0))
            .slice(0, 8);
          if (!popular.length) return null;
          return (
            <div style={{marginTop:24,marginBottom:4}}>
              <div style={{padding:"0 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:15,fontWeight:800,color:"#111"}}>⭐ Popular items</span>
                <span onClick={()=>nav("explore")} style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>See all ›</span>
              </div>
              <div style={{display:"flex",gap:12,overflowX:"auto",paddingLeft:16,paddingRight:16,paddingBottom:6,scrollbarWidth:"none"}}>
                {popular.map(item => (
                  <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave} compact/>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── TRUST FOOTER ── */}
        <div style={{margin:"24px 16px 8px",padding:"18px 16px",background:"#f8faff",borderRadius:18,border:"1px solid #e5e7eb"}}>
          <div style={{fontSize:11,color:"#6b7280",lineHeight:1.6,marginBottom:10}}>
            LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620).
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <a href="/terms"    style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Terms</a>
            <a href="/privacy"  style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Privacy</a>
            <a href="/trust"    style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Safety</a>
            <a href="mailto:loopgensupport@gmail.com" style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Contact</a>
          </div>
        </div>

      </div>
      <BottomNav active="home" onNav={nav}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  EXPLORE
  // ════════════════════════════
  if (screen === "explore") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      {/* Search */}
      <div style={{padding:"4px 16px 10px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div onClick={pop} style={{cursor:"pointer",flexShrink:0}}><IcoBack/></div>
          <span style={{fontSize:16,fontWeight:800,color:"#111"}}>Browse Listings</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#f3f4f6",borderRadius:14,padding:"12px 16px"}}>
          <IcoSearch c="#9ca3af"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vintage, tech, fashion…" autoFocus
            style={{flex:1,border:"none",background:"transparent",fontSize:14,outline:"none",color:"#374151",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          {search && <span onClick={()=>setSearch("")} style={{color:"#9ca3af",cursor:"pointer",fontSize:16,lineHeight:1}}>✕</span>}
        </div>
      </div>
      {/* Category pills */}
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 20px 12px",flexShrink:0,scrollbarWidth:"none"}}>
        {CATS.map(c => {
          const isVintage = c === "Vintage & Collectibles";
          const isActive = catFilter === c;
          return (
            <button key={c} onClick={()=>setCatF(c)} style={{flexShrink:0,padding:"7px 16px",borderRadius:24,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",
              background: isActive ? (isVintage ? "linear-gradient(135deg,#7c3aed,#a855f7)" : GREEN) : (isVintage ? "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(168,85,247,0.1))" : "#f3f4f6"),
              color: isActive ? "white" : (isVintage ? "#7c3aed" : "#6b7280"),
              boxShadow: isActive && isVintage ? "0 4px 14px rgba(124,58,237,0.4)" : "none",
              transition:"all 0.15s"}}>
              {isVintage ? "✦ Vintage" : c}
            </button>
          );
        })}
      </div>
      {/* Results — single condition: skeleton XOR cards, never both */}
      <div style={{flex:1,overflowY:"auto",padding:"0 16px",paddingBottom:84}}>
        {!listingsLoading && filtered.length > 0 && (
          <div style={{fontSize:12,color:"#9ca3af",fontWeight:600,marginBottom:10,paddingTop:2}}>
            {filtered.length} listing{filtered.length!==1?"s":""}{search?` for "${search}"`:catFilter!=="All"?` in ${catFilter}`:""}
          </div>
        )}
        {listingsLoading ? (
          <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:4}}>
            {Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",color:"#9ca3af",fontSize:14,paddingTop:60}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontWeight:700,color:"#374151",fontSize:15,marginBottom:6}}>No listings found</div>
            <div style={{fontSize:13}}>{search ? `Try a different search term` : `Nothing in ${catFilter} yet`}</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:4}}>
            {filtered.map(item => (
              <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave}/>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="explore" onNav={nav}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  DETAIL
  // ════════════════════════════
  if (screen === "detail" && detail) {
    const img = detail.image_urls?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";
    const demoSeller = DEMO_SELLERS[detail.seller_username];
    return (
      <Phone>
        <div style={{flex:1,overflowY:"auto",paddingBottom:88,background:"#f7f6f3"}}>

          {/* ── Full-bleed image hero ── */}
          <div style={{position:"relative",height:300,overflow:"hidden",borderRadius:"0 0 28px 28px",boxShadow:"0 8px 32px rgba(0,0,0,0.14)"}}>
            <img src={img} alt={detail.title}
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
              onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
            {/* Gradient overlay */}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.28) 0%,transparent 45%,rgba(0,0,0,0.18) 100%)"}}/>
            {/* Back button */}
            <button onClick={pop} style={{position:"absolute",top:14,left:14,width:38,height:38,borderRadius:50,background:"rgba(0,0,0,0.42)",backdropFilter:"blur(8px)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <IcoBack light/>
            </button>
            {/* Save button */}
            <button onClick={e=>toggleSave(detail.id,e)} style={{position:"absolute",top:14,right:14,width:38,height:38,borderRadius:50,background:"rgba(0,0,0,0.42)",backdropFilter:"blur(8px)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
              {detail.is_saved?"❤️":"🤍"}
            </button>
            {/* Condition badge */}
            <div style={{position:"absolute",bottom:16,left:16,background:GREEN,color:"white",fontSize:10,fontWeight:800,padding:"4px 11px",borderRadius:50,letterSpacing:"0.04em"}}>
              {detail.condition}
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{padding:"20px 20px 0"}}>

            {/* Price + Title */}
            <div style={{marginBottom:4}}>
              <div style={{fontSize:32,fontWeight:900,color:"#0f0f0f",letterSpacing:"-1px",lineHeight:1}}>
                ${detail.price}
              </div>
              <div style={{fontSize:18,fontWeight:700,color:"#1a1a1a",marginTop:6,lineHeight:1.25}}>
                {detail.title}
              </div>
            </div>

            {/* Meta row */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#888",display:"flex",alignItems:"center",gap:4}}>
                📍 {detail.location}
              </span>
              {detail.time && <span style={{fontSize:11,color:"#aaa"}}>· {detail.time}</span>}
              <span style={{fontSize:11,color:"#888",background:"#f0ede8",borderRadius:50,padding:"2px 9px",fontWeight:600}}>
                {detail.category}{detail.sub ? ` · ${detail.sub}` : ""}
              </span>
            </div>

            {/* Tags */}
            {detail.tags?.length > 0 && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12}}>
                {detail.tags.map(t => <VintageTag key={t} label={t}/>)}
              </div>
            )}

            {/* Description */}
            {detail.description && (
              <div style={{marginTop:20,background:"white",borderRadius:18,padding:"16px 16px"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>
                  Description
                </div>
                <div style={{fontSize:13,color:"#3d3d3d",lineHeight:1.75}}>
                  {detail.description}
                </div>
              </div>
            )}

            {/* Seller card */}
            {(() => {
              return (
                <div style={{background:"white",borderRadius:20,padding:"16px",marginTop:14,
                  boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>
                    Seller
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:46,height:46,borderRadius:50,
                      background:`linear-gradient(135deg,${GREEN},#22c55e)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:"white",fontWeight:900,fontSize:18,flexShrink:0}}>
                      {(detail.seller_username||"U")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontWeight:800,fontSize:15,color:"#0f0f0f"}}>
                          {detail.seller_username || "Seller"}
                        </span>
                        <span style={{background:"rgba(26,107,58,0.09)",color:GREEN,
                          fontSize:9,fontWeight:800,padding:"2px 7px",
                          borderRadius:50,border:"1px solid rgba(26,107,58,0.2)"}}>
                          Member
                        </span>
                      </div>
                      <div style={{fontSize:11,color:"#aaa",marginTop:2}}>
                        ⭐ {detail.rating || "4.5"} · {demoSeller ? `Joined ${demoSeller.joined}` : "Verified seller"}
                      </div>
                    </div>
                  </div>
                  {demoSeller?.bio && (
                    <div style={{fontSize:12,color:"#666",marginTop:12,lineHeight:1.65,
                      paddingTop:12,borderTop:"1px solid #f0ede8"}}>
                      {demoSeller.bio}
                    </div>
                  )}
                  {demoSeller?.location && (
                    <div style={{fontSize:11,color:"#aaa",marginTop:6}}>📍 {demoSeller.location}</div>
                  )}
                </div>
              );
            })()}

            {/* Safety notice */}
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",
              borderRadius:14,padding:"10px 14px",marginTop:14,
              display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>🛡️</span>
              <div style={{fontSize:11,color:"#92400e",lineHeight:1.55,flex:1}}>
                <strong>Stay safe:</strong> Always meet in a public place. Never pay before inspecting.{" "}
                <a href="/trust" style={{color:GREEN,fontWeight:700,textDecoration:"none"}}>Safety tips →</a>
              </div>
            </div>
            <button onClick={() => setReportModal({item:detail})}
              style={{marginTop:10,background:"none",border:"none",
                fontSize:11,color:"#9ca3af",cursor:"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                textDecoration:"underline",padding:0}}>
              Report this listing
            </button>

            {/* ── Related Listings ── */}
            {(() => {
              const related = listings
                .filter(l => l.id !== detail.id)
                .map(l => {
                  const sharedTags = (l.tags||[]).filter(t => (detail.tags||[]).includes(t)).length;
                  const sameCategory = l.category === detail.category ? 2 : 0;
                  return { ...l, _score: sharedTags * 3 + sameCategory };
                })
                .filter(l => l._score > 0)
                .sort((a, b) => b._score - a._score)
                .slice(0, 6);

              if (!related.length) return null;
              return (
                <div style={{marginTop:20}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:12,letterSpacing:"-0.2px"}}>
                    You may also like
                  </div>
                  <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
                    {related.map(item => (
                      <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave} compact/>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Sticky CTA bar ── */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,
          padding:"12px 16px 28px",background:"white",
          borderTop:"1px solid #f0ede8",display:"flex",gap:9,
          boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
          <button onClick={e=>toggleSave(detail.id,e)}
            style={{width:50,height:50,borderRadius:16,
              border:"1.5px solid #e8e5e0",background:"white",
              fontSize:20,cursor:"pointer",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
            {detail.is_saved?"❤️":"🤍"}
          </button>
          <button onClick={() => openSellerChat(detail)}
            style={{flex:1,padding:"14px 8px",borderRadius:16,
              border:`2px solid ${GREEN}`,background:"white",
              color:GREEN,fontWeight:700,fontSize:13,cursor:"pointer",
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            💬 Message Seller
          </button>
          <button onClick={() => { setOfferPrice(""); setOfferModal({item:detail}); }}
            style={{flex:1,padding:"14px 8px",borderRadius:16,
              border:"none",background:GREEN,color:"white",
              fontWeight:700,fontSize:13,cursor:"pointer",
              boxShadow:`0 6px 18px ${GREEN}44`,
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {offerSent[detail.id] ? `Offer: $${offerSent[detail.id]}` : "Make Offer"}
          </button>
        </div>
        <Toast msg={toast}/>
        <OfferModal
          modal={offerModal}
          offerPrice={offerPrice}
          setOfferPrice={setOfferPrice}
          onClose={() => setOfferModal(null)}
          onSubmit={async () => {
            if (!offerPrice || isNaN(parseFloat(offerPrice)) || parseFloat(offerPrice) <= 0) {
              showToast("Enter a valid offer amount"); return;
            }
            if (!user) { if (!sessionReady) { showToast("Loading…"); return; } showToast("Sign in to make an offer"); setOfferModal(null); push("auth"); return; }
            // Persist to Supabase — silent fallback if table missing
            try {
              await dbSaveOffer({
                listing_id: offerModal.item.id,
                buyer_id:   user.id,
                seller_id:  offerModal.item.seller_id || null,
                price:      offerPrice,
              });
            } catch { /* table may not exist yet — local state handles it */ }
            // Always update local state regardless of DB outcome
            setOfferSent(prev => ({...prev, [offerModal.item.id]: offerPrice}));
            const item = offerModal.item;
            setOfferModal(null);
            showToast(`Offer of $${offerPrice} sent to seller`);
            openSellerChat(item);
          }}
        />
        <ReportModal
          modal={reportModal}
          onClose={() => setReportModal(null)}
          onSubmit={async (reason) => {
            if (!reason) { showToast("Please select a reason"); return; }
            // Persist to Supabase — silent fallback if table missing
            try {
              await dbSaveReport({
                listing_id: reportModal.item.id,
                user_id:    user?.id || null,
                reason,
              });
            } catch { /* table may not exist yet */ }
            setReportModal(null);
            showToast("Report submitted. Thank you.");
          }}
        />
      </Phone>
    );
  }
  // ════════════════════════════
  if (screen === "sell") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 16px 0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div onClick={()=>nav("home")} style={{cursor:"pointer"}}><IcoBack/></div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:"#111"}}>List an item</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>Step {sellStep} of 3 — {["Photos & details","Description & location","Preview"][sellStep-1]}</div>
          </div>
        </div>
        {isGuest && <span style={{fontSize:11,color:"#ef4444",fontWeight:600,background:"#fef2f2",padding:"4px 8px",borderRadius:8}}>Sign in to list</span>}
      </div>
      {/* Progress */}
      <div style={{padding:"10px 16px 4px",display:"flex",gap:5,flexShrink:0}}>
        {[1,2,3].map(s => <div key={s} style={{flex:1,height:4,borderRadius:4,background:s<=sellStep?GREEN:"#e5e7eb",transition:"background 0.3s"}}/>)}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px 20px",paddingBottom:90}}>
        {sellStep===1 && (
          <>
            {/* Photo upload — REAL */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{display:"none"}}/>
            <div onClick={() => fileInputRef.current?.click()}
              style={{background:"#f9fafb",borderRadius:20,height:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"2px dashed #e5e7eb",marginBottom:16,position:"relative",overflow:"hidden"}}>
              {sellImages.length > 0
                ? <img src={sellImages[0]} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>
                : <>
                    <div style={{width:52,height:52,borderRadius:16,background:"white",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.08)",marginBottom:10}}><IcoCamera/></div>
                    <div style={{fontWeight:600,color:"#374151",fontSize:14}}>{uploadingImg?"Uploading…":"Add photos"}</div>
                    <div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>Tap to upload · Up to 5</div>
                  </>
              }
              {sellImages.length > 0 && (
                <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.6)",color:"white",fontSize:11,fontWeight:700,padding:"4px 9px",borderRadius:20}}>
                  {sellImages.length} photo{sellImages.length>1?"s":""}
                </div>
              )}
            </div>
            <FInp placeholder="Title *" value={sell.title} onChange={v=>setSell(f=>({...f,title:v}))}/>
            <FInp placeholder="Price (AUD $) *" type="number" value={sell.price} onChange={v=>setSell(f=>({...f,price:v}))}/>
            <FSel value={sell.category} onChange={v=>setSell(f=>({...f,category:v,sub:""}))} ph="Category *"
              opts={["","Vintage & Collectibles","Fashion","Electronics","Home","Sports","Vehicles","Pets","Baby & Kids","Free Stuff"]}/>
            {sell.category === "Vintage & Collectibles" && (
              <FSel value={sell.sub} onChange={v=>setSell(f=>({...f,sub:v}))} ph="Subcategory"
                opts={["","Vinyl Records","DVD / Blu-ray","Retro Games","Film Cameras","Polaroid Cameras","Cassette Tapes","Vintage Clothing","Retro Electronics","Collectible Toys","Posters & Memorabilia"]}/>
            )}
            <FSel value={sell.condition} onChange={v=>setSell(f=>({...f,condition:v}))} ph="Condition *"
              opts={["","New","Like New","Good","Used","For Parts"]}/>
            {/* ── Tag selection — all categories ── */}
            {sell.category && (() => {
              // Auto-suggest tags based on title/category/condition
              const suggested = autoTagAssist(sell.title, sell.category, sell.condition)
                .filter(t => !(sell.tags||[]).includes(t));

              const toggleTag = (tag) => {
                const cur = sell.tags || [];
                if (cur.includes(tag)) {
                  setSell(f => ({...f, tags: f.tags.filter(t => t !== tag)}));
                } else {
                  if (cur.length >= MAX_TAGS) { showToast(`Max ${MAX_TAGS} tags`); return; }
                  setSell(f => ({...f, tags: [...(f.tags||[]), tag]}));
                }
              };

              const applyAll = (tags) => {
                const cur = sell.tags || [];
                const toAdd = tags.filter(t => !cur.includes(t));
                const combined = [...cur, ...toAdd].slice(0, MAX_TAGS);
                setSell(f => ({...f, tags: combined}));
              };

              const groups = [
                { label:"Style",     tags: TAG_TAXONOMY.style },
                { label:"Type",      tags: TAG_TAXONOMY.type  },
                { label:"Condition", tags: TAG_TAXONOMY.condition },
                { label:"Era",       tags: TAG_TAXONOMY.era   },
              ];

              return (
                <div style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#374151"}}>
                      Tags <span style={{color:"#9ca3af",fontWeight:500}}>({(sell.tags||[]).length}/{MAX_TAGS})</span>
                    </div>
                    {(sell.tags||[]).length > 0 && (
                      <button onClick={() => setSell(f=>({...f,tags:[]}))}
                        style={{fontSize:11,color:"#9ca3af",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Auto-suggest strip */}
                  {suggested.length > 0 && (
                    <div style={{background:"#f0fdf4",borderRadius:10,padding:"8px 10px",marginBottom:10,border:"1px solid #bbf7d0"}}>
                      <div style={{fontSize:10,fontWeight:700,color:GREEN,letterSpacing:"0.06em",marginBottom:6,textTransform:"uppercase"}}>
                        Suggested
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        {suggested.slice(0,5).map(tag => (
                          <button key={tag} onClick={() => toggleTag(tag)}
                            style={{padding:"3px 10px",borderRadius:20,border:`1.5px solid ${GREEN}`,fontSize:11,fontWeight:700,
                              cursor:"pointer",background:"white",color:GREEN,fontFamily:"inherit"}}>
                            + {tag}
                          </button>
                        ))}
                        {suggested.length > 1 && (sell.tags||[]).length + suggested.length <= MAX_TAGS && (
                          <button onClick={() => applyAll(suggested)}
                            style={{padding:"3px 10px",borderRadius:20,border:"none",fontSize:11,fontWeight:700,
                              cursor:"pointer",background:GREEN,color:"white",fontFamily:"inherit"}}>
                            Add all
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Grouped tag picker */}
                  {groups.map(({label, tags}) => (
                    <div key={label} style={{marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>
                        {label}
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {tags.map(tag => {
                          const active = (sell.tags||[]).includes(tag);
                          const c = TAG_COLORS[tag] || {bg:"#f3f4f6",text:"#374151",border:"#e5e7eb"};
                          return (
                            <button key={tag} onClick={() => toggleTag(tag)}
                              style={{padding:"4px 11px",borderRadius:50,fontSize:11,fontWeight:700,
                                cursor:"pointer",fontFamily:"inherit",transition:"all 0.12s",
                                border:`1.5px solid ${active ? c.border : "#e5e7eb"}`,
                                background: active ? c.bg : "white",
                                color: active ? c.text : "#9ca3af",
                                opacity: (!active && (sell.tags||[]).length >= MAX_TAGS) ? 0.4 : 1}}>
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {(sell.tags||[]).length === 0 && (
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>
                      Select at least 1 tag to help buyers find your item
                    </div>
                  )}
                </div>
              );
            })()}
            <GreenBtn onClick={()=>{
              if (!sell.title.trim()) { showToast("Please add a title"); return; }
              if (!sell.price || parseFloat(sell.price) <= 0) { showToast("Please add a valid price"); return; }
              if (!sell.category) { showToast("Please select a category"); return; }
              if (!sell.condition) { showToast("Please select a condition"); return; }
              if (uploadingImg) { showToast("Please wait — photos still uploading…"); return; }
              if (sellImages.length === 0) { showToast("Please add at least 1 photo"); return; }
              // T6: ensure at least 1 tag; auto-fill Type+Condition if missing
              const curTags = sell.tags || [];
              const hasType = TAG_TAXONOMY.type.some(t => curTags.includes(t));
              const hasCond = TAG_TAXONOMY.condition.some(t => curTags.includes(t));
              let finalTags = curTags;
              if (!hasType || !hasCond || curTags.length === 0) {
                const auto = autoTagAssist(sell.title, sell.category, sell.condition);
                finalTags = [...curTags, ...auto.filter(t => !curTags.includes(t))].slice(0, MAX_TAGS);
                if (finalTags.length === 0) { showToast("Please add at least 1 tag"); return; }
                // Update tags and advance step atomically in one render cycle
                setSell(f => ({...f, tags: finalTags}));
              }
              setSellStep(2);
            }}>Continue →</GreenBtn>
          </>
        )}
        {sellStep===2 && (
          <>
            <label style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>Description</label>
            <textarea value={sell.desc} onChange={e=>setSell(f=>({...f,desc:e.target.value}))}
              placeholder="Describe your item…" rows={5}
              style={{width:"100%",borderRadius:14,border:"1.5px solid #e5e7eb",padding:"12px 14px",fontSize:13,resize:"none",outline:"none",marginBottom:12,color:"#374151"}}/>
            {supabase && (
              <button onClick={aiGen} style={{width:"100%",padding:"12px",borderRadius:14,marginBottom:14,background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:`1.5px solid ${GREEN}`,fontSize:13,fontWeight:700,color:GREEN,cursor:"pointer"}}>
                {aiLoading?"⏳ Generating…":"✨ Generate with AI"}
              </button>
            )}
            <FInp placeholder="📍 Location (suburb or postcode)" value={sell.location} onChange={v=>setSell(f=>({...f,location:v}))}/>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={()=>setSellStep(1)} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,cursor:"pointer",color:"#374151"}}>← Back</button>
              <GreenBtn onClick={()=>setSellStep(3)} mt={0} style={{flex:2}}>Preview →</GreenBtn>
            </div>
          </>
        )}
        {sellStep===3 && (
          <>
            <div style={{background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 3px 16px rgba(0,0,0,0.09)",marginBottom:16}}>
              {sellImages.length > 0
                ? <img src={sellImages[0]} alt="preview" style={{width:"100%",height:160,objectFit:"cover"}}/>
                : <div style={{background:"#f3f4f6",height:160,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>📦</div>
              }
              <div style={{padding:16}}>
                <div style={{fontWeight:800,fontSize:22,color:"#111"}}>{sell.price?`$${sell.price}`:"$—"}</div>
                <div style={{fontSize:16,fontWeight:600,color:"#374151"}}>{sell.title||"Untitled"}</div>
                <div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{sell.category}{sell.condition?` · ${sell.condition}`:""}</div>
                {sell.location && <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>📍 {sell.location}</div>}
                {sell.desc && <div style={{fontSize:13,color:"#6b7280",marginTop:10,lineHeight:1.65}}>{sell.desc}</div>}
              </div>
            </div>
            {isGuest && (
              <div style={{background:"#fef3c7",borderRadius:14,padding:"12px 16px",marginBottom:12,fontSize:12,color:"#92400e",fontWeight:600}}>
                ⚠️ Sign in to save your listing permanently
              </div>
            )}
            <GreenBtn onClick={handleList} disabled={loading}>{loading?"Posting…":"🚀 Post Listing"}</GreenBtn>
            <button onClick={()=>setSellStep(2)} style={{width:"100%",marginTop:10,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,cursor:"pointer",color:"#374151"}}>← Edit</button>
          </>
        )}
      </div>
      <BottomNav active="sell" onNav={nav}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  CHATS LIST
  // ════════════════════════════
  if (screen === "chats") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 16px 12px",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:20,fontWeight:800,color:"#111"}}>Messages</div>
        {!isGuest && convos.length > 0 && (
          <span style={{fontSize:12,color:"#9ca3af",fontWeight:500}}>{convos.length} conversation{convos.length!==1?"s":""}</span>
        )}
      </div>
      {isGuest ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",gap:16}}>
          <div style={{fontSize:52}}>💬</div>
          <div style={{fontWeight:800,fontSize:18,color:"#111",textAlign:"center"}}>Chat with sellers</div>
          <div style={{fontSize:14,color:"#9ca3af",textAlign:"center",lineHeight:1.6}}>Sign in to message sellers and buyers, and get notified when someone's interested in your items.</div>
          <GreenBtn onClick={()=>push("auth")} mt={4}>Sign In to Message</GreenBtn>
          <button onClick={()=>nav("explore")} style={{background:"transparent",border:"none",color:"#9ca3af",fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"8px"}}>Browse listings first →</button>
        </div>
      ) : (
        <div style={{flex:1,overflowY:"auto",padding:"0 16px",display:"flex",flexDirection:"column",gap:8,paddingBottom:78}}>
          {convos.length === 0 ? (
            <div style={{textAlign:"center",padding:"52px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <div style={{fontSize:48}}>📭</div>
              <div style={{fontWeight:700,fontSize:16,color:"#111"}}>No messages yet</div>
              <div style={{fontSize:13,color:"#9ca3af",lineHeight:1.6}}>Find something you like and tap<br/>"Message Seller" to start a chat</div>
              <button onClick={()=>nav("explore")} style={{marginTop:4,padding:"13px 24px",borderRadius:50,background:GREEN,border:"none",color:"white",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 6px 18px ${GREEN}44`}}>Browse Listings</button>
            </div>
          ) : convos.map(c => (
            <div key={c.id} onClick={() => openConvo(c)}
              style={{background:"white",borderRadius:18,padding:"14px 15px",display:"flex",gap:12,alignItems:"center",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",cursor:"pointer",minHeight:70}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:18}}>
                  {(c.other_user||"U")[0].toUpperCase()}
                </div>
                {c.online && <div style={{position:"absolute",bottom:1,right:1,width:12,height:12,background:"#22c55e",borderRadius:"50%",border:"2px solid white"}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:700,fontSize:14,color:"#111"}}>{c.other_user}</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{c.last_time || c.time}</span>
                </div>
                <div style={{fontSize:11,color:GREEN,marginTop:1,fontWeight:600}}>Re: {c.listing_title || c.item}</div>
                <div style={{fontSize:12,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{c.last_message || c.last}</div>
              </div>
              {(c.unread>0) && <div style={{background:GREEN,color:"white",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{c.unread}</div>}
            </div>
          ))}
        </div>
      )}
      <BottomNav active="chats" onNav={nav}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  CHAT
  // ════════════════════════════
  if (screen === "chat" && convo) return (
    <Phone>
      <StatusBar/>
      <div style={{padding:"4px 16px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:"1.5px solid #f3f4f6",flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer",padding:"4px 6px 4px 0"}}><IcoBack/></div>
        <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:16}}>
          {(convo.other_user||"U")[0].toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,color:"#111"}}>{convo.other_user || convo.name}</div>
          <div style={{fontSize:11,color:convo.online?"#22c55e":"#9ca3af",fontWeight:500}}>{convo.online?"Online":"Offline"}</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",background:"#f8f9fa",display:"flex",flexDirection:"column",gap:10}}>
        {chatMsgs.map((m, i) => (
          <div key={m.id||i} style={{display:"flex",justifyContent:(m.from_me||m.from==="me")?"flex-end":"flex-start",alignItems:"flex-end",gap:7}}>
            {!(m.from_me||m.from==="me") && (
              <div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:11,flexShrink:0}}>
                {(convo.other_user||"U")[0].toUpperCase()}
              </div>
            )}
            <div style={{maxWidth:"72%",padding:"11px 15px",fontSize:14,fontWeight:500,lineHeight:1.45,borderRadius:(m.from_me||m.from==="me")?"20px 20px 5px 20px":"20px 20px 20px 5px",background:(m.from_me||m.from==="me")?GREEN:"white",color:(m.from_me||m.from==="me")?"white":"#111",boxShadow:(m.from_me||m.from==="me")?`0 3px 12px ${GREEN}33`:"0 1px 6px rgba(0,0,0,0.08)"}}>
              {m.content || m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>

      <div style={{padding:"10px 14px 20px",background:"white",borderTop:"1.5px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <div style={{flex:1,background:"#f3f4f6",borderRadius:24,padding:"10px 16px",display:"flex",alignItems:"center",touchAction:"auto",pointerEvents:"auto"}}>
          <input value={msgText} onChange={e=>setMsgText(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message..."
            autoComplete="off" autoCorrect="off" spellCheck="false"
            style={{border:"none",background:"transparent",fontSize:14,outline:"none",flex:1,color:"#374151",WebkitUserSelect:"text",userSelect:"text",touchAction:"auto",pointerEvents:"auto"}}/>
        </div>
        <div onClick={sendMsg} style={{width:40,height:40,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,boxShadow:`0 4px 14px ${GREEN}55`}}>
          <IcoSend/>
        </div>
      </div>
      <BottomNav active="chats" onNav={nav}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  PROFILE
  // ════════════════════════════
  if (screen === "profile") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:78}}>
        {/* Profile hero */}
        <div style={{background:`linear-gradient(160deg,#f0fdf4,#dcfce7)`,padding:"20px 20px 24px",textAlign:"center",borderBottom:"1px solid #e8f5ee"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:"white",fontSize:34,fontWeight:800,boxShadow:`0 6px 20px ${GREEN}44`}}>
            {isGuest ? "G" : currentUser[0].toUpperCase()}
          </div>
          <div style={{fontWeight:800,fontSize:18,color:"#111"}}>{isGuest ? "Guest User" : currentUser}</div>
          {!isGuest && <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{user?.email}</div>}
          {!isGuest && (
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"4px 12px",marginTop:8}}>
              <span style={{fontSize:11}}>✅</span>
              <span style={{fontSize:11,fontWeight:700,color:GREEN}}>Verified Member</span>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:18}}>
            {[
              [isGuest?"—":String(userListings.filter(l=>l.status==="active").length), "Listings"],
              [isGuest?"—":String(userListings.filter(l=>l.status==="sold").length),   "Sold"],
            ].map(([v,l]) => (
              <div key={l} style={{cursor:l==="Listings"&&!isGuest?"pointer":"default"}} onClick={l==="Listings"&&!isGuest?()=>push("my-listings"):undefined}>
                <div style={{fontWeight:800,fontSize:20,color:"#111"}}>{v}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:3}}>
          {isGuest ? (
            <>
              <GreenBtn onClick={()=>push("auth")} mt={0}>Sign In or Register</GreenBtn>
              <div style={{textAlign:"center",marginTop:14,fontSize:13,color:"#9ca3af",lineHeight:1.6}}>Sign in to manage listings,<br/>save items, and chat with sellers</div>
            </>
          ) : (
            [
              ["My Listings",      "📦", ()=>push("my-listings")],
              ["Saved Items",      "❤️", ()=>push("saved-items")],
              ["Account Settings", "⚙️", ()=>push("settings")],
              ["Reviews",          "⭐", ()=>showToast("Reviews coming after beta 🌟")],
              ["Help & Support",   "💬", ()=>showToast("Support: hello@loopgen.app")],
              ["Sign Out",         "🚪", handleSignOut],
            ].map(([label, icon, action], i) => (
              <div key={label} onClick={action}
                style={{padding:"16px",background:"white",borderRadius:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:i===4?10:0,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",minHeight:54}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>{icon}</span>
                  <span style={{fontWeight:600,fontSize:14,color:label==="Sign Out"?"#ef4444":"#111"}}>{label}</span>
                </div>
                {label!=="Sign Out"&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>}
              </div>
            ))
          )}
        </div>

        {/* Trust footer on profile */}
        <div style={{margin:"8px 16px 16px",padding:"14px",background:"#f8f9fa",borderRadius:14,border:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <LoopGenLogo height={22} />
          </div>
          <div style={{fontSize:11,color:"#9ca3af",textAlign:"center",lineHeight:1.6}}>
            LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620)<br/>
            <a href="/terms"   style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Terms</a>
            {" · "}
            <a href="/privacy" style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Privacy</a>
            {" · "}
            <a href="/trust"   style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Safety</a>
            {" · "}
            <a href="mailto:loopgensupport@gmail.com" style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Contact</a>
          </div>
        </div>
      </div>
      <BottomNav active="profile" onNav={nav}/>
      <ConfirmModal confirm={confirm} onCancel={()=>setConfirm(null)}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  MY LISTINGS
  // ════════════════════════════
  if (screen === "my-listings") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
        <div style={{fontSize:18,fontWeight:800,color:"#111"}}>My Listings</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px",paddingBottom:88}}>
        {userListings.length === 0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:60,gap:14}}>
            <div style={{fontSize:44}}>📦</div>
            <div style={{fontWeight:700,fontSize:16,color:"#111"}}>No listings yet</div>
            <div style={{fontSize:13,color:"#9ca3af",textAlign:"center"}}>Tap the + button to sell your first item</div>
            <GreenBtn onClick={()=>nav("sell")} mt={8} style={{width:"auto",padding:"13px 28px"}}>Start Selling</GreenBtn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {userListings.map(item => {
              const img = item.image_urls?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";
              const isSold = item.status === "sold";
              return (
                <div key={item.id} style={{background:"white",borderRadius:22,overflow:"hidden",boxShadow:"0 3px 14px rgba(0,0,0,0.08)",display:"flex",opacity:isSold?0.75:1}}>
                  <div style={{position:"relative",flexShrink:0,width:100,height:100}}>
                    <img src={img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}
                      onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
                    {isSold && (
                      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{color:"white",fontWeight:800,fontSize:11,background:"#ef4444",padding:"3px 8px",borderRadius:8}}>SOLD</span>
                      </div>
                    )}
                  </div>
                  <div style={{padding:"12px 14px",flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:16,color:"#111"}}>${item.price}</div>
                        <div style={{fontSize:13,fontWeight:600,color:"#374151",marginTop:2}}>{item.title}</div>
                        <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{item.condition} · {timeSince(item.created_at)}</div>
                      </div>
                      {isSold && <span style={{fontSize:10,fontWeight:700,color:"#ef4444",background:"#fef2f2",padding:"3px 8px",borderRadius:8,flexShrink:0}}>SOLD</span>}
                    </div>
                    {!isSold && (
                      <div style={{display:"flex",gap:7,marginTop:10}}>
                        <button onClick={()=>handleMarkSold(item.id)}
                          style={{flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${GREEN}`,background:"white",color:GREEN,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          Mark Sold
                        </button>
                        <button onClick={()=>{setDetail(item);push("detail");}}
                          style={{flex:1,padding:"8px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"white",color:"#374151",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                          View
                        </button>
                        <button onClick={()=>handleDeleteListing(item.id)}
                          style={{padding:"8px 12px",borderRadius:10,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav active="profile" onNav={nav}/>
      <ConfirmModal confirm={confirm} onCancel={()=>setConfirm(null)}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  SAVED ITEMS
  // ════════════════════════════
  if (screen === "saved-items") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
        <div style={{fontSize:18,fontWeight:800,color:"#111"}}>Saved Items</div>
        {savedListings.length > 0 && <span style={{marginLeft:"auto",fontSize:12,color:"#9ca3af",fontWeight:500}}>{savedListings.length} item{savedListings.length!==1?"s":""}</span>}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px",paddingBottom:88}}>
        {savedListings.length === 0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:60,gap:14}}>
            <div style={{fontSize:44}}>🤍</div>
            <div style={{fontWeight:700,fontSize:16,color:"#111"}}>Nothing saved yet</div>
            <div style={{fontSize:13,color:"#9ca3af",textAlign:"center"}}>Tap the heart on any listing to save it</div>
            <GreenBtn onClick={()=>nav("explore")} mt={8} style={{width:"auto",padding:"13px 28px"}}>Browse Listings</GreenBtn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {savedListings.map(item => (
              <div key={item.id} style={{position:"relative"}}>
                <ListingCard
                  item={{...item, is_saved:true, time: item.time || timeSince(item.created_at)}}
                  onTap={openDetail}
                  onSave={async (id, e) => {
                    e?.stopPropagation();
                    setSavedListings(sl => sl.filter(l => l.id !== id));
                    setListings(ls => ls.map(l => l.id===id ? {...l, is_saved:false} : l));
                    showToast("Removed from saved");
                    if (user) await dbToggleSave(id, user.id, true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="profile" onNav={nav}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  ACCOUNT SETTINGS
  // ════════════════════════════
  if (screen === "settings") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
        <div style={{fontSize:18,fontWeight:800,color:"#111"}}>Account Settings</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px",paddingBottom:88,display:"flex",flexDirection:"column",gap:16}}>
        {/* Account info */}
        <div style={{background:"#f8f9fa",borderRadius:18,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Account</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"#6b7280"}}>Username</span>
              <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{currentUser}</span>
            </div>
            <div style={{height:1,background:"#f0f0f0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"#6b7280"}}>Email</span>
              <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{user?.email}</span>
            </div>
            <div style={{height:1,background:"#f0f0f0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"#6b7280"}}>Member since</span>
              <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-AU",{month:"short",year:"numeric"}) : "—"}</span>
            </div>
          </div>
        </div>

        {/* Notifications — post-beta stub */}
        <div style={{background:"#f8f9fa",borderRadius:18,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Notifications</div>
          {[["New messages","💬",true],["Listing activity","📦",true],["Promotions","🎉",false]].map(([label,icon,def],i,arr) => (
            <div key={label}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span>{icon}</span>
                  <span style={{fontSize:13,color:"#374151"}}>{label}</span>
                </div>
                <span style={{fontSize:10,fontWeight:600,color:"#9ca3af",background:"#f0f0f0",padding:"3px 8px",borderRadius:8}}>Coming soon</span>
              </div>
              {i<arr.length-1&&<div style={{height:1,background:"#f0f0f0",margin:"6px 0"}}/>}
            </div>
          ))}
        </div>

        {/* Legal & Safety */}
        <div style={{background:"#f8f9fa",borderRadius:18,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Legal &amp; Safety</div>
          {[
            ["Terms of Service",    "📄", ()=>{ window.location.href="/terms"; }],
            ["Privacy Policy",      "🔒", ()=>{ window.location.href="/privacy"; }],
            ["Community Guidelines","🤝", ()=>{ window.location.href="/trust"; }],
            ["Safety Tips",         "🛡️", ()=>{ window.location.href="/trust"; }],
            ["Contact Support",     "💬", ()=>{ window.location.href="mailto:loopgensupport@gmail.com"; }],
          ].map(([label,icon,action],i,arr) => (
            <div key={label}>
              <div onClick={action} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{icon}</span>
                  <span style={{fontSize:13,color:"#374151"}}>{label}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              {i<arr.length-1&&<div style={{height:1,background:"#f0f0f0"}}/>}
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div style={{background:"#fff5f5",borderRadius:18,padding:"16px",border:"1px solid #fecaca"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#ef4444",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Danger Zone</div>
          <div onClick={handleSignOut}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",cursor:"pointer"}}>
            <span style={{fontSize:18}}>🚪</span>
            <span style={{fontSize:14,fontWeight:600,color:"#ef4444"}}>Sign Out</span>
          </div>
          <div style={{height:1,background:"#fecaca",margin:"4px 0"}}/>
          <div onClick={()=>setConfirm({
              msg:"Delete your account? All listings and messages will be lost forever.",
              onConfirm: async () => {
                // Supabase doesn't expose deleteUser from client — direct users to support
                setConfirm(null);
                showToast("Contact hello@loopgen.app to delete your account");
              }
            })}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",cursor:"pointer"}}>
            <span style={{fontSize:18}}>🗑️</span>
            <span style={{fontSize:14,fontWeight:600,color:"#ef4444"}}>Delete Account</span>
          </div>
        </div>

        <div style={{fontSize:11,color:"#c4c9d4",textAlign:"center",paddingBottom:8,lineHeight:1.8}}>
          <LoopGenLogo height={22} style={{margin:"0 auto 8px"}} />
          LoopGen Beta v0.1.0 · <a href="mailto:hello@loopgen.app" style={{color:"#9ca3af",textDecoration:"none"}}>hello@loopgen.app</a><br/>
          LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620)
        </div>
      </div>
      <BottomNav active="profile" onNav={nav}/>
      <ConfirmModal confirm={confirm} onCancel={()=>setConfirm(null)}/>
      <Toast msg={toast}/>
    </Phone>
  );

  return null;
}
