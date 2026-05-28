import { Link, Navigate } from "react-router-dom";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Sparkles, Building2, FileText, Users } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const { isAdmin, isEditor, loading: rolesLoading } = useRoles(user?.id);

  if (loading || rolesLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-hero">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin && !isEditor) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-hero p-6 text-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access required</CardTitle>
            <CardDescription>Your account ({user.email}) does not have admin access yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => supabase.auth.signOut()} variant="outline" className="w-full">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-gold text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold">Christiano Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">{isAdmin ? "admin" : "editor"}</span>
            <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-12">
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage content, properties, and inquiries.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DashCard icon={Building2} title="Properties" desc="Live from Guesty">
            <Button asChild variant="outline" size="sm" className="w-full"><Link to="/booking">View live</Link></Button>
          </DashCard>
          <DashCard icon={FileText} title="CMS Content" desc="Edit site blocks">
            <Button asChild variant="gold" size="sm" className="w-full"><Link to="/admin/cms">Open editor</Link></Button>
          </DashCard>
          <DashCard icon={Users} title="Owner inquiries" desc="Leads from /owners">
            <Button asChild variant="outline" size="sm" className="w-full"><Link to="/admin/inquiries">View inbox</Link></Button>
          </DashCard>
        </div>
      </section>
    </div>
  );
}

function DashCard({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-gold/10"><Icon className="h-5 w-5 text-gold" /></div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
