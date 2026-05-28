import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/hooks/use-auth";

type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  property_type: string | null;
  bedrooms: string | null;
  additional_info: string | null;
  status: string;
  created_at: string;
};

export default function AdminInquiries() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: rLoading } = useRoles(user?.id);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    supabase
      .from("owner_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as Inquiry[]) ?? []); setBusy(false); });
  }, []);

  if (loading || rLoading) return <div className="grid min-h-screen place-items-center bg-gradient-hero"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex items-center justify-between py-6">
        <Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft className="h-4 w-4" /> Dashboard</Link></Button>
        <div className="font-display text-lg">Owner Inquiries</div>
        <div className="w-28" />
      </header>
      <section className="container space-y-4 py-6">
        {busy && <Loader2 className="h-6 w-6 animate-spin text-gold" />}
        {!busy && items.length === 0 && <Card><CardHeader><CardTitle>No inquiries yet</CardTitle></CardHeader></Card>}
        {items.map((i) => (
          <Card key={i.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{i.name}</CardTitle>
                <span className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span>
              </div>
              <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline">
                <Mail className="h-3.5 w-3.5" />{i.email}
              </a>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
              {i.phone && <div><span className="text-foreground">Phone:</span> {i.phone}</div>}
              {i.location && <div><span className="text-foreground">Location:</span> {i.location}</div>}
              {i.property_type && <div><span className="text-foreground">Type:</span> {i.property_type}</div>}
              {i.bedrooms && <div><span className="text-foreground">Bedrooms:</span> {i.bedrooms}</div>}
              {i.additional_info && <div className="sm:col-span-3 mt-2 rounded-md bg-muted/40 p-3 text-foreground">{i.additional_info}</div>}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
