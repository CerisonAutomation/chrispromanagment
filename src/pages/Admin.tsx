import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Sparkles, Building2, FileText, Users, Activity, ExternalLink, Database } from "lucide-react";
import { motion } from "framer-motion";

interface Stats { inquiries: number; cmsBlocks: number; listings: number; versions: number }

const STAT_DEFS = [
  { key: "cmsBlocks" as const,  icon: Database,   label: "CMS Blocks"       },
  { key: "listings"  as const,  icon: Building2,  label: "Active Listings"  },
  { key: "inquiries" as const,  icon: Users,      label: "Inquiries"        },
  { key: "versions"  as const,  icon: Activity,   label: "Snapshots"        },
];

const SITE_LINKS = [
  { to: "/",        label: "Landing"  },
  { to: "/booking", label: "Booking"  },
  { to: "/owners",  label: "Owners"   },
];

export default function Admin() {
  const { user, loading }                     = useAuth();
  const { isAdmin, isEditor, loading: rLoad } = useRoles(user?.id);
  const [stats, setStats]                     = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("owner_inquiries").select("*", { count: "exact", head: true }),
      supabase.from("cms_content").select("*",     { count: "exact", head: true }),
      supabase.functions.invoke("guesty-listings", { body: {} }),
      supabase.from("cms_versions").select("*",    { count: "exact", head: true }),
    ]).then(([inq, cms, lst, ver]) => {
      const listingCount = Array.isArray((lst.data as { properties?: unknown[] } | null)?.properties)
        ? ((lst.data as { properties: unknown[] }).properties.length)
        : 0;
      setStats({
        inquiries: inq.count ?? 0,
        cmsBlocks: cms.count ?? 0,
        listings:  listingCount,
        versions:  ver.count ?? 0,
      });
    });
  }, [user]);

  if (loading || rLoad) return <PageSpinner />;
  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin && !isEditor) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-hero p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access required</CardTitle>
            <CardDescription>
              {user.email} does not have admin access. Ask an admin to grant you a role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => supabase.auth.signOut()} variant="outline" className="w-full gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Admin header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-gold text-primary-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <span className="font-display font-semibold">Christiano Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
              {isAdmin ? "admin" : "editor"}
            </span>
            <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-12">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <h1 className="mt-1 font-display text-4xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage content, properties, and inquiries.</p>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            {STAT_DEFS.map(({ key, icon: Icon, label }) => (
              <div key={key} className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-2 text-sm">
                <Icon className="h-4 w-4 text-gold" aria-hidden />
                <span className="font-display font-semibold tabular-nums">{stats[key]}</span>
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Action cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DashCard icon={Building2} title="Properties" desc="Live from Guesty cache">
            <Button asChild variant="outline" size="sm" className="w-full gap-2">
              <Link to="/booking"><ExternalLink className="h-3.5 w-3.5" aria-hidden />View listing page</Link>
            </Button>
          </DashCard>

          <DashCard icon={FileText} title="CMS Editor" desc="Edit all site blocks visually">
            <Button asChild variant="gold" size="sm" className="w-full">
              <Link to="/admin/cms">Open visual editor</Link>
            </Button>
          </DashCard>

          <DashCard icon={Users} title="Owner Inquiries" desc="Leads from /owners">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/admin/inquiries">View inbox</Link>
            </Button>
          </DashCard>
        </div>

        {/* Site links */}
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl text-muted-foreground">Preview site pages</h2>
          <div className="flex flex-wrap gap-2">
            {SITE_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/30 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <ExternalLink className="h-3 w-3" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DashCard({ icon: Icon, title, desc, children }: {
  icon: React.ElementType; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card>
        <CardHeader>
          <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-gold/10" aria-hidden>
            <Icon className="h-5 w-5 text-gold" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
