/**
 * LoopGen Daily Metrics Cron
 * Supabase Edge Function: supabase/functions/daily-metrics-cron/index.ts
 *
 * Schedule in Supabase Dashboard → Database → Cron Jobs:
 *   Name:     daily-metrics
 *   Schedule: 0 8 * * *   (8am every day AEST = 22:00 UTC previous day)
 *   Command:  SELECT net.http_post(
 *               url := 'https://<project>.supabase.co/functions/v1/daily-metrics-cron',
 *               headers := '{"Authorization": "Bearer <anon_key>"}'::jsonb
 *             );
 *
 * Deploy: supabase functions deploy daily-metrics-cron
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0]; // YYYY-MM-DD

  const dayStart = `${dateStr}T00:00:00.000Z`;
  const dayEnd   = `${dateStr}T23:59:59.999Z`;

  try {
    // ── DAU (distinct users active yesterday) ─────────────────────────────
    const { count: dau } = await supabase
      .from("listings")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    // ── New users ─────────────────────────────────────────────────────────
    const { count: new_users } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    // ── New listings ──────────────────────────────────────────────────────
    const { count: new_listings } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    // ── Active listings ───────────────────────────────────────────────────
    const { count: active_listings } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    // ── Listings sold ─────────────────────────────────────────────────────
    const { count: listings_sold } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "sold")
      .gte("updated_at", dayStart)
      .lte("updated_at", dayEnd);

    // ── New conversations ─────────────────────────────────────────────────
    const { count: new_conversations } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    // ── New messages ──────────────────────────────────────────────────────
    const { count: new_messages } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    // ── Moderation flags today ────────────────────────────────────────────
    const { count: mod_flags_today } = await supabase
      .from("moderation_queue")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    // ── Mod queue pending (current) ───────────────────────────────────────
    const { count: mod_queue_pending } = await supabase
      .from("moderation_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // ── Liquidity rate ────────────────────────────────────────────────────
    // % of active listings that have ≥1 conversation
    const { data: activeListingIds } = await supabase
      .from("listings")
      .select("id")
      .eq("status", "active");

    const { data: listingsWithConvos } = await supabase
      .from("conversations")
      .select("listing_id")
      .not("listing_id", "is", null);

    const activeIds = new Set((activeListingIds || []).map((l: any) => l.id));
    const convoIds  = new Set((listingsWithConvos || []).map((c: any) => c.listing_id));
    const listingsWithConvoCount = [...activeIds].filter(id => convoIds.has(id)).length;
    const liquidity_rate = activeIds.size > 0
      ? Math.round((listingsWithConvoCount / activeIds.size) * 10000) / 100
      : 0;

    // ── Top categories by conversation count ──────────────────────────────
    const { data: convosByCategory } = await supabase
      .from("conversations")
      .select("listings(category)")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    const catCounts: Record<string, number> = {};
    (convosByCategory || []).forEach((c: any) => {
      const cat = c.listings?.category;
      if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const top_categories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // ── Anomaly detection ─────────────────────────────────────────────────
    const anomalies: Array<{ type: string; detail: string; severity: string }> = [];

    // Get yesterday's metrics for comparison
    const prevDate = new Date(yesterday);
    prevDate.setDate(yesterday.getDate() - 1);
    const { data: prevMetrics } = await supabase
      .from("daily_metrics")
      .select("dau, new_listings, mod_flags_today")
      .eq("date", prevDate.toISOString().split("T")[0])
      .single();

    if (prevMetrics) {
      // DAU drop > 40%
      if (prevMetrics.dau && (dau || 0) < prevMetrics.dau * 0.6) {
        anomalies.push({ type: "dau_drop", detail: `DAU dropped from ${prevMetrics.dau} to ${dau}`, severity: "high" });
      }
      // Mod flags spike > 3x
      if (prevMetrics.mod_flags_today && (mod_flags_today || 0) > prevMetrics.mod_flags_today * 3) {
        anomalies.push({ type: "mod_spike", detail: `Mod flags spiked: ${mod_flags_today} vs ${prevMetrics.mod_flags_today} yesterday`, severity: "high" });
      }
    }

    // Zero conversations on active listings (if >10 listings exist)
    if ((active_listings || 0) > 10 && (new_conversations || 0) === 0) {
      anomalies.push({ type: "zero_convos", detail: "No new conversations today despite active listings", severity: "medium" });
    }

    // Liquidity below 10%
    if (liquidity_rate < 10 && (active_listings || 0) > 20) {
      anomalies.push({ type: "low_liquidity", detail: `Liquidity rate at ${liquidity_rate}% — below 10% threshold`, severity: "medium" });
    }

    // ── Write to daily_metrics ────────────────────────────────────────────
    const { error } = await supabase
      .from("daily_metrics")
      .upsert({
        date: dateStr,
        dau:                dau                || 0,
        new_users:          new_users          || 0,
        new_listings:       new_listings       || 0,
        active_listings:    active_listings    || 0,
        listings_sold:      listings_sold      || 0,
        new_conversations:  new_conversations  || 0,
        new_messages:       new_messages       || 0,
        mod_flags_today:    mod_flags_today    || 0,
        mod_queue_pending:  mod_queue_pending  || 0,
        liquidity_rate,
        top_categories,
        anomalies,
      }, { onConflict: "date" });

    if (error) throw error;

    const summary = {
      date: dateStr,
      dau, new_users, new_listings, active_listings, listings_sold,
      new_conversations, new_messages, liquidity_rate,
      mod_flags_today, mod_queue_pending,
      anomalies_count: anomalies.length,
      anomalies,
    };

    console.log("[daily-metrics-cron]", JSON.stringify(summary));

    return new Response(JSON.stringify({ ok: true, ...summary }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[daily-metrics-cron] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
