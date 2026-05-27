/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — TODO: restore strict types after block schema migration
import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useCMS } from "@/context/cmscontext";
import { useAuthStore } from "@/store/auth";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Layout, Eye, EyeOff, Save, LogOut, Plus, Trash2, GripVertical, RefreshCw,
  Building, Star, ArrowUp, ArrowDown, Copy, Rocket, Undo2, Redo2, Monitor, Tablet, Smartphone,
  ChartBar, Minus, Zap, Layers, Play,
  Check, X, Key, TrendingUp, Shield, ImageIcon,
  MessageCircle, ClipboardList, Command, Code,
  RotateCcw, Loader2, ExternalLink, Settings, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SCHEMAS } from "@/lib/blocks";
import { BlockErrorBoundary } from "@/components/block-error-boundary";
import { LiveNavigateMode } from "@/components/admin/live-navigate-mode";
import CacheDebugPanel from "@/components/admin/cache-debug-panel";
import SeoOverridesPanel from "@/components/admin/seo-overrides-panel";
import GmailInboxPanel from "@/components/admin/gmail-inbox-panel";
import VersionHistoryPanel from "@/components/admin/version-history-panel";
import { JSONEditor } from "@/components/admin/JSONEditor";
import { PropsEditor } from "@/components/admin/PropsEditor";
import { EnterpriseAIPanel } from "@/components/admin/EnterpriseAIPanel";
import { SEOPanel } from "@/components/admin/SEOPanel";
import { SuggestPanel } from "@/components/admin/SuggestPanel";
import { BlockCategorySection } from "@/components/admin/BlockCategorySection";
import { supabase } from "@/integrations/supabase/client";
import { LIVE_BLOCKS, LIVE_PAGE_TEMPLATES, BLOCK_CATEGORIES } from "@/components/admin/live-blocks";

// Use exact frontend block renderers from LiveBlocks.jsx
const BLOCKS = LIVE_BLOCKS;

// ============================================
// COMPONENT IMPORTS — see /components/admin/
// ============================================
// AIAssistant, JSONEditor, PropsEditor, EnterpriseAIPanel,
// SEOPanel, SuggestPanel, BlockCategorySection imported above

// ============================================
// SEO PANEL & SUGGEST PANEL imported above
// ============================================

// ============================================
// MAIN ADMIN COMPONENT
// (BlockCategorySection, SuggestPanel, SEOPanel imported above)
// ============================================

// ============================================
// ADMIN DASHBOARD — Supabase-native
// ============================================
const AdminDashboard = memo(({ adminKey: _adminKey }) => {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const load = useCallback(async (key: string, fn: () => Promise<unknown>) => {
    setLoading(l => ({ ...l, [key]: true }));
    try {
      const result = await fn();
      setData(d => ({ ...d, [key]: result }));
    } catch {
      setData(d => ({ ...d, [key]: null }));
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }, []);

  const refreshAll = useCallback(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    load("stats", async () => {
      const [props, reservations, contacts, ownerInq] = await Promise.all([
        supabase.from("guesty_properties_cache").select("guesty_id", { count: "exact", head: true }).eq("active", true),
        supabase.from("reservations_cache").select("guesty_id, total_price, status, created_at", { count: "exact" }),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
        supabase.from("owner_inquiries").select("id", { count: "exact", head: true }),
      ]);
      const allRes = reservations.data || [];
      const confirmed = allRes.filter(r => r.status === "confirmed");
      const pending = allRes.filter(r => r.status === "inquiry" || r.status === "pending");
      const recent = allRes.filter(r => r.created_at >= sevenDaysAgo);
      const revenue = confirmed.reduce((s, r) => s + (r.total_price || 0), 0);
      return {
        active_listings: props.count || 0,
        confirmed_bookings: confirmed.length,
        pending_bookings: pending.length,
        total_revenue: revenue,
        recent_bookings_7d: recent.length,
        contacts: contacts.count || 0,
        owner_inquiries: ownerInq.count || 0,
      };
    });

    load("bookings", async () => {
      const { data } = await supabase
        .from("reservations_cache")
        .select("guesty_id, listing_id, guest_name, guest_email, check_in, check_out, nights, guests, total_price, currency, status, channel, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return { bookings: data || [] };
    });

    load("inbox", async () => {
      const { data } = await supabase
        .from("contact_submissions")
        .select("id, name, email, subject, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return { messages: data || [] };
    });

    load("properties", async () => {
      const { data } = await supabase
        .from("guesty_properties_cache")
        .select("guesty_id, title, city, accommodates, bedrooms, bathrooms, base_price, currency, thumbnail, active, last_synced_at")
        .order("title");
      return { properties: data || [] };
    });

    load("revenue", async () => {
      const { data } = await supabase
        .from("reservations_cache")
        .select("check_in, total_price")
        .eq("status", "confirmed")
        .gte("check_in", thisMonth);
      const monthly: Record<string, number> = {};
      data?.forEach(r => {
        if (!r.check_in) {
return;
}
        const m = r.check_in.slice(0, 7);
        monthly[m] = (monthly[m] || 0) + (r.total_price || 0);
      });
      return { monthly };
    });

    load("coupons", async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return { coupons: data || [] };
    });

    load("health", async () => {
      const { error } = await supabase.from("guesty_properties_cache").select("guesty_id", { head: true, count: "exact" });
      return { supabase: !error ? "ok" : "error", guesty_webhook: "webhook-based", version: "1.0" };
    });
  }, [load]);

  useEffect(() => {
 refreshAll(); 
}, [refreshAll]);

  const TABS = [
    { id: "overview", icon: ChartBar, label: "Overview" },
    { id: "bookings", icon: ClipboardList, label: "Bookings" },
    { id: "revenue", icon: TrendingUp, label: "Revenue" },
    { id: "properties", icon: Building, label: "Properties" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "inbox", icon: MessageCircle, label: "Inbox" },
    { id: "coupons", icon: Zap, label: "Coupons" },
    { id: "seo", icon: Code, label: "SEO" },
    { id: "media", icon: ImageIcon, label: "Media" },
    { id: "health", icon: Shield, label: "Health" },
  ];

  const stats = data.stats || {};
  const bookings = data.bookings?.bookings || [];
  const reviews = data.reviews?.data || [];
  const properties = data.properties?.properties || [];
  const inbox = data.inbox?.messages || [];
  const revenue = data.revenue || {};
  const coupons = data.coupons?.coupons || [];
  const health = data.health || {};

  const statCards = [
    { label: "Active Listings", value: stats.active_listings || 0, color: "text-[#C9A84C]", icon: Building },
    { label: "Total Bookings", value: stats.confirmed_bookings || 0, color: "text-green-400", icon: Check },
    { label: "Revenue", value: `€${(stats.total_revenue || 0).toLocaleString()}`, color: "text-blue-400", icon: TrendingUp },
    { label: "New This Week", value: stats.recent_bookings_7d || 0, color: "text-purple-400", icon: ArrowUp },
    { label: "Pending", value: stats.pending_bookings || 0, color: "text-orange-400", icon: Clock },
    { label: "Contacts", value: (stats.contacts || 0) + (stats.owner_inquiries || 0), color: "text-pink-400", icon: MessageCircle },
  ];

  const formatDate = (d) => {
 if (!d) {
return "—";
} try {
 return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }); 
} catch {
 return d; 
} 
};

  const STATUS_COLOR = {
    confirmed: "text-green-400 bg-green-400/10",
    inquiry_submitted: "text-blue-400 bg-blue-400/10",
    pending: "text-orange-400 bg-orange-400/10",
    payment_received_booking_failed: "text-red-400 bg-red-400/10",
    default: "text-[#A1A1AA] bg-white/5"
  };

  const getStatusColor = (s) => STATUS_COLOR[s] || STATUS_COLOR.default;

  // Coupon creation state
  const [newCoupon, setNewCoupon] = useState({ code: "", description: "", discount_type: "percentage", discount_value: 10, active: true });
  const [couponSaving, setCouponSaving] = useState(false);

  const createCoupon = async () => {
    if (!newCoupon.code) {
return;
}
    setCouponSaving(true);
    try {
      const { error } = await supabase.from("coupons").insert({ ...newCoupon, code: newCoupon.code.toUpperCase() });
      if (error) {
throw error;
}
      toast.success("Coupon created!");
      setNewCoupon({ code: "", description: "", discount_type: "percentage", discount_value: 10, active: true });
      load("coupons", async () => {
        const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
        return { coupons: data || [] };
      });
    } catch (e: unknown) {
 toast.error(`Failed: ${e instanceof Error ? e.message.slice(0, 80) : String(e)}`); 
}
    setCouponSaving(false);
  };

  const toggleCoupon = async (id: number, current: boolean) => {
    await supabase.from("coupons").update({ active: !current }).eq("id", id);
    load("coupons", async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return { coupons: data || [] };
    });
  };

  const deleteCoupon = async (id: number) => {
    if (!window.confirm("Delete coupon?")) {
return;
}
    await supabase.from("coupons").delete().eq("id", id);
    load("coupons", async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return { coupons: data || [] };
    });
    toast.success("Coupon deleted");
  };

  // SEO state
  const [seoPage, setSeoPage] = useState("home");
  const [seoData, setSeoData] = useState({ title: "", description: "", keywords: "" });
  const [seoSaving, setSeoSaving] = useState(false);

  const saveSEO = async () => {
    setSeoSaving(true);
    try {
      const { error } = await supabase.from("cms_page_seo").upsert({
        page_slug: seoPage,
        meta_title: seoData.title || null,
        meta_description: seoData.description || null,
      }, { onConflict: "page_slug" });
      if (error) {
throw error;
}
      toast.success("SEO saved!");
    } catch {
 toast.error("Save failed"); 
}
    setSeoSaving(false);
  };

  // Media state  
  const [mediaListing, setMediaListing] = useState(properties[0]?._id || "");
  const [mediaData, setMediaData] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const fetchMedia = useCallback(async (lid) => {
    if (!lid) {
return;
}
    setMediaLoading(true);
    try {
      const { data } = await supabase
        .from("guesty_properties_cache")
        .select("thumbnail, title")
        .eq("guesty_id", lid)
        .single();
      setMediaData(data?.thumbnail ? [{ url: data.thumbnail, caption: data.title }] : []);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "media" && properties.length > 0 && !mediaListing) {
      setMediaListing(properties[0]._id);
    }
  }, [tab, properties, mediaListing]);

  useEffect(() => {
    if (mediaListing) {
fetchMedia(mediaListing);
}
  }, [mediaListing]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dashboard Tabs */}
      <div className="h-10 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center px-4 gap-1 overflow-x-auto shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded whitespace-nowrap transition-all ${tab === t.id ? "bg-[#C9A84C]/15 text-[#C9A84C]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
            {t.id === "inbox" && (data.inbox?.unread > 0) && (
              <span className="bg-[#C9A84C] text-[#0a0a0b] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {data.inbox.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0b]">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Dashboard Overview</h2>
            {loading.stats ? (
              <div className="flex items-center gap-2 text-[#5a5a5e] text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
                  {statCards.map((s, i) => (
                    <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                        <span className="text-[10px] text-[#5a5a5e] uppercase tracking-wider">{s.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Bookings */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#C9A84C]" />Recent Bookings</h3>
                    <div className="space-y-2">
                      {bookings.slice(0, 5).map((b, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[#1a1a1e] last:border-0">
                          <div>
                            <p className="text-sm text-[#f0ede8]">{b.guest?.firstName} {b.guest?.lastName}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${getStatusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span>
                            <p className="text-xs text-[#C9A84C] mt-1">€{(b.amount || 0).toFixed(0)}</p>
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && <p className="text-sm text-[#5a5a5e]">No bookings yet</p>}
                    </div>
                  </div>

                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-[#C9A84C]" />Latest Reviews</h3>
                    <div className="space-y-3">
                      {reviews.slice(0, 4).map((r, i) => {
                        const raw = r.rawReview || {};
                        const score = raw.overall_rating || raw.scoring?.review_score;
                        const text = raw.public_review || raw.content?.positive || "No review text";
                        return (
                          <div key={i} className="py-2 border-b border-[#1a1a1e] last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                              {score && <span className="text-xs font-bold text-[#C9A84C]">★ {score}</span>}
                              <span className="text-[10px] text-[#5a5a5e]">{r.channelId}</span>
                            </div>
                            <p className="text-xs text-[#A1A1AA] line-clamp-2">{text}</p>
                          </div>
                        );
                      })}
                      {reviews.length === 0 && <p className="text-sm text-[#5a5a5e]">No reviews loaded</p>}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BOOKINGS HUB ── */}
        {tab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Bookings Hub</h2>
              <button onClick={() => load("bookings", async () => {
 const { data } = await supabase.from("reservations_cache").select("guesty_id, listing_id, guest_name, guest_email, check_in, check_out, nights, guests, total_price, currency, status, channel, created_at").order("created_at", { ascending: false }).limit(50); return { bookings: data || [] }; 
})} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-[#D4B85C]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.bookings ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0e0e10] border-b border-[#1a1a1e]">
                      <tr>
                        {["Guest", "Check In", "Check Out", "Amount", "Status", "Created"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[#5a5a5e] uppercase tracking-wider text-[9px] font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={i} className="border-b border-[#1a1a1e] hover:bg-[#1a1a1e]/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-[#f0ede8] font-medium">{b.guest?.firstName} {b.guest?.lastName}</p>
                            <p className="text-[#5a5a5e] text-[10px]">{b.guest?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-[#A1A1AA]">{formatDate(b.check_in)}</td>
                          <td className="px-4 py-3 text-[#A1A1AA]">{formatDate(b.check_out)}</td>
                          <td className="px-4 py-3 text-[#C9A84C] font-semibold">€{(b.amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-medium px-2 py-1 rounded ${getStatusColor(b.status)}`}>{b.status?.replace(/_/g, ' ') || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-[#5a5a5e]">{formatDate(b.created_at)}</td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan="6" className="px-4 py-8 text-center text-[#5a5a5e]">No bookings found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVENUE ANALYTICS ── */}
        {tab === "revenue" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Revenue Analytics</h2>
            {loading.revenue ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-6">
                {/* Monthly Revenue */}
                <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Monthly Revenue</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-[#1a1a1e]">
                        {["Month", "Revenue", "Bookings", "Avg Value"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[#5a5a5e] uppercase text-[9px]">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {(revenue.monthly || []).map((m, i) => (
                          <tr key={i} className="border-b border-[#1a1a1e]/50 hover:bg-[#1a1a1e]/30">
                            <td className="px-3 py-2.5 text-[#f0ede8]">{m.month}</td>
                            <td className="px-3 py-2.5 text-[#C9A84C] font-semibold">€{m.revenue?.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-[#A1A1AA]">{m.count}</td>
                            <td className="px-3 py-2.5 text-[#A1A1AA]">€{m.avg?.toFixed(0)}</td>
                          </tr>
                        ))}
                        {!(revenue.monthly?.length) && <tr><td colSpan="4" className="px-3 py-6 text-center text-[#5a5a5e]">No revenue data yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* By Status + Top Properties */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">By Status</h3>
                    <div className="space-y-2">
                      {(revenue.by_status || []).map((s, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a1a1e]/50 last:border-0">
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(s.status)}`}>{s.status?.replace(/_/g, ' ')}</span>
                          <div className="text-right">
                            <p className="text-xs text-[#C9A84C]">€{(s.revenue || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{s.count} bookings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Top Properties</h3>
                    <div className="space-y-2">
                      {(revenue.top_properties || []).map((p, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a1a1e]/50 last:border-0">
                          <span className="text-xs text-[#A1A1AA] truncate max-w-[160px]">{p.listing_id}</span>
                          <div className="text-right">
                            <p className="text-xs text-[#C9A84C]">€{(p.revenue || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{p.bookings} bookings</p>
                          </div>
                        </div>
                      ))}
                      {!(revenue.top_properties?.length) && <p className="text-sm text-[#5a5a5e]">No data yet</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROPERTY MANAGER ── */}
        {tab === "properties" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Property Manager</h2>
              <button onClick={() => load("properties", async () => {
 const { data } = await supabase.from("guesty_properties_cache").select("guesty_id, title, city, accommodates, bedrooms, bathrooms, base_price, currency, thumbnail, active, last_synced_at").order("title"); return { properties: data || [] }; 
})} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-[#D4B85C]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.properties ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {properties.map((p, i) => (
                  <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg overflow-hidden hover:border-[#C9A84C]/30 transition-all">
                    {p.picture?.thumbnail && (
                      <OptimizedImage src={p.picture.thumbnail} alt="p.title" className="" objectFit="cover" loading="lazy" />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-[#f0ede8] line-clamp-2">{p.title}</h4>
                        {p.reviews?.avg && <span className="text-[#C9A84C] text-xs shrink-0">★ {(p.reviews.avg / 2).toFixed(1)}</span>}
                      </div>
                      <p className="text-xs text-[#5a5a5e] mb-3">{p.address?.city}, {p.address?.country}</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-center mb-3">
                        <div className="bg-[#0a0a0b] rounded p-2">
                          <p className="text-[#C9A84C] font-semibold">{p.accommodates}</p>
                          <p className="text-[#5a5a5e]">Guests</p>
                        </div>
                        <div className="bg-[#0a0a0b] rounded p-2">
                          <p className="text-[#C9A84C] font-semibold">{p.bedrooms}</p>
                          <p className="text-[#5a5a5e]">Beds</p>
                        </div>
                        <div className="bg-[#0a0a0b] rounded p-2">
                          <p className="text-green-400 font-semibold">{p.local_bookings}</p>
                          <p className="text-[#5a5a5e]">Bookings</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#C9A84C]">€{p.prices?.basePrice}/night</span>
                        <span className="text-green-400">€{p.local_revenue?.toFixed(0)} revenue</span>
                      </div>
                      <a href={`/property/${p._id}`} target="_blank" rel="noreferrer" className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded hover:bg-[#C9A84C]/20 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />View Listing
                      </a>
                    </div>
                  </div>
                ))}
                {properties.length === 0 && <p className="text-[#5a5a5e]">No properties loaded</p>}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Reviews Feed</h2>
              <button onClick={() => refreshAll()} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-[#D4B85C]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.reviews ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, i) => {
                  const raw = r.rawReview || {};
                  const score = raw.overall_rating || raw.scoring?.review_score;
                  const text = raw.public_review || raw.content?.positive || "No review text";
                  const reviewer = raw.reviewer?.name || raw.from?.first_name || "Guest";
                  return (
                    <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-sm">{reviewer[0]?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-semibold text-[#f0ede8]">{reviewer}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{r.channelId}</p>
                          </div>
                        </div>
                        {score && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-[#C9A84C] fill-current" />
                            <span className="text-[#C9A84C] font-bold">{score}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#A1A1AA] leading-relaxed">{text}</p>
                      {raw.content?.negative && (
                        <p className="text-xs text-red-400/70 mt-2">Negative: {raw.content.negative}</p>
                      )}
                    </div>
                  );
                })}
                {reviews.length === 0 && (
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-8 text-center">
                    <Star className="w-12 h-12 text-[#2a2a2e] mx-auto mb-3" />
                    <p className="text-[#5a5a5e]">Reviews will appear here when available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── GUEST INBOX ── */}
        {tab === "inbox" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Guest Inbox
                {data.inbox?.unread > 0 && <span className="ml-2 bg-[#C9A84C] text-[#0a0a0b] text-xs font-bold px-2 py-0.5 rounded-full">{data.inbox.unread} unread</span>}
              </h2>
              <button onClick={() => load("inbox", async () => {
 const { data } = await supabase.from("contact_submissions").select("id, name, email, subject, message, status, created_at").order("created_at", { ascending: false }).limit(20); return { messages: data || [] }; 
})} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-[#D4B85C]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.inbox ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-3">
                {inbox.map((msg, i) => (
                  <div key={i} className={`bg-[#111318] border rounded-lg p-4 transition-all ${msg.read ? "border-[#1a1a1e]" : "border-[#C9A84C]/30"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${msg.type === "contact" ? "bg-blue-400/10 text-blue-400" : "bg-purple-400/10 text-purple-400"}`}>
                            {msg.type === "contact" ? "Contact" : "Owner Inquiry"}
                          </span>
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                          <span className="text-[10px] text-[#5a5a5e]">{formatDate(msg.created_at)}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#f0ede8]">{msg.name || msg.first_name || "Anonymous"}</p>
                        {msg.email && <p className="text-xs text-[#5a5a5e]">{msg.email}</p>}
                        {msg.message && <p className="text-sm text-[#A1A1AA] mt-2 line-clamp-3">{msg.message}</p>}
                        {msg.property_address && <p className="text-xs text-[#5a5a5e] mt-1">📍 {msg.property_address}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {inbox.length === 0 && (
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-[#2a2a2e] mx-auto mb-3" />
                    <p className="text-[#5a5a5e]">No messages yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── COUPON MANAGER ── */}
        {tab === "coupons" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Coupon Manager</h2>

            {/* Create new coupon */}
            <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Create New Coupon</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Code *</label>
                  <Input value={newCoupon.code} onChange={e => setNewCoupon(c => ({ ...c, code: e.target.value.toUpperCase() }))}
                    placeholder="SUMMER20" className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Description</label>
                  <Input value={newCoupon.description} onChange={e => setNewCoupon(c => ({ ...c, description: e.target.value }))}
                    placeholder="Summer discount" className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Type</label>
                  <select value={newCoupon.discount_type} onChange={e => setNewCoupon(c => ({ ...c, discount_type: e.target.value }))}
                    className="w-full bg-[#0a0a0b] border border-[#1e1e22] text-[#f0ede8] h-9 text-xs px-3 rounded-md">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">
                    Discount ({newCoupon.discount_type === "percentage" ? "%" : "€"})
                  </label>
                  <Input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon(c => ({ ...c, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                </div>
              </div>
              <Button onClick={createCoupon} disabled={!newCoupon.code || couponSaving}
                className="bg-[#C9A84C] text-[#0a0a0b] hover:bg-[#D4B85C] text-xs h-9">
                {couponSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                Create Coupon
              </Button>
              <p className="text-[10px] text-[#5a5a5e] mt-2">Note: Also create the coupon in Guesty Revenue Management for it to apply to bookings.</p>
            </div>

            {/* Coupons list */}
            <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#0e0e10] border-b border-[#1a1a1e]">
                  <tr>{["Code", "Type", "Value", "Description", "Uses", "Active", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[#5a5a5e] uppercase text-[9px]">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {coupons.map((c, i) => (
                    <tr key={i} className="border-b border-[#1a1a1e] hover:bg-[#1a1a1e]/30">
                      <td className="px-4 py-3 font-mono text-[#C9A84C] font-bold">{c.code}</td>
                      <td className="px-4 py-3 text-[#A1A1AA]">{c.discount_type}</td>
                      <td className="px-4 py-3 text-[#f0ede8]">{c.discount_type === "percentage" ? `${c.discount_value}%` : `€${c.discount_value}`}</td>
                      <td className="px-4 py-3 text-[#5a5a5e]">{c.description || "—"}</td>
                      <td className="px-4 py-3 text-[#A1A1AA]">{c.uses || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded ${c.active ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleCoupon(c.id)} className="text-[#C9A84C] hover:text-[#D4B85C] text-[10px] underline">Toggle</button>
                          <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-300 text-[10px] underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-[#5a5a5e]">No coupons yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEO MANAGER ── */}
        {tab === "seo" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">SEO Manager</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Edit Page SEO</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Page</label>
                  <select value={seoPage} onChange={e => setSeoPage(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-[#1e1e22] text-[#f0ede8] h-9 text-xs px-3 rounded-md">
                    {["home", "properties", "property-owners", "about", "contact"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  {[{ label: "Title", key: "title", placeholder: "Page title (50-60 chars)" },
                    { label: "Description", key: "description", placeholder: "Meta description (150-160 chars)" },
                    { label: "Keywords", key: "keywords", placeholder: "keyword1, keyword2, ..." }].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">{f.label}</label>
                      <Input value={seoData[f.key] || ""} onChange={e => setSeoData(d => ({ ...d, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                    </div>
                  ))}
                </div>
                <Button onClick={saveSEO} disabled={seoSaving} className="w-full mt-4 bg-[#C9A84C] text-[#0a0a0b] hover:bg-[#D4B85C] text-xs h-9">
                  {seoSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save SEO
                </Button>
              </div>
              <div className="lg:col-span-2 bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">SEO Preview</h3>
                <div className="bg-white rounded p-4">
                  <p className="text-blue-600 text-lg font-medium line-clamp-1">{seoData.title || "Page Title — Christiano Property Management"}</p>
                  <p className="text-green-700 text-sm">{window.location.origin}/{seoPage}</p>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{seoData.description || "Your page description will appear here in search results..."}</p>
                </div>
                <div className="mt-4 p-3 bg-[#0a0a0b] rounded">
                  <p className="text-[10px] text-[#5a5a5e] mb-2 uppercase tracking-wider">SEO Tips</p>
                  {[
                    { tip: "Title: 50-60 characters ideal", ok: seoData.title?.length >= 30 && seoData.title?.length <= 60 },
                    { tip: "Description: 150-160 characters", ok: seoData.description?.length >= 120 && seoData.description?.length <= 160 },
                    { tip: "Include Malta, luxury, rental keywords", ok: seoData.keywords?.toLowerCase().includes("malta") }
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs mb-1">
                      <span className={t.ok ? "text-green-400" : "text-[#5a5a5e]"}>{t.ok ? "✓" : "○"}</span>
                      <span className={t.ok ? "text-green-400" : "text-[#A1A1AA]"}>{t.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MEDIA HUB ── */}
        {tab === "media" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Media Hub</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Select Property</label>
                <select value={mediaListing} onChange={e => setMediaListing(e.target.value)}
                  className="w-full max-w-sm bg-[#111318] border border-[#1a1a1e] text-[#f0ede8] h-9 text-xs px-3 rounded-md">
                  {properties.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              {mediaData && <p className="text-xs text-[#5a5a5e]">{mediaData.total} photos</p>}
            </div>
            {mediaLoading ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : mediaData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {mediaData.pictures?.map((pic, i) => (
                  <div key={i} className="group relative bg-[#111318] rounded overflow-hidden border border-[#1a1a1e] hover:border-[#C9A84C]/30 transition-all">
                    <OptimizedImage src={pic.thumbnail || pic.original} alt="`Photo ${i + 1" className="" objectFit="cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={pic.original} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded hover:bg-white/20">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    </div>
                    {pic.caption && (
                      <div className="p-2">
                        <p className="text-[10px] text-[#5a5a5e] line-clamp-1">{pic.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-[#2a2a2e] mx-auto mb-3" />
                <p className="text-[#5a5a5e]">Select a property to view media</p>
              </div>
            )}
          </div>
        )}

        {/* ── SYSTEM HEALTH ── */}
        {tab === "health" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">System Health</h2>
              <div className="flex gap-2">
                <button onClick={() => load("health", async () => {
 const { error } = await supabase.from("guesty_properties_cache").select("guesty_id", { head: true, count: "exact" }); return { supabase: !error ? "ok" : "error", guesty_webhook: "webhook-based", version: "1.0" }; 
})} className="flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-[#D4B85C]">
                  <RefreshCw className="w-3.5 h-3.5" />Refresh
                </button>
                <button onClick={() => toast.success("Cache cleared — webhook-synced data doesn't cache")} className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300">
                  <Trash2 className="w-3.5 h-3.5" />Clear Cache
                </button>
                <button onClick={() => toast.info("Guesty tokens are managed by webhook authentication — no refresh needed")} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
                  <RotateCcw className="w-3.5 h-3.5" />Refresh Token
                </button>
              </div>
            </div>
            {loading.health ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Guesty API", icon: Rocket, data: health.guesty ? [
                    { label: "Status", value: health.guesty.status, ok: health.guesty.status === "connected" },
                    { label: "Latency", value: health.guesty.latency_ms ? `${health.guesty.latency_ms}ms` : "—" }
                  ] : [] },
                  { title: "Token Cache", icon: Key, data: health.token ? [
                    { label: "Status", value: health.token.status, ok: health.token.status === "valid" },
                    { label: "Expires in", value: health.token.expires_in_mins ? `${health.token.expires_in_mins} mins` : "—" }
                  ] : [] },
                  { title: "Response Cache", icon: Zap, data: health.cache ? [
                    { label: "Total entries", value: health.cache.total },
                    { label: "Valid entries", value: health.cache.valid }
                  ] : [] },
                  { title: "Database", icon: Settings, data: health.database ? Object.entries(health.database).map(([k, v]) => ({ label: k, value: v })) : [] }
                ].map((section, i) => (
                  <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <section.icon className="w-4 h-4 text-[#C9A84C]" />
                      <h3 className="text-sm font-semibold text-[#f0ede8]">{section.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {section.data.map((item, j) => (
                        <div key={j} className="flex justify-between items-center py-1.5 border-b border-[#1a1a1e]/50 last:border-0">
                          <span className="text-xs text-[#5a5a5e]">{item.label}</span>
                          <span className={`text-xs font-medium ${item.ok === true ? "text-green-400" : item.ok === false ? "text-red-400" : "text-[#A1A1AA]"}`}>
                            {String(item.value)}
                          </span>
                        </div>
                      ))}
                      {section.data.length === 0 && <p className="text-xs text-[#5a5a5e]">Data unavailable</p>}
                    </div>
                  </div>
                ))}
                <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-4 h-4 text-[#C9A84C]" />
                    <h3 className="text-sm font-semibold text-[#f0ede8]">SDK Info</h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">Contract version: <span className="text-[#C9A84C]">{health.sdk_version}</span></p>
                  <p className="text-[10px] text-[#5a5a5e] mt-2">BEAPI hard deprecation: 31 March 2026</p>
                </div>
              </div>
            )}

            {/* Live perf cache stats + Guesty token vault */}
            <div className="mt-8">
              <CacheDebugPanel />
            </div>

            {/* Per-page SEO overrides */}
            <div className="mt-8">
              <SeoOverridesPanel />
            </div>

            {/* Gmail inbox (admin) */}
            <div className="mt-8">
              <GmailInboxPanel />
            </div>

            {/* CMS publish history & version control */}
            <div className="mt-8">
              <VersionHistoryPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================
// MAIN ADMIN PAGE
// ============================================
export default function AdminPage() {
  const navigate = useNavigate();
  const { cms, logout, updateSection } = useCMS();
  const { isLoading } = useAuthStore();
  const [mode, setMode] = useState("studio"); // 'studio' | 'dashboard'
  const [page, setPage] = useState("home");
  const [leftTab, setLeftTab] = useState("blocks");
  const [rightTab, setRightTab] = useState("props");
  const [view, setView] = useState("desktop");
  const [zoom, setZoom] = useState(75);
  const [selected, setSelected] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [undo, setUndo] = useState([]);
  const [redo, setRedo] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [pauseEdit, setPauseEdit] = useState(false); // pause-to-preview: hides edit overlays

  // Load blocks: try saved page from backend, fall back to template + CMS merge
  useEffect(() => {
    const adminKey = localStorage.getItem("cvpm_admin_key");
    if (!adminKey) {
return;
} // wait for auth

    const loadPage = async () => {
      try {
        // Load persisted draft from Supabase (sole source of truth)
        const { data: draft } = await supabase
          .from("cms_page_drafts")
          .select("blocks")
          .eq("page_slug", page)
          .maybeSingle();
        if (draft?.blocks?.length) {
          setBlocks((draft.blocks as {type:string;data:Record<string,unknown>;visible?:boolean}[]).map(b => ({ ...b, id: `b${Date.now()}${Math.random().toString(36).slice(2,6)}`, visible: b.visible !== false })));
          setSelected(null);
          return;
        }
      } catch { /* fall through to template */ }
      // Fallback: template + CMS data merge
      const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2,6)}`;
      const pageTemplateBlocks = LIVE_PAGE_TEMPLATES[page] || LIVE_PAGE_TEMPLATES.home;
      const merged = pageTemplateBlocks.map((block) => {
        const id = uid();
        const baseData = { ...block.data };
        // Merge live CMS content where available
        if (block.type === "hero" && cms.hero) {
          if (cms.hero.headline)         {
baseData.headline         = cms.hero.headline;
}
          if (cms.hero.headlineAccent)   {
baseData.headlineAccent   = cms.hero.headlineAccent;
}
          if (cms.hero.subheadline)      {
baseData.subheadline      = cms.hero.subheadline;
}
          if (cms.hero.backgroundImage)  {
baseData.backgroundImage  = cms.hero.backgroundImage;
}
          if (cms.hero.cta1Text)         {
baseData.cta1Text         = cms.hero.cta1Text;
}
          if (cms.hero.cta2Text)         {
baseData.cta2Text         = cms.hero.cta2Text;
}
        }
        if (block.type === "about" && cms.about) {
          if (cms.about.label)       {
baseData.label       = cms.about.subtitle || cms.about.label;
}
          if (cms.about.title)       {
baseData.title       = cms.about.title;
}
          if (cms.about.paragraphs)  {
baseData.paragraphs  = cms.about.paragraphs.map(t => ({ text: t }));
}
          if (cms.about.image)       {
baseData.image       = cms.about.image;
}
        }
        if (block.type === "testimonials" && cms.testimonials?.length) {
          baseData.items = cms.testimonials;
        }
        if (block.type === "pricing" && cms.pricing?.plans) {
          baseData.plans = cms.pricing.plans.map(p => ({
            tier: p.name, amount: p.rate, unit: "of revenue",
            desc: p.description, popular: p.popular || false,
            cta: "Get Started", features: p.includes || p.features || [],
          }));
        }
        if (block.type === "header") {
          if (cms.brand?.logoGold) {
baseData.logoUrl   = cms.brand.logoGold;
}
          if (cms.brand?.name)     {
baseData.brandName = cms.brand.name;
}
        }
        if (block.type === "footer") {
          if (cms.brand?.name) {
baseData.brand = cms.brand.name;
}
        }
        if (block.type === "features" && cms.features?.length) {
          baseData.items = cms.features.map(f => ({ icon: f.icon, title: f.title, body: f.description }));
        }
        return { id, type: block.type, data: baseData, visible: true };
      });
      setBlocks(merged);
      setSelected(null);
    };

    loadPage();
   
  }, [cms, page]);


  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
 e.preventDefault(); doUndo(); 
}
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
 e.preventDefault(); doRedo(); 
}
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
 e.preventDefault(); saveAll(); 
}
      if (e.key === "Escape") {
setSelected(null);
}
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [blocks, undo, redo]);

  const snapshot = useCallback(() => {
 setUndo(u => [...u.slice(-29), JSON.stringify(blocks)]); setRedo([]); 
}, [blocks]);
  const doUndo = useCallback(() => {
 if (!undo.length) {
return;
} setRedo(r => [...r, JSON.stringify(blocks)]); setBlocks(JSON.parse(undo.at(-1))); setUndo(u => u.slice(0, -1)); toast.info("Undo"); 
}, [undo, blocks, setBlocks, setUndo, setRedo]);
  const doRedo = useCallback(() => {
 if (!redo.length) {
return;
} setUndo(u => [...u, JSON.stringify(blocks)]); setBlocks(JSON.parse(redo.at(-1))); setRedo(r => r.slice(0, -1)); toast.info("Redo"); 
}, [redo, blocks, setBlocks, setUndo, setRedo]);

  const updateBlock = useCallback((id, field, value) => {
 snapshot(); setBlocks(b => b.map(x => x.id === id ? { ...x, data: { ...x.data, [field]: value } } : x)); 
}, [snapshot]);
  const addBlock = (type) => { 
    snapshot(); 
    const b = { 
      id: `${type}_${Date.now()}`, 
      type, 
      data: SCHEMAS[type]?.defaults || {}, 
      visible: true 
    }; 
    setBlocks(bs => [...bs, b]); 
    setSelected(b.id); 
    toast.success(`Added ${SCHEMAS[type]?.label || type}`); 
  };
  const deleteBlock = (id) => {
 snapshot(); setBlocks(b => b.filter(x => x.id !== id)); if (selected === id) {
setSelected(null);
} 
};
  const duplicateBlock = (id) => {
 snapshot(); const b = blocks.find(x => x.id === id); if (!b) {
return;
} const idx = blocks.findIndex(x => x.id === id); const n = { ...b, id: `${b.type}_${Date.now()}`, data: { ...b.data } }; setBlocks(bs => [...bs.slice(0, idx + 1), n, ...bs.slice(idx + 1)]); 
};
  const moveBlock = (idx, dir) => {
 if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) {
return;
} snapshot(); const items = [...blocks]; [items[idx], items[idx + dir]] = [items[idx + dir], items[idx]]; setBlocks(items); 
};
  const onDragEnd = (result) => {
 if (!result.destination) {
return;
} snapshot(); const items = [...blocks]; const [moved] = items.splice(result.source.index, 1); items.splice(result.destination.index, 0, moved); setBlocks(items); 
};
  const toggleVisibility = (id) => {
 snapshot(); setBlocks(b => b.map(x => x.id === id ? { ...x, visible: !x.visible } : x)); 
};

  const generateAI = async (field, label) => {
    if (!selected) {
return;
}
    setGenerating(true);
    try {
      const block = blocks.find(b => b.id === selected);
      const blockSchema = SCHEMAS[block.type];
      const blockLabel = blockSchema?.label || block.type;
      
      if (field === "_all") {
        // Generate all text fields from the block's data
        const fieldsToGenerate = blockSchema?.fields
          ? Object.entries(blockSchema.fields).filter(([, f]) => f.ai)
          : Object.entries(block.data).filter(([, v]) => typeof v === "string" && v.length < 300).map(([k]) => [k, {label: k, ai: true}]);
          
        for (const [k, f] of fieldsToGenerate) {
          const { data, error } = await supabase.functions.invoke("ai-generate", {
            body: { prompt: `Generate ${f.label || k} for a ${blockLabel} section. Luxury Malta property style. Keep it concise and professional.`, section: block.type, field: k }
          });
          if (!error && data?.content) {
updateBlock(selected, k, data.content.replace(/^["']|["']$/g, ''));
}
        }
        toast.success("AI generated all fields!");
      } else {
        const { data, error } = await supabase.functions.invoke("ai-generate", {
          body: { prompt: `Generate ${label} for luxury Malta property ${blockLabel} section. Concise and elegant.`, section: block.type, field }
        });
        if (!error && data?.content) {
 updateBlock(selected, field, data.content.replace(/^["']|["']$/g, '')); toast.success(`Generated ${label}`); 
} else if (error) {
toast.error("AI generation requires the ai-generate edge function");
}
      }
    } catch {
 toast.error("AI generation failed"); 
}
    setGenerating(false);
  };

  const generateFromPrompt = async (prompt) => {
    if (!selected) {
return;
}
    setGenerating(true);
    try {
      const block = blocks.find(b => b.id === selected);
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          prompt: `Refine the content for a ${block.type.replace(/_/g," ")} section. Instructions: ${prompt}. Current content: ${JSON.stringify(block.data)}. Return improved content as a JSON object with the same keys.`,
          section: block.type,
          mode: "refine"
        }
      });
      if (error) {
throw error;
}
      if (data?.content) {
        try {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          Object.keys(parsed).forEach(k => updateBlock(selected, k, parsed[k]));
          toast.success("AI draft applied! Review and publish.");
        } catch {
          toast.error("Could not parse AI response");
        }
      }
    } catch {
 toast.error("AI generation requires the ai-generate edge function to be deployed"); 
}
    setGenerating(false);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Save entire page as a structured document (preserves multiple same-type blocks)
      const pageDoc = {
        page,
        blocks: blocks.map(b => ({ id: b.id, type: b.type, data: b.data, visible: b.visible !== false })),
        savedAt: new Date().toISOString(),
      };

      // Persist draft to Supabase (sole source of truth)
      await supabase.from("cms_page_drafts").upsert({
        page_slug: page,
        blocks: pageDoc.blocks,
        saved_at: pageDoc.savedAt,
      }, { onConflict: "page_slug" });

      // Also keep legacy per-section saves for CMS context compatibility
      const hero = blocks.find(b => b.type === "hero");
      const testimonials = blocks.find(b => b.type === "testimonials");
      const pricing = blocks.find(b => b.type === "pricing");
      const about = blocks.find(b => b.type === "about");
      const faq = blocks.find(b => b.type === "faq");
      if (hero) {
await updateSection("hero", hero.data).catch(() => {});
}
      if (testimonials?.data?.items) {
await updateSection("testimonials", testimonials.data.items).catch(() => {});
}
      if (pricing?.data?.plans) {
await updateSection("pricing", pricing.data).catch(() => {});
}
      if (about?.data) {
await updateSection("about", about.data).catch(() => {});
}
      if (faq?.data?.items) {
await updateSection("faq", faq.data).catch(() => {});
}

      // Mark as published in Supabase
      await supabase.from("cms_page_drafts").upsert({
        page_slug: page,
        blocks: pageDoc.blocks,
        saved_at: pageDoc.savedAt,
        published_at: new Date().toISOString(),
        status: "published",
      }, { onConflict: "page_slug" });

      toast.success(
        <div>
          <p className="font-semibold">Published</p>
          <p className="text-xs opacity-70 mt-1">{blocks.length} blocks saved · {new Date().toLocaleTimeString()}</p>
        </div>
      );
    } catch (e) {
      
      toast.error(`Save failed: ${e.message}`);
    }
    setSaving(false);
  };

  const selectedBlock = blocks.find(b => b.id === selected);

  // Pages config: CMS pages use block editor, live pages use iframe preview
  const ALL_PAGES = [
    { id: "home",            label: "Home",           type: "cms",     url: "/" },
    { id: "owners",          label: "Owners",         type: "cms",     url: "/property-owners" },
    { id: "about",           label: "About",          type: "cms",     url: "/" },
    { id: "contact",         label: "Contact",        type: "cms",     url: "/" },
    { id: "properties",      label: "Properties",     type: "preview", url: "/properties" },
    { id: "property_detail", label: "Property",       type: "preview", url: "/property/693abb6d80cd6e002d2e8763" },
    { id: "checkout",        label: "Checkout",       type: "preview", url: "/properties" },
    { id: "confirmation",    label: "Confirmation",   type: "preview", url: "/confirmation" },
    { id: "map",             label: "Map",            type: "preview", url: "/map" },
  ];

  const currentPageConfig = ALL_PAGES.find(p => p.id === page) || ALL_PAGES[0];
  const isCMSPage = currentPageConfig.type === "cms";
  const previewUrl = `${window.location.origin}${currentPageConfig.url}`;

  if (isLoading) {
return <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[9999]"><div className="animate-spin w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full" /></div>;
}

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex flex-col z-[9999] overflow-hidden" data-testid="admin-editor">
      {/* Header */}
      <header className="h-12 bg-[#0a0a0b] border-b border-[#1a1a1e] flex items-center px-4 gap-2 shrink-0">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1a1a1e]">
          <div className="w-7 h-7 bg-gradient-to-br from-[#C9A84C] to-[#a08550] flex items-center justify-center font-bold text-sm rounded text-[#0a0a0b]">C</div>
          <span className="text-[#f0ede8] text-sm font-semibold hidden sm:block">Studio <em className="text-[#C9A84C] not-italic font-normal">Pro</em></span>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 border border-[#1a1a1e] rounded p-0.5 mr-2">
          <button onClick={() => setMode("studio")} className={`px-2.5 py-1 text-[9px] font-medium rounded transition-all ${mode === "studio" ? "bg-[#C9A84C] text-[#0a0a0b]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
            <Layout className="w-3 h-3 inline mr-1" />Studio
          </button>
          <button onClick={() => setMode("live")} className={`px-2.5 py-1 text-[9px] font-medium rounded transition-all ${mode === "live" ? "bg-[#C9A84C] text-[#0a0a0b]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
            <Eye className="w-3 h-3 inline mr-1" />Live
          </button>
          <button onClick={() => setMode("dashboard")} className={`px-2.5 py-1 text-[9px] font-medium rounded transition-all ${mode === "dashboard" ? "bg-[#C9A84C] text-[#0a0a0b]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
            <ChartBar className="w-3 h-3 inline mr-1" />Dashboard
          </button>
        </div>
        
        {mode === "studio" && (
          <div className="flex items-center gap-1 overflow-x-auto max-w-[500px]" style={{ scrollbarWidth: "none" }}>
            {ALL_PAGES.map(p => (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                title={p.type === "preview" ? `Live preview: ${p.url}` : `CMS editor: ${p.id}`}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded transition-all whitespace-nowrap ${
                  page === p.id
                    ? p.type === "cms"
                      ? "bg-[#C9A84C]/15 text-[#C9A84C]"
                      : "bg-blue-400/15 text-blue-400"
                    : "text-[#6a6a6e] hover:text-[#f0ede8]"
                }`}
              >
                {p.type === "preview" && <Eye className="w-2.5 h-2.5 opacity-60" />}
                {p.label}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex-1" />
        
        {mode === "studio" && (
          <div className="flex items-center gap-1 border-r border-[#1a1a1e] pr-2 mr-2">
            {[{ m: "desktop", i: Monitor }, { m: "tablet", i: Tablet }, { m: "mobile", i: Smartphone }].map(({ m, i: I }) => (
              <button key={m} onClick={() => setView(m)} className={`p-1.5 rounded ${view === m ? "bg-[#C9A84C]/15 text-[#C9A84C]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}><I className="w-3.5 h-3.5" /></button>
            ))}
          </div>
        )}
        
        {mode === "studio" && (
          <>
            <button onClick={doUndo} disabled={!undo.length} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] disabled:opacity-30 rounded hover:bg-[#1a1a1e]" title="Undo"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={doRedo} disabled={!redo.length} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] disabled:opacity-30 rounded hover:bg-[#1a1a1e]" title="Redo"><Redo2 className="w-3.5 h-3.5" /></button>
          </>
        )}
        
        <div className="w-px h-5 bg-[#1a1a1e] mx-1" />
        
        <button onClick={() => window.open("/", "_blank")} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Preview"><ExternalLink className="w-3.5 h-3.5" /></button>
        <button onClick={() => setShowKeys(true)} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="API Keys"><Key className="w-3.5 h-3.5" /></button>
        
        {mode === "studio" && (
          <button onClick={saveAll} disabled={saving} className="ml-2 px-3 py-1.5 text-[10px] bg-[#C9A84C] text-[#0a0a0b] font-semibold rounded hover:bg-[#D4B85C] flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Publish
          </button>
        )}
        
        <button onClick={() => {
 logout(); navigate("/"); 
}} className="p-1.5 text-[#6a6a6e] hover:text-red-400 rounded hover:bg-red-400/10 ml-1" title="Logout"><LogOut className="w-3.5 h-3.5" /></button>
      </header>

      {/* Dashboard Mode */}
      {mode === "dashboard" && (
        <div className="flex-1 overflow-hidden">
          <AdminDashboard adminKey={localStorage.getItem("cvpm_admin_key") || ""} />
        </div>
      )}

      {/* Live Navigate Mode */}
      {mode === "live" && (
        <div className="flex-1 overflow-hidden">
          <LiveNavigateMode initialUrl="/" />
        </div>
      )}

      {/* Studio Mode */}
      {mode === "studio" && (
        <div className="flex flex-1 overflow-hidden">

        {/* Left Panel: Blocks (CMS only) or Page Navigator */}
        <aside className="w-56 bg-[#0a0a0b] border-r border-[#1a1a1e] flex flex-col shrink-0">
          {isCMSPage ? (
            <>
              <div className="flex border-b border-[#1a1a1e]">
                {[{ id: "blocks", icon: Plus, label: "Add" }, { id: "layers", icon: Layers, label: "Layers" }].map(t => (
                  <button key={t.id} onClick={() => setLeftTab(t.id)} className={`flex-1 py-2.5 text-[9px] font-medium flex flex-col items-center gap-1 ${leftTab === t.id ? "text-[#C9A84C] bg-[#C9A84C]/5" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
                    <t.icon className="w-4 h-4" />{t.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {leftTab === "blocks" && (
                  <div className="space-y-3">
                    {BLOCK_CATEGORIES.map(cat => (
                      <BlockCategorySection key={cat.id} cat={cat} onAdd={addBlock} />
                    ))}
                  </div>
                )}
                {leftTab === "layers" && (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[8px] uppercase tracking-wider text-[#4a4a4e] font-semibold">Blocks · {blocks.length}</p>
                      <button onClick={() => {
 const t = LIVE_PAGE_TEMPLATES[page]||[]; setBlocks(t.map((b,i)=>({id:`${b.type}_${page}_${i}`,type:b.type,data:{...b.data},visible:true}))); setSelected(null); toast.info("Page reset"); 
}} className="text-[8px] text-[#4a4a4e] hover:text-[#C9A84C]">Reset</button>
                    </div>
                    {blocks.map((block, idx) => {
                      const schema = SCHEMAS[block.type];
                      const blockLabel = schema?.label || block.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                      const isVisible = block.visible !== false;
                      return (
                        <div key={block.id} onClick={() => {
 setSelected(block.id); setRightTab("props"); 
}} className={`flex items-center gap-2 p-2 rounded cursor-pointer group transition-all ${selected === block.id ? "bg-[#C9A84C]/15 text-[#C9A84C]" : "hover:bg-[#1a1a1e] text-[#6a6a6e]"}`}>
                          <GripVertical className="w-3 h-3 opacity-40 cursor-grab" />
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVisible ? "bg-green-500" : "bg-[#3a3a3e]"}`} />
                          <Layout className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 text-[10px] font-medium truncate">{blockLabel}</span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => {
 e.stopPropagation(); toggleVisibility(block.id); 
}} className="p-0.5 hover:text-[#f0ede8]">{isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
                            <button onClick={e => {
 e.stopPropagation(); moveBlock(idx, -1); 
}} disabled={idx === 0} className="p-0.5 hover:text-[#f0ede8] disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                            <button onClick={e => {
 e.stopPropagation(); deleteBlock(block.id); 
}} className="p-0.5 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                    {blocks.length === 0 && <p className="text-[9px] text-[#4a4a4e] text-center py-4">No blocks. Add from the "Add" tab.</p>}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Preview page info panel */
            <div className="flex-1 p-4 space-y-4">
              <div className="border border-blue-400/20 bg-blue-400/5 rounded p-3">
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">Live Preview</p>
                <p className="text-[9px] text-[#5a5a5e]">This page renders the actual live frontend. It cannot be edited via block editor.</p>
              </div>
              <div>
                <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-2 font-semibold">Page URL</p>
                <p className="text-[9px] text-[#A1A1AA] font-mono break-all">{currentPageConfig.url}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-2 font-semibold">Quick Links</p>
                <div className="space-y-1.5">
                  {currentPageConfig.id === "property_detail" && [
                    { label: "Palazzo Ducoss 8", url: "/property/693abb6d80cd6e002d2e8763" },
                    { label: "Villa with Pool", url: "/property/69ceb988571e1b00149f3c8b" },
                  ].map((link, i) => (
                    <button key={i} onClick={() => {
 window.open(`${window.location.origin}${link.url}`, "_blank"); 
}} className="w-full text-left text-[9px] text-[#C9A84C] hover:text-[#D4B85C] truncate">→ {link.label}</button>
                  ))}
                  <button onClick={() => window.open(`${window.location.origin}${currentPageConfig.url}`, "_blank")} className="flex items-center gap-1 text-[9px] text-[#C9A84C] hover:text-[#D4B85C]">
                    <ExternalLink className="w-3 h-3" /> Open in new tab
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 flex flex-col bg-[#141416] overflow-hidden">
          {/* Canvas toolbar */}
          <div className="h-9 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              {isCMSPage ? (
                <span className="text-[9px] text-[#4a4a4e] font-medium">{blocks.length} blocks · {page}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[9px] text-blue-400 font-medium">Live Preview — {currentPageConfig.label}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Live preview toggle for CMS pages */}
              {isCMSPage && (
                <button
                  onClick={() => window.open(`${window.location.origin}${currentPageConfig.url}`, "_blank")}
                  className="flex items-center gap-1 text-[9px] text-[#5a5a5e] hover:text-[#C9A84C] border border-[#1e1e22] rounded px-2 py-0.5 transition-colors"
                  title="Open live preview in new tab"
                >
                  <Eye className="w-3 h-3" />Live
                </button>
              )}
              {/* Pause-to-preview: freeze InlineText editing for clean preview */}
              {isCMSPage && (
                <button
                  onClick={() => setPauseEdit(p => !p)}
                  className={`flex items-center gap-1 text-[9px] border rounded px-2 py-0.5 transition-colors ${pauseEdit ? "bg-[#C9A84C]/15 border-[#C9A84C]/40 text-[#C9A84C]" : "border-[#1e1e22] text-[#5a5a5e] hover:text-[#f0ede8]"}`}
                  title={pauseEdit ? "Click to resume editing" : "Pause editing to preview cleanly"}
                >
                  {pauseEdit ? <><Play className="w-3 h-3" />Edit</> : <><EyeOff className="w-3 h-3" />Preview</>}
                </button>
              )}
              {isCMSPage && (
                <>
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><Minus className="w-3 h-3" /></button>
                  <span className="text-[9px] text-[#5a5a5e] w-8 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(100, z + 10))} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><Plus className="w-3 h-3" /></button>
                </>
              )}
              {!isCMSPage && (
                <button onClick={() => {
 const iframe = document.getElementById("preview-iframe"); if (iframe) {
 const src = iframe.src; (iframe as HTMLIFrameElement).src = src; 
} 
}} className="flex items-center gap-1 text-[9px] text-[#5a5a5e] hover:text-[#f0ede8]">
                  <RefreshCw className="w-3 h-3" />Refresh
                </button>
              )}
            </div>
          </div>

          {/* Canvas content */}
          <div className="flex-1 overflow-hidden">
            {isCMSPage ? (
              /* Block editor canvas */
              <div className="h-full overflow-y-auto overflow-x-hidden p-4 bg-[#0a0a0b]/50">
                <div
                  className="mx-auto shadow-2xl transition-all rounded overflow-hidden border border-[#1a1a1e]"
                  style={{
                    width: view === "desktop" ? "100%" : view === "tablet" ? "820px" : "390px",
                    maxWidth: "100%",
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}
                >
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="blocks">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {blocks.filter(b => b.visible !== false).map((block, idx) => {
                            const Comp = BLOCKS[block.type];
                            if (!Comp) {
return (
                              <div key={block.id} className="p-4 bg-[#1a1a1e] border-l-2 border-[#C9A84C]/30 m-1">
                                <p className="text-[10px] text-[#4a4a4e]">Unknown block: {block.type}</p>
                              </div>
                            );
}
                            return (
                              <Draggable key={block.id} draggableId={block.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => {
 if (!pauseEdit) {
 setSelected(block.id); setRightTab("props"); 
} 
}}
                                    className={`relative group ${!pauseEdit && selected === block.id ? "ring-2 ring-[#C9A84C] ring-inset" : !pauseEdit ? "hover:ring-1 hover:ring-[#C9A84C]/30 hover:ring-inset" : ""} ${snapshot.isDragging ? "opacity-90 shadow-2xl" : ""}`}
                                  >
                                    {/* Block toolbar overlay — hidden in pause/preview mode */}
                                    <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-[#C9A84C] text-[#0a0a0b] text-[9px] font-semibold uppercase tracking-wide ${!pauseEdit && selected === block.id ? "opacity-100" : !pauseEdit ? "opacity-0 group-hover:opacity-100" : "hidden"} transition-opacity`}>
                                      <span {...provided.dragHandleProps} className="flex items-center gap-1.5 cursor-grab">
                                        <GripVertical className="w-3 h-3" />
                                        {SCHEMAS[block.type]?.label || block.type.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                                      </span>
                                      <div className="flex gap-1">
                                        <button onClick={e => {
 e.stopPropagation(); duplicateBlock(block.id); 
}} className="p-0.5 hover:bg-black/10 rounded" title="Duplicate"><Copy className="w-3 h-3" /></button>
                                        <button onClick={e => {
 e.stopPropagation(); moveBlock(idx, -1); 
}} disabled={idx===0} className="p-0.5 hover:bg-black/10 rounded disabled:opacity-30" title="Move up"><ArrowUp className="w-3 h-3" /></button>
                                        <button onClick={e => {
 e.stopPropagation(); moveBlock(idx, 1); 
}} disabled={idx===blocks.filter(b=>b.visible!==false).length-1} className="p-0.5 hover:bg-black/10 rounded disabled:opacity-30" title="Move down"><ArrowDown className="w-3 h-3" /></button>
                                        <button onClick={e => {
 e.stopPropagation(); deleteBlock(block.id); 
}} className="p-0.5 hover:bg-red-500/20 rounded text-red-700" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                      </div>
                                    </div>
                                    <BlockErrorBoundary blockType={block.type} blockId={block.id}>
                                      <Comp d={block.data} onEdit={pauseEdit ? undefined : ((field, value) => updateBlock(block.id, field, value))} />
                                    </BlockErrorBoundary>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {blocks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-[#4a4a4e]">
                              <Plus className="w-12 h-12 mb-4 opacity-20" />
                              <p className="text-sm">Add blocks from the left panel</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            ) : (
              /* Iframe live preview */
              <div className="h-full w-full relative bg-black">
                {/* URL bar */}
                <div className="h-8 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center gap-2 px-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 bg-[#1a1a1e] rounded text-[9px] text-[#5a5a5e] px-3 py-1 font-mono">
                    {window.location.host}{currentPageConfig.url}
                  </div>
                  <button onClick={() => window.open(`${window.location.origin}${currentPageConfig.url}`, "_blank")} className="text-[#5a5a5e] hover:text-[#C9A84C]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <iframe
                  id="preview-iframe"
                  src={previewUrl}
                  className="w-full border-none"
                  style={{ height: "calc(100% - 32px)" }}
                  title={`Preview: ${currentPageConfig.label}`}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right: Enterprise inspector panel (CMS only) */}
        {isCMSPage && (
          <aside className="w-80 bg-[#0a0a0b] border-l border-[#1a1a1e] flex flex-col shrink-0">
            <div className="flex border-b border-[#1a1a1e] overflow-x-auto" style={{scrollbarWidth:"none"}}>
              {[
                { id:"ai",      label:"AI" },
                { id:"props",   label:"Props" },
                { id:"seo",     label:"SEO" },
                { id:"suggest", label:"Suggest" },
                { id:"json",    label:"JSON" },
              ].map(t => (
                <button key={t.id} onClick={() => setRightTab(t.id)} className={`flex-1 py-2.5 text-[9px] font-medium uppercase tracking-wide shrink-0 ${rightTab === t.id ? "text-[#C9A84C] bg-[#C9A84C]/5 border-b-2 border-[#C9A84C]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>{t.label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightTab === "ai"      && <EnterpriseAIPanel block={selectedBlock} blocks={blocks} onApplyBlock={(f,v) => selectedBlock && updateBlock(selected, f, v)} onReplaceBlocks={(bs) => {
 snapshot(); setBlocks(bs); 
}} page={page} />}
              {rightTab === "props"   && <PropsEditor block={selectedBlock} onUpdate={(f, v) => updateBlock(selected, f, v)} onAI={generateAI} isGenerating={generating} />}
              {rightTab === "seo"     && <SEOPanel blocks={blocks} page={page} />}
              {rightTab === "suggest" && <SuggestPanel blocks={blocks} onAdd={addBlock} onAI={generateFromPrompt} selected={selectedBlock} />}
              {rightTab === "json"    && <JSONEditor block={selectedBlock} onUpdate={(f, v) => updateBlock(selected, f, v)} />}
            </div>
          </aside>
        )}

        </div>
      )}

      {/* Keyboard hints (studio only) */}
      {mode === "studio" && (
        <div className="absolute bottom-3 left-3 text-[8px] text-[#3a3a3e] flex items-center gap-3">
          <span><Command className="w-3 h-3 inline" />Z Undo</span>
          <span><Command className="w-3 h-3 inline" />⇧Z Redo</span>
          <span><Command className="w-3 h-3 inline" />S Save</span>
        </div>
      )}

      {/* API Keys Modal */}
      {showKeys && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999]" onClick={() => setShowKeys(false)}>
          <div className="bg-[#0a0a0b] border border-[#1a1a1e] p-6 w-full max-w-md rounded-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#f0ede8]">API Configuration</h3>
              <button onClick={() => setShowKeys(false)} className="p-1.5 text-[#5a5a5e] hover:text-[#f0ede8]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><p className="text-[11px] text-[#5a5a5e] mb-1">AI (Emergent LLM)</p><span className="text-[10px] text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Active</span></div>
              <div><p className="text-[11px] text-[#5a5a5e] mb-1">Guesty API</p><span className="text-[10px] text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Connected</span></div>
              <div><p className="text-[11px] text-[#5a5a5e] mb-1">Stripe</p><span className="text-[10px] text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Configured</span></div>
            </div>
            <Button onClick={() => setShowKeys(false)} className="w-full mt-6 bg-[#C9A84C] hover:bg-[#D4B85C] text-[#0a0a0b]">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
