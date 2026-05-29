import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InquiryRowSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { PageSpinner } from "@/components/shared/PageSpinner";

interface Inquiry { id: number; name: string; email: string; phone: string | null; location: string | null; property_type: string | null; bedrooms: string | null; additional_info: string | null; status: string; created_at: string }

const META_FIELDS: { key: keyof Inquiry; label: string }[] = [
  { key: "phone",         label: "Phone" },
  { key: "location",      label: "Location" },
  { key: "property_type", label: "Type" },
  { key: "bedrooms",      label: "Bedrooms" },
];

export default function AdminInquiries() {
  const { user, loading: aLoad }              = useAuth();
  const { isAdmin, loading: rLoad }            = useRoles(user?.id);
  const [items, setItems]                      = useState<Inquiry[]>([]);
  const [loading, setLoading]                  = useState(true);

  useEffect(() => {
    supabase.from("owner_inquiries").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as Inquiry[]) ?? []); setLoading(false); });
  }, []);

  if (aLoad || rLoad) return <PageSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex items-center justify-between py-5">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/admin"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
        </Button>
        <div className="font-display text-lg">Owner Inquiries</div>
        <div className="w-24" aria-hidden />
      </header>

      <section className="container space-y-4 pb-16 pt-4">
        {loading && Array.from({ length: 4 }).map((_, i) => <InquiryRowSkeleton key={i} />)}
        {!loading && items.length === 0 && <EmptyState title="No inquiries yet" body="Submissions from /owners will appear here." />}
        {!loading && items.map((item) => (
          <Card key={item.id} className="animate-slide-up">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-medium ${item.status === "new" ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>{item.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
              <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline w-fit">
                <Mail className="h-3.5 w-3.5" />{item.email}
              </a>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                {META_FIELDS.filter((f) => item[f.key]).map((f) => (
                  <div key={f.key}><span className="text-foreground">{f.label}:</span> {String(item[f.key])}</div>
                ))}
                {item.additional_info && (
                  <div className="sm:col-span-3 mt-2 rounded-xl bg-muted/40 p-3 text-foreground text-sm">{item.additional_info}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
