import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { gmail } from "@/lib/gmail";
import { toast } from "sonner";
import { Mail, RefreshCw, Search, Inbox, Trash2, MailOpen, Loader2 } from "lucide-react";

/**
 * Admin Gmail inbox — lists recent INBOX messages from the connected
 * builder Gmail account (Christiano's Gmail). Read-only viewer + quick
 * mark-read / archive / trash actions.
 *
 * Backed by the `gmail-inbox` edge function (admin-only guard server-side).
 */
export default function GmailInboxPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await gmail.listInbox({ q: q || undefined });
      setMessages(data.messages || []);
    } catch (e) {
      toast.error(e.message || "Failed to load inbox");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openMessage = async (m) => {
    try {
      const full = await gmail.getMessage(m.id);
      setSelected({ meta: m, full });
      if (m.unread) {
        await gmail.markRead(m.id).catch(() => {});
        setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, unread: false } : x));
      }
    } catch (e) { toast.error(e.message || "Failed to open message"); }
  };

  const doAction = async (m, fn, label) => {
    try {
      await fn(m.id);
      toast.success(label);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
      if (selected?.meta?.id === m.id) setSelected(null);
    } catch (e) { toast.error(e.message || `Failed: ${label}`); }
  };

  const bodyText = decodeMessageBody(selected?.full);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" /> Inbox (Gmail)
        </CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Gmail search syntax (e.g. is:unread from:@guest.com)"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={loading}>Search</Button>
        </form>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
          {/* List */}
          <div className="border rounded-md max-h-[480px] overflow-y-auto divide-y">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading inbox…
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No messages match this filter.
              </div>
            ) : messages.map((m) => (
              <button
                key={m.id}
                onClick={() => openMessage(m)}
                className={`w-full text-left p-3 hover:bg-accent transition-colors ${
                  selected?.meta?.id === m.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className={`text-sm truncate ${m.unread ? "font-semibold" : ""}`}>
                    {parseFromName(m.from)}
                  </span>
                  {m.unread && <Badge variant="default" className="text-[10px]">NEW</Badge>}
                </div>
                <div className={`text-sm truncate ${m.unread ? "font-medium" : "text-muted-foreground"}`}>
                  {m.subject}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{m.snippet}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="border rounded-md p-4 min-h-[200px] max-h-[480px] overflow-y-auto">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                <Mail className="h-8 w-8 mb-2 opacity-50" />
                Select a message to view its contents.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">{selected.meta.from}</div>
                  <h3 className="font-semibold text-base mt-0.5">{selected.meta.subject}</h3>
                  <div className="text-xs text-muted-foreground mt-1">{selected.meta.date}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => doAction(selected.meta, gmail.archive, "Archived")}>
                    <MailOpen className="h-3.5 w-3.5 mr-1" /> Archive
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => doAction(selected.meta, gmail.trash, "Moved to trash")}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Trash
                  </Button>
                </div>
                <pre className="text-sm whitespace-pre-wrap break-words leading-relaxed border-t pt-3">
                  {bodyText || selected.full?.snippet || "(no readable body)"}
                </pre>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function parseFromName(from) {
  if (!from) return "(unknown)";
  const m = from.match(/^"?(.+?)"?\s*<.+>$/);
  return m ? m[1] : from;
}

function decodeMessageBody(full) {
  if (!full?.payload) return "";
  const parts = flattenParts(full.payload);
  const textPart = parts.find((p) => p.mimeType === "text/plain") || parts.find((p) => p.mimeType === "text/html");
  if (!textPart?.body?.data) return "";
  try {
    const b64 = textPart.body.data.replace(/-/g, "+").replace(/_/g, "/");
    const str = atob(b64);
    if (textPart.mimeType === "text/html") {
      return str.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+\n/g, "\n").trim();
    }
    return str;
  } catch { return ""; }
}
function flattenParts(part) {
  const out = [part];
  if (Array.isArray(part.parts)) for (const p of part.parts) out.push(...flattenParts(p));
  return out;
}
