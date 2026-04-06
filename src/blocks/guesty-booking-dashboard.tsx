import React from "react";
import { toast } from "sonner";

function GuestyStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-cpm-border bg-cpm-bg-secondary p-4 transition-all duration-300 hover:border-cpm-accent/20" style={{ animation: "scaleIn 0.4s ease-out" }}>
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-cpm-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-light ${color}`}>{value}</p>
    </div>
  );
}

export const GuestyBookingDashboard = {
  label: "Guesty · Booking Dashboard",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Booking Management",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string };
    type BookingRow = {
      id: string; confirmationCode?: string; guestName: string; guestEmail: string;
      propertyName: string; checkIn: string; checkOut: string; nights: number;
      totalPrice: number; status: string; createdAt?: string;
    };
    const [bookings, setBookings] = React.useState<BookingRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [search, setSearch] = React.useState("");

    const fetchBookings = React.useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/bookings?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError((err as Error).message || "Failed to load bookings");
        toast.error("Failed to load bookings");
      } finally { setLoading(false); }
    }, [statusFilter, search]);

    React.useEffect(() => { fetchBookings(); }, [fetchBookings]);

    React.useEffect(() => {
      const handler = () => fetchBookings();
      window.addEventListener("guesty-booking-confirmed", handler);
      return () => window.removeEventListener("guesty-booking-confirmed", handler);
    }, [fetchBookings]);

    const updateStatus = async (id: string, action: string) => {
      try {
        const res = await fetch(`/api/bookings/${id}?action=${action}`, { method: "PATCH" });
        if (res.ok) { toast.success(`Booking ${action}ed`); fetchBookings(); }
        else { const err = await res.json(); toast.error(err.error || "Action failed"); }
      } catch { toast.error("Failed to update booking"); }
    };

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };

    const statusColor = (status: string) => {
      const colors: Record<string, string> = {
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        confirmed: "bg-cpm-success/10 text-cpm-success border-cpm-success/20",
        completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        cancelled: "bg-cpm-error/10 text-cpm-error border-cpm-error/20",
      };
      return colors[status] || colors.pending;
    };

    const filtered = bookings.filter((b) => {
      if (statusFilter === "all") return true;
      return b.status === statusFilter;
    });

    if (loading) {
      return (
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-cpm-border" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-cpm-border" />)}</div>
            <div className="h-64 rounded-xl bg-cpm-border" />
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-cpm-error/20 bg-cpm-error/5 p-4">
                <svg className="h-5 w-5 flex-shrink-0 text-cpm-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <p className="text-sm text-cpm-error">{error}</p>
                <button onClick={fetchBookings} className="ml-auto text-xs font-medium text-cpm-accent hover:text-cpm-accent-hover">Retry</button>
              </div>
            )}

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animation: "fadeInUp 0.7s ease-out" }}>
              <GuestyStatCard label="Total Bookings" value={stats.total} color="text-cpm-text-primary" />
              <GuestyStatCard label="Pending" value={stats.pending} color="text-amber-400" />
              <GuestyStatCard label="Confirmed" value={stats.confirmed} color="text-cpm-success" />
              <GuestyStatCard label="Completed" value={stats.completed} color="text-blue-400" />
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3" style={{ animation: "fadeInUp 0.8s ease-out" }}>
              {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300 ${statusFilter === status ? "bg-cpm-accent text-cpm-bg-primary" : "border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary hover:border-cpm-accent/30 hover:text-cpm-text-primary"}`}>
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings" placeholder="Search bookings..." className="ml-auto rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-2 text-xs text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50 w-48 placeholder-cpm-text-tertiary" />
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-cpm-border lg:block" style={{ animation: "fadeInUp 0.9s ease-out" }}>
              <table className="w-full min-w-[800px] text-sm">
                <thead><tr className="border-b border-cpm-border bg-cpm-bg-primary">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Code</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Guest</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Property</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Dates</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Total</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-cpm-text-tertiary">No bookings found</td></tr>
                  ) : filtered.map((b) => (
                    <tr key={b.id} className="border-b border-cpm-border/50 transition-colors hover:bg-cpm-bg-primary/50">
                      <td className="px-4 py-3 font-mono text-xs text-cpm-accent">{b.confirmationCode || b.id}</td>
                      <td className="px-4 py-3"><div className="text-cpm-text-primary">{b.guestName}</div><div className="text-xs text-cpm-text-tertiary">{b.guestEmail}</div></td>
                      <td className="px-4 py-3 text-cpm-text-secondary">{b.propertyName}</td>
                      <td className="px-4 py-3 text-xs text-cpm-text-secondary"><div>{b.checkIn}</div><div>{b.checkOut}</div></td>
                      <td className="px-4 py-3 font-medium text-cpm-text-primary">€{Number(b.totalPrice).toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(b.id, "confirm")} className="rounded-lg bg-cpm-success/10 px-2.5 py-1 text-xs font-medium text-cpm-success transition-all hover:bg-cpm-success/20">Confirm</button>
                              <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error transition-all hover:bg-cpm-error/20">Cancel</button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <>
                              <button onClick={() => updateStatus(b.id, "complete")} className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/20">Complete</button>
                              <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error transition-all hover:bg-cpm-error/20">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 lg:hidden">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-cpm-text-tertiary">No bookings found</div>
              ) : filtered.map((b) => (
                <div key={b.id} className="rounded-2xl border border-cpm-border bg-cpm-bg-primary p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-cpm-accent">{b.confirmationCode || b.id}</p>
                      <p className="mt-1 text-sm font-medium text-cpm-text-primary">{b.guestName}</p>
                      <p className="text-xs text-cpm-text-tertiary">{b.guestEmail}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="border-t border-cpm-border pt-3">
                    <p className="text-sm text-cpm-text-secondary">{b.propertyName}</p>
                    <p className="text-xs text-cpm-text-tertiary">{b.checkIn} → {b.checkOut}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-cpm-border pt-3">
                    <span className="text-lg font-semibold text-cpm-accent">€{Number(b.totalPrice).toFixed(2)}</span>
                    <div className="flex gap-1.5">
                      {b.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(b.id, "confirm")} className="rounded-lg bg-cpm-success/10 px-2.5 py-1 text-xs font-medium text-cpm-success">Confirm</button>
                          <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error">Cancel</button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <>
                          <button onClick={() => updateStatus(b.id, "complete")} className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">Complete</button>
                          <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error">Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Booking management overview with status tracking, upcoming check-ins, and reservation history." },
};