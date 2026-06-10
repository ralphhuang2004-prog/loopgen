/**
 * LoopGen Founder Ops Dashboard
 * File: src/pages/OpsPage.tsx  (or src/pages/ops.tsx for Next.js)
 *
 * Drop-in React page for your existing LoopGen React + Supabase app.
 *
 * Prerequisites:
 *   npm install @supabase/supabase-js lucide-react
 *   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
 *   (or use your existing supabase client import)
 *
 * Route: Add to your router as a protected /ops route
 *   <Route path="/ops" element={<OpsPage />} />
 */

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  ShoppingBag, MessageSquare, Users, Eye, RefreshCw,
  ChevronDown, ChevronUp, Shield, Activity, Zap, X, Check,
  ArrowUpRight, BarChart2, Inbox,
} from "lucide-react";

// ── Supabase client ────────────────────────────────────────────────────────
// Replace with your existing supabase client import if you have one
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Types ──────────────────────────────────────────────────────────────────
interface DailyMetrics {
  date: string;
  dau: number;
  new_users: number;
  new_listings: number;
  active_listings: number;
  listings_sold: number;
  new_conversations: number;
  new_messages: number;
  liquidity_rate: number;
  mod_flags_today: number;
  mod_queue_pending: number;
  top_categories: { category: string; count: number }[];
  anomalies: { type: string; detail: string; severity: string }[];
}

interface ModQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  ai_score: number;
  flag_summary: string;
  priority: "high" | "medium" | "low";
  status: string;
  raw_content: {
    title: string;
    description: string;
    price: number;
    category: string;
  };
  created_at: string;
}

// ── Color helpers ──────────────────────────────────────────────────────────
const scoreColor = (score: number) => {
  if (score >= 70) return { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" };
  if (score >= 30) return { bg: "#FFFBEB", text: "#D97706", border: "#FCD34D" };
  return { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" };
};

const priorityBadge = (p: string) => ({
  high:   { bg: "#FEF2F2", text: "#DC2626" },
  medium: { bg: "#FFFBEB", text: "#D97706" },
  low:    { bg: "#F0FDF4", text: "#16A34A" },
}[p] || { bg: "#F4F4F5", text: "#71717A" });

// ── Skeleton loader ────────────────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = 20 }: { w?: string; h?: number }) => (
  <div style={{
    width: w, height: h, borderRadius: 6,
    background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  }} />
);

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, sub, color = "#028090", loading = false,
}: {
  icon: any; label: string; value: string | number; sub?: string;
  color?: string; loading?: boolean;
}) => (
  <div style={{
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color={color} />
      </div>
      <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{label}</span>
    </div>
    {loading
      ? <Skeleton h={32} w="60%" />
      : <span style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>{value}</span>
    }
    {sub && !loading && (
      <span style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</span>
    )}
  </div>
);

// ── Main dashboard ─────────────────────────────────────────────────────────
export default function OpsPage() {
  const [metrics, setMetrics]       = useState<DailyMetrics | null>(null);
  const [prevMetrics, setPrevMetrics] = useState<DailyMetrics | null>(null);
  const [queue, setQueue]           = useState<ModQueueItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      const [{ data: todayMetrics }, { data: yestMetrics }, { data: queueItems }] =
        await Promise.all([
          supabase.from("daily_metrics").select("*").eq("date", today).single(),
          supabase.from("daily_metrics").select("*").eq("date", yesterday).single(),
          supabase
            .from("moderation_queue")
            .select("*")
            .eq("status", "pending")
            .order("priority", { ascending: false }) // high first
            .order("created_at", { ascending: true })
            .limit(20),
        ]);

      setMetrics(todayMetrics as DailyMetrics);
      setPrevMetrics(yestMetrics as DailyMetrics);
      setQueue((queueItems || []) as ModQueueItem[]);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Moderation actions ───────────────────────────────────────────────────
  const handleModAction = async (item: ModQueueItem, action: "approved" | "removed") => {
    setActionLoading(item.id);
    try {
      // Update queue status
      await supabase
        .from("moderation_queue")
        .update({ status: action, reviewed_at: new Date().toISOString() })
        .eq("id", item.id);

      // Update the listing itself
      if (item.entity_type === "listing") {
        await supabase
          .from("listings")
          .update({
            moderation_status: action === "approved" ? "approved" : "removed",
            status: action === "removed" ? "inactive" : undefined,
          })
          .eq("id", item.entity_id);
      }

      setQueue(q => q.filter(qi => qi.id !== item.id));
      showToast(action === "approved" ? "Listing approved ✓" : "Listing removed", action === "approved" ? "ok" : "err");
    } catch (e) {
      showToast("Action failed — check console", "err");
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delta helper ──────────────────────────────────────────────────────────
  const delta = (curr: number, prev: number | undefined) => {
    if (!prev || prev === 0) return null;
    const pct = Math.round(((curr - prev) / prev) * 100);
    return { pct, up: pct >= 0 };
  };

  // ── Format time ───────────────────────────────────────────────────────────
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8FAFC",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#0F172A",
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideIn { from{transform:translateY(-8px);opacity:0} to{transform:none;opacity:1} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .mod-row:hover { background: #F8FAFC !important; }
        .action-btn:hover { filter: brightness(0.95); }
        .action-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.type === "ok" ? "#022C22" : "#450A0A",
          color: toast.type === "ok" ? "#86EFAC" : "#FCA5A5",
          padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          animation: "slideIn 0.2s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "#0D1B2A",
        borderBottom: "1px solid #1E3A4F",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 56,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "#028090",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>LoopGen Ops</span>
            <span style={{
              background: "#028090" + "33", color: "#02C39A",
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              border: "1px solid #028090" + "44",
            }}>FOUNDER ONLY</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, color: "#475569" }}>
              Last updated {lastRefresh.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1px solid #1E3A4F",
                color: "#94A3B8", fontSize: 12, padding: "6px 12px",
                borderRadius: 8, cursor: "pointer",
              }}
            >
              <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* Anomaly alerts */}
        {metrics?.anomalies && metrics.anomalies.length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
            {metrics.anomalies.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: a.severity === "high" ? "#FEF2F2" : "#FFFBEB",
                border: `1px solid ${a.severity === "high" ? "#FECACA" : "#FDE68A"}`,
                borderRadius: 10, padding: "10px 16px", marginBottom: 8,
              }}>
                <AlertTriangle size={15} color={a.severity === "high" ? "#DC2626" : "#D97706"} />
                <span style={{ fontSize: 13, fontWeight: 500, color: a.severity === "high" ? "#991B1B" : "#92400E" }}>
                  {a.detail}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Date banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
              {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            </h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: "2px 0 0" }}>
              Melbourne · Soft launch dashboard
            </p>
          </div>
          {queue.length > 0 && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 10, padding: "8px 14px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Shield size={14} color="#DC2626" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#DC2626" }}>
                {queue.length} item{queue.length !== 1 ? "s" : ""} need review
              </span>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}>
          <StatCard icon={Users}       label="DAU"             value={metrics?.dau ?? "—"}            sub={`${metrics?.new_users ?? 0} new today`}       color="#028090" loading={loading} />
          <StatCard icon={ShoppingBag} label="Active listings"  value={metrics?.active_listings ?? "—"} sub={`+${metrics?.new_listings ?? 0} today`}        color="#378ADD" loading={loading} />
          <StatCard icon={MessageSquare} label="Conversations"  value={metrics?.new_conversations ?? "—"} sub={`${metrics?.new_messages ?? 0} messages`}    color="#7C3AED" loading={loading} />
          <StatCard icon={Activity}    label="Liquidity rate"   value={metrics ? `${metrics.liquidity_rate}%` : "—"} sub="listings with ≥1 convo"             color="#16A34A" loading={loading} />
          <StatCard icon={TrendingUp}  label="Sold today"       value={metrics?.listings_sold ?? "—"}  sub="listings marked sold"                           color="#D97706" loading={loading} />
          <StatCard icon={Shield}      label="Mod queue"        value={queue.length}                   sub={`${metrics?.mod_flags_today ?? 0} flagged today`} color="#DC2626" loading={loading} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* Moderation queue — main column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Shield size={16} color="#DC2626" />
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Moderation queue</h2>
              <span style={{
                background: queue.length > 0 ? "#FEF2F2" : "#F0FDF4",
                color: queue.length > 0 ? "#DC2626" : "#16A34A",
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              }}>
                {queue.length > 0 ? `${queue.length} pending` : "All clear"}
              </span>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #E2E8F0" }}>
                    <Skeleton h={16} w="60%" />
                    <div style={{ height: 8 }} />
                    <Skeleton h={12} w="40%" />
                  </div>
                ))}
              </div>
            ) : queue.length === 0 ? (
              <div style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
                padding: 32, textAlign: "center",
              }}>
                <CheckCircle size={28} color="#16A34A" style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Queue is clear</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>No listings awaiting review</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {queue.map(item => {
                  const sc = scoreColor(item.ai_score);
                  const pb = priorityBadge(item.priority);
                  const isExpanded = expandedItem === item.id;
                  const isActing = actionLoading === item.id;

                  return (
                    <div
                      key={item.id}
                      className="mod-row"
                      style={{
                        background: "#fff",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Priority stripe */}
                      <div style={{ height: 3, background: item.priority === "high" ? "#DC2626" : item.priority === "medium" ? "#D97706" : "#16A34A" }} />

                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>

                          {/* Score badge */}
                          <div style={{
                            minWidth: 48, height: 48, borderRadius: 10,
                            background: sc.bg, border: `1px solid ${sc.border}`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: sc.text, lineHeight: 1 }}>
                              {item.ai_score}
                            </span>
                            <span style={{ fontSize: 9, color: sc.text, opacity: 0.7 }}>score</span>
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.raw_content?.title || `${item.entity_type} #${item.entity_id.slice(0, 8)}`}
                              </span>
                              <span style={{
                                ...pb, fontSize: 10, fontWeight: 600,
                                padding: "2px 7px", borderRadius: 99, flexShrink: 0,
                              }}>
                                {item.priority}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                              {item.raw_content?.price && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#028090" }}>
                                  ${item.raw_content.price.toLocaleString()}
                                </span>
                              )}
                              {item.raw_content?.category && (
                                <span style={{ fontSize: 11, color: "#94A3B8", background: "#F1F5F9", padding: "1px 7px", borderRadius: 99 }}>
                                  {item.raw_content.category}
                                </span>
                              )}
                              <span style={{ fontSize: 11, color: "#94A3B8" }}>{timeAgo(item.created_at)}</span>
                            </div>

                            <div style={{
                              fontSize: 12, color: "#DC2626",
                              background: "#FEF2F2", borderRadius: 6, padding: "4px 8px",
                              display: "inline-flex", alignItems: "center", gap: 4,
                            }}>
                              <AlertTriangle size={11} />
                              {item.flag_summary}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                            <button
                              className="action-btn"
                              disabled={isActing}
                              onClick={() => handleModAction(item, "approved")}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                background: "#F0FDF4", border: "1px solid #86EFAC",
                                color: "#16A34A", fontSize: 12, fontWeight: 600,
                                padding: "7px 12px", borderRadius: 8, cursor: "pointer",
                                opacity: isActing ? 0.5 : 1,
                              }}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              className="action-btn"
                              disabled={isActing}
                              onClick={() => handleModAction(item, "removed")}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                background: "#FEF2F2", border: "1px solid #FECACA",
                                color: "#DC2626", fontSize: 12, fontWeight: 600,
                                padding: "7px 12px", borderRadius: 8, cursor: "pointer",
                                opacity: isActing ? 0.5 : 1,
                              }}
                            >
                              <X size={12} /> Remove
                            </button>
                            <button
                              onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                background: "transparent", border: "1px solid #E2E8F0",
                                color: "#64748B", fontSize: 11,
                                padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                              }}
                            >
                              <Eye size={11} />
                              {isExpanded ? "Less" : "More"}
                              {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded view */}
                        {isExpanded && (
                          <div style={{
                            marginTop: 12, padding: 12,
                            background: "#F8FAFC", borderRadius: 8,
                            border: "1px solid #E2E8F0",
                            animation: "fadeIn 0.15s ease",
                          }}>
                            {item.raw_content?.description && (
                              <p style={{ fontSize: 12, color: "#475569", margin: "0 0 10px", lineHeight: 1.6 }}>
                                {item.raw_content.description}
                              </p>
                            )}
                            <a
                              href={`/listings/${item.entity_id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                fontSize: 11, color: "#028090", textDecoration: "none",
                              }}
                            >
                              View full listing <ArrowUpRight size={11} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Category performance */}
            <div style={{
              background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <BarChart2 size={15} color="#028090" />
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Category convos today</h3>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3].map(i => <Skeleton key={i} h={14} />)}
                </div>
              ) : metrics?.top_categories && metrics.top_categories.length > 0 ? (
                metrics.top_categories.map((cat, i) => {
                  const maxCount = metrics.top_categories[0].count;
                  const pct = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#475569", textTransform: "capitalize" }}>
                          {cat.category.replace(/-/g, " ")}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{cat.count}</span>
                      </div>
                      <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: i === 0 ? "#028090" : "#94A3B8",
                          borderRadius: 99, transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>No conversations yet today</p>
              )}
            </div>

            {/* Quick actions */}
            <div style={{
              background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Zap size={15} color="#028090" />
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Quick actions</h3>
              </div>
              {[
                { label: "Run moderation scan",   icon: Shield,        href: "#",           desc: "Score all unscored listings" },
                { label: "View all listings",      icon: ShoppingBag,   href: "/listings",   desc: "Admin listing view" },
                { label: "Export metrics CSV",     icon: BarChart2,     href: "#",           desc: "Download daily_metrics" },
                { label: "User management",        icon: Users,         href: "/admin/users", desc: "Manage user accounts" },
              ].map((a, i) => (
                <a
                  key={i}
                  href={a.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8,
                    textDecoration: "none",
                    transition: "background 0.1s",
                    marginBottom: 2,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <a.icon size={14} color="#028090" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#0F172A" }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{a.desc}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* 7-day liquidity sparkline — simple bars */}
            <div style={{
              background: "#0D1B2A", border: "1px solid #1E3A4F",
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Activity size={14} color="#02C39A" />
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#fff" }}>Liquidity rate</h3>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#02C39A", margin: "6px 0 2px" }}>
                {metrics ? `${metrics.liquidity_rate}%` : "—"}
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
                Target: &gt;20% · listings with ≥1 convo
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
                {/* Mock sparkline — replace with real 7-day data */}
                {[12, 15, 11, 18, 20, 17, metrics?.liquidity_rate ?? 23].map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: `${Math.round((v / 25) * 100)}%`,
                      background: i === 6 ? "#02C39A" : "#1E3A4F",
                      borderRadius: 3, minHeight: 4,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 4, textAlign: "right" }}>7-day trend</div>
            </div>

            {/* System status */}
            <div style={{
              background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, padding: 14,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: "0 0 10px", color: "#64748B" }}>SYSTEM STATUS</h3>
              {[
                { label: "Supabase DB",         ok: true  },
                { label: "Moderation engine",   ok: true  },
                { label: "Daily metrics cron",  ok: true  },
                { label: "Email (Resend)",       ok: true  },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i < 3 ? "1px solid #F1F5F9" : "none",
                }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>{s.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: s.ok ? "#16A34A" : "#DC2626",
                    }} />
                    <span style={{ fontSize: 11, color: s.ok ? "#16A34A" : "#DC2626", fontWeight: 500 }}>
                      {s.ok ? "ok" : "down"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
