import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { toast } from "sonner";

type Row = {
  id: string;
  section_key: string;
  section_label: string;
  content: any;
  is_visible: boolean;
  sort_order: number;
};

export default function AdminCMS() {
  const { user, loading } = useAuth();
  const { isAdmin, isEditor, loading: rLoading } = useRoles(user?.id);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("cms_content")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, []);

  if (loading || rLoading) return <Center><Loader2 className="h-6 w-6 animate-spin text-gold" /></Center>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin && !isEditor) return <Navigate to="/admin" replace />;

  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const save = async (row: Row) => {
    setBusy(true);
    const { error } = await supabase
      .from("cms_content")
      .update({ content: row.content, is_visible: row.is_visible, section_label: row.section_label })
      .eq("id", row.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(`Saved ${row.section_key}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex items-center justify-between py-6">
        <Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft className="h-4 w-4" /> Dashboard</Link></Button>
        <div className="font-display text-lg">CMS Editor</div>
        <div className="w-28" />
      </header>

      <section className="container space-y-6 py-6">
        {rows.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No CMS content yet</CardTitle>
              <CardDescription>Insert rows into <code>cms_content</code> to start editing.</CardDescription>
            </CardHeader>
          </Card>
        )}
        {rows.map((row) => (
          <Card key={row.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{row.section_label || row.section_key}</CardTitle>
                  <CardDescription className="font-mono text-xs">{row.section_key}</CardDescription>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.is_visible}
                    onChange={(e) => updateRow(row.id, { is_visible: e.target.checked })}
                  />
                  Visible
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="min-h-[180px] w-full rounded-md border border-input bg-muted/40 p-3 font-mono text-xs"
                value={JSON.stringify(row.content, null, 2)}
                onChange={(e) => {
                  try { updateRow(row.id, { content: JSON.parse(e.target.value) }); }
                  catch { /* keep editing */ }
                }}
              />
              <Button onClick={() => save(row)} variant="gold" size="sm" disabled={busy}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-gradient-hero">{children}</div>;
}
