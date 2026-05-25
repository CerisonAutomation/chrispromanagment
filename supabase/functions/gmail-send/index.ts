// gmail-send — Sends an email from the connected Gmail account via the
// Lovable connector gateway. Builder-account inbox (NOT per-user).
//
// Body: { to, subject, text, cc?, bcc?, replyTo? }
// Requires LOVABLE_API_KEY + GOOGLE_MAIL_API_KEY env vars (auto-injected
// when the Gmail connector is linked).

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function b64url(input: string): string {
  // UTF-8 safe base64url
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRaw({
  to, subject, text, cc, bcc, replyTo,
}: { to: string; subject: string; text: string; cc?: string; bcc?: string; replyTo?: string }) {
  const lines = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : "",
    bcc ? `Bcc: ${bcc}` : "",
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    text,
  ].filter(Boolean);
  return b64url(lines.join("\r\n"));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);
  if (!GOOGLE_MAIL_API_KEY) return json({ error: "Gmail connector not linked" }, 500);

  try {
    const body = await req.json().catch(() => ({}));
    const { to, subject, text, cc, bcc, replyTo } = body || {};
    if (!to || !subject || !text) {
      return json({ error: "to, subject, text are required" }, 400);
    }

    const raw = buildRaw({ to, subject, text, cc, bcc, replyTo });

    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({ error: `Gmail send ${res.status}`, details: data }, res.status);
    }
    return json({ ok: true, messageId: data.id, threadId: data.threadId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[gmail-send]", msg);
    return json({ error: msg }, 500);
  }
});
