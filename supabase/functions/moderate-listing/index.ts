/**
 * LoopGen Moderation Engine
 * Supabase Edge Function: supabase/functions/moderate-listing/index.ts
 *
 * Triggered by: DB webhook on INSERT to listings table
 * OR called directly from your React app after listing creation
 *
 * Deploy: supabase functions deploy moderate-listing
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ──────────────────────────────────────────────────────────────────
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  created_at: string;
}

interface ModerationFlag {
  rule: string;
  severity: "high" | "medium" | "low";
  detail: string;
  score_contribution: number;
}

interface ModerationResult {
  listing_id: string;
  score: number;          // 0–100 (higher = more suspicious)
  flags: ModerationFlag[];
  flag_summary: string;
  priority: "high" | "medium" | "low";
  recommended_action: "approve" | "queue" | "hold";
  checked_at: string;
}

// ── Keyword Rules ──────────────────────────────────────────────────────────
//
// Each rule: { pattern, severity, label, score }
// score = how much this rule adds to the suspicion score (0–100 total)
// Rules are checked against title + description (lowercased)
//
const SCAM_RULES = [

  // ── Off-platform contact (HIGH — most reliable scam signal) ───────────
  { pattern: /whatsapp/i,              severity: "high",   label: "WhatsApp contact",       score: 30 },
  { pattern: /text me/i,               severity: "high",   label: "Off-platform text",      score: 25 },
  { pattern: /call me/i,               severity: "high",   label: "Off-platform call",      score: 20 },
  { pattern: /telegram/i,              severity: "high",   label: "Telegram contact",       score: 28 },
  { pattern: /signal me/i,             severity: "high",   label: "Signal contact",         score: 28 },
  { pattern: /dm me/i,                 severity: "medium", label: "DM request",             score: 10 },

  // ── Payment methods (HIGH — gift cards and wire = scam) ───────────────
  { pattern: /gift card/i,             severity: "high",   label: "Gift card payment",      score: 40 },
  { pattern: /itunes card/i,           severity: "high",   label: "iTunes card",            score: 40 },
  { pattern: /google play card/i,      severity: "high",   label: "Google Play card",       score: 40 },
  { pattern: /steam card/i,            severity: "high",   label: "Steam card",             score: 35 },
  { pattern: /bank transfer/i,         severity: "high",   label: "Bank transfer",          score: 25 },
  { pattern: /wire transfer/i,         severity: "high",   label: "Wire transfer",          score: 30 },
  { pattern: /western union/i,         severity: "high",   label: "Western Union",          score: 40 },
  { pattern: /moneygram/i,             severity: "high",   label: "MoneyGram",              score: 40 },
  { pattern: /bitcoin/i,               severity: "high",   label: "Crypto payment",         score: 30 },
  { pattern: /crypto/i,                severity: "medium", label: "Crypto mention",         score: 15 },
  { pattern: /payid me/i,              severity: "medium", label: "PayID push",             score: 15 },
  { pattern: /deposit required/i,      severity: "high",   label: "Deposit required",       score: 25 },
  { pattern: /pay deposit/i,           severity: "high",   label: "Deposit request",        score: 25 },

  // ── External links (HIGH — phishing / off-platform) ───────────────────
  { pattern: /https?:\/\//i,           severity: "high",   label: "External URL",           score: 25 },
  { pattern: /\.(com|net|org|io)\b/i,  severity: "medium", label: "Domain mention",         score: 12 },
  { pattern: /bit\.ly/i,               severity: "high",   label: "Shortened URL",          score: 30 },
  { pattern: /tinyurl/i,               severity: "high",   label: "Shortened URL",          score: 30 },

  // ── Urgency / pressure tactics (MEDIUM) ───────────────────────────────
  { pattern: /must sell today/i,       severity: "medium", label: "Extreme urgency",        score: 15 },
  { pattern: /leaving (australia|country|melbourne)/i, severity: "medium", label: "Leaving country", score: 12 },
  { pattern: /first come first served/i, severity: "low", label: "FCFS pressure",           score: 5  },
  { pattern: /serious buyers only/i,   severity: "low",    label: "Buyer qualifier",        score: 5  },
  { pattern: /no time wasters/i,       severity: "low",    label: "Pressure language",      score: 5  },
  { pattern: /cash only/i,             severity: "low",    label: "Cash only",              score: 8  },

  // ── Fake/replica goods (HIGH) ─────────────────────────────────────────
  { pattern: /replica/i,               severity: "high",   label: "Replica goods",          score: 35 },
  { pattern: /inspired by/i,           severity: "medium", label: "Counterfeit signal",     score: 15 },
  { pattern: /looks like (louis|gucci|rolex|supreme)/i, severity: "high", label: "Counterfeit brand", score: 35 },
  { pattern: /aaa quality/i,           severity: "high",   label: "AAA replica",            score: 35 },
  { pattern: /1:1 copy/i,              severity: "high",   label: "Copy goods",             score: 40 },

  // ── Suspicious identity / new account signals (LOW — context only) ────
  { pattern: /moving overseas/i,       severity: "low",    label: "Moving overseas",        score: 8  },
  { pattern: /deceased estate/i,       severity: "low",    label: "Estate sale",            score: 5  },

  // ── Prohibited items (HIGH) ───────────────────────────────────────────
  { pattern: /\bweapon\b/i,            severity: "high",   label: "Weapon mention",         score: 50 },
  { pattern: /\bknife\b/i,             severity: "medium", label: "Knife mention",          score: 15 },
  { pattern: /\bdrug\b/i,              severity: "high",   label: "Drug mention",           score: 50 },
  { pattern: /prescription/i,          severity: "high",   label: "Prescription item",      score: 40 },
] as const;

// ── Price anomaly rules (per category) ────────────────────────────────────
// If price is suspiciously low (too good to be true) or suspiciously high
const CATEGORY_PRICE_NORMS: Record<string, { min: number; max: number }> = {
  "trading-cards":     { min: 1,    max: 5000  },
  "electronics":       { min: 5,    max: 8000  },
  "vintage-clothing":  { min: 5,    max: 2000  },
  "comics":            { min: 1,    max: 2000  },
  "toys":              { min: 2,    max: 500   },
  "jewellery":         { min: 10,   max: 10000 },
  "sports-memorabilia":{ min: 5,    max: 5000  },
  "furniture":         { min: 20,   max: 5000  },
  "books":             { min: 1,    max: 500   },
};

// ── Quality checks ─────────────────────────────────────────────────────────
function checkListingQuality(listing: Listing): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // Very short title
  if (listing.title.trim().length < 10) {
    flags.push({ rule: "short_title", severity: "low", detail: "Title under 10 chars", score_contribution: 5 });
  }

  // Very short description
  if (!listing.description || listing.description.trim().length < 20) {
    flags.push({ rule: "short_description", severity: "low", detail: "Description under 20 chars", score_contribution: 8 });
  }

  // All caps title (shouting / spam signal)
  if (listing.title === listing.title.toUpperCase() && listing.title.length > 5) {
    flags.push({ rule: "all_caps_title", severity: "low", detail: "Title in all caps", score_contribution: 5 });
  }

  // Price = $0 or negative
  if (listing.price !== undefined && listing.price <= 0) {
    flags.push({ rule: "zero_price", severity: "medium", detail: "Price is $0 or negative", score_contribution: 15 });
  }

  // Price anomaly for known categories
  const norm = CATEGORY_PRICE_NORMS[listing.category];
  if (norm && listing.price !== undefined) {
    if (listing.price > norm.max * 2) {
      flags.push({
        rule: "price_too_high",
        severity: "medium",
        detail: `$${listing.price} is unusually high for ${listing.category} (typical max: $${norm.max})`,
        score_contribution: 15,
      });
    }
    // suspiciously cheap (might be a "pay for shipping" scam)
    if (listing.price < norm.min * 0.1 && listing.price > 0) {
      flags.push({
        rule: "price_suspiciously_low",
        severity: "medium",
        detail: `$${listing.price} is unusually low for ${listing.category}`,
        score_contribution: 12,
      });
    }
  }

  return flags;
}

// ── Core scoring function ──────────────────────────────────────────────────
export function scoreListingContent(listing: Listing): ModerationResult {
  const text = `${listing.title} ${listing.description || ""}`.toLowerCase();
  const flags: ModerationFlag[] = [];
  let rawScore = 0;

  // 1. Run all keyword rules
  for (const rule of SCAM_RULES) {
    if (rule.pattern.test(text)) {
      flags.push({
        rule: rule.label.toLowerCase().replace(/\s+/g, "_"),
        severity: rule.severity as "high" | "medium" | "low",
        detail: rule.label,
        score_contribution: rule.score,
      });
      rawScore += rule.score;
    }
  }

  // 2. Quality checks
  const qualityFlags = checkListingQuality(listing);
  flags.push(...qualityFlags);
  rawScore += qualityFlags.reduce((s, f) => s + f.score_contribution, 0);

  // 3. Cap at 100
  const score = Math.min(100, rawScore);

  // 4. Priority & action
  let priority: "high" | "medium" | "low";
  let recommended_action: "approve" | "queue" | "hold";

  if (score >= 70) {
    priority = "high";
    recommended_action = "hold";
  } else if (score >= 30) {
    priority = "medium";
    recommended_action = "queue";
  } else {
    priority = "low";
    recommended_action = "approve";
  }

  // 5. Human-readable summary
  const highFlags = flags.filter(f => f.severity === "high").map(f => f.detail);
  const medFlags  = flags.filter(f => f.severity === "medium").map(f => f.detail);
  const allLabels = [...highFlags, ...medFlags].slice(0, 3);
  const flag_summary = allLabels.length > 0
    ? allLabels.join(", ")
    : "No issues detected";

  return {
    listing_id: listing.id,
    score,
    flags,
    flag_summary,
    priority,
    recommended_action,
    checked_at: new Date().toISOString(),
  };
}

// ── Edge Function handler ──────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS for local dev
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();

    // Supports both:
    // { listing_id: "uuid" }  — look up from DB
    // { listing: { ... } }    — score inline (for testing)
    let listing: Listing;

    if (body.listing_id) {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, description, price, category, user_id, created_at")
        .eq("id", body.listing_id)
        .single();
      if (error || !data) throw new Error(`Listing not found: ${body.listing_id}`);
      listing = data as Listing;
    } else if (body.listing) {
      listing = body.listing as Listing;
    } else {
      throw new Error("Provide listing_id or listing object");
    }

    // Score it
    const result = scoreListingContent(listing);

    // Write score back to listings table
    await supabase
      .from("listings")
      .update({
        ai_moderation_score: result.score,
        moderation_status: result.recommended_action === "approve" ? "approved"
                         : result.recommended_action === "hold"    ? "held"
                         : "flagged",
        moderation_flags: result.flags,
        moderation_checked_at: result.checked_at,
      })
      .eq("id", listing.id);

    // If score ≥ 30, add to moderation_queue
    if (result.score >= 30) {
      await supabase
        .from("moderation_queue")
        .upsert({
          entity_type: "listing",
          entity_id: listing.id,
          ai_score: result.score,
          flags: result.flags,
          flag_summary: result.flag_summary,
          priority: result.priority,
          status: "pending",
          raw_content: { title: listing.title, description: listing.description, price: listing.price, category: listing.category },
        }, { onConflict: "entity_id" });
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
