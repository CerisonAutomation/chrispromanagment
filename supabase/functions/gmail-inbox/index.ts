// gmail-inbox — Lists & reads messages from the connected Gmail account
// via the Lovable connector gateway. Admin-only.
//
// Query params:
//   action=list   q=...  maxResults=10  labelIds=INBOX
//   action=get    id=<messageId>
//   action=modify id=<messageId>  body: { addLabelIds?, removeLabelIds? }
//   action=trash  id=<messageId>

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireAdmin(req: Request): Promise<{ ok: true } | Response> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
return json({ error: "Missing bearer token" }, 401);
}

  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supaUrl, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
return json({ error: "Not authenticated" }, 401);
}

  const service = createClient(supaUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: roles } = await service
    .from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((r) => r.role === "admin")) {
    return json({ error: "Admin required" }, 403);
  }
  return { ok: true };
}

async function gw(path: string, init: RequestInit = {}) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!LOVABLE_API_KEY) {
throw new Error("LOVABLE_API_KEY not configured");
}
  if (!GOOGLE_MAIL_API_KEY) {
throw new Error("Gmail connector not linked");
}
  return fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
return new Response("ok", { headers: corsHeaders });
}

  const guard = await requireAdmin(req);
  if (guard instanceof Response) {
return guard;
}

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "list";

    if (action === "list") {
      const qs = new URLSearchParams();
      const q = url.searchParams.get("q");
      const labelIds = url.searchParams.get("labelIds");
      qs.set("maxResults", url.searchParams.get("maxResults") ?? "15");
      if (q) {
qs.set("q", q);
}
      if (labelIds) {
qs.set("labelIds", labelIds);
}

      const list = await gw(`/users/me/messages?${qs.toString()}`);
      const listData = await list.json();
      if (!list.ok) {
return json({ error: "Gmail list failed", details: listData }, list.status);
}

      // Hydrate with metadata so the UI can show subject/from/snippet
      const ids = (listData.messages || []).slice(0, 15);
      const metas = await Promise.all(
        ids.map(async (m: { id: string }) => {
          const r = await gw(`/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`);
          if (!r.ok) {
return { id: m.id, error: r.status };
}
          const d = await r.json();
          const headers = Object.fromEntries((d.payload?.headers || []).map((h: { name: string; value: string }) => [h.name, h.value]));
          return {
            id: d.id,
            threadId: d.threadId,
            snippet: d.snippet,
            labelIds: d.labelIds,
            subject: headers.Subject || "(no subject)",
            from: headers.From || "",
            date: headers.Date || "",
            unread: (d.labelIds || []).includes("UNREAD"),
          };
        })
      );
      return json({ messages: metas, nextPageToken: listData.nextPageToken });
    }

    if (action === "get") {
      const id = url.searchParams.get("id");
      if (!id) {
return json({ error: "id required" }, 400);
}
      const r = await gw(`/users/me/messages/${encodeURIComponent(id)}?format=full`);
      const d = await r.json();
      return json(d, r.status);
    }

    if (action === "modify") {
      const id = url.searchParams.get("id");
      if (!id) {
return json({ error: "id required" }, 400);
}
      const body = await req.json().catch(() => ({}));
      const r = await gw(`/users/me/messages/${encodeURIComponent(id)}/modify`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return json(await r.json(), r.status);
    }

    if (action === "trash") {
      const id = url.searchParams.get("id");
      if (!id) {
return json({ error: "id required" }, 400);
}
      const r = await gw(`/users/me/messages/${encodeURIComponent(id)}/trash`, { method: "POST" });
      return json(await r.json(), r.status);
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[gmail-inbox]", msg);
    return json({ error: msg }, 500);
  }
});
