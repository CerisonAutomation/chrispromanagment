// CMS Version Control edge function
// Actions:
//   POST {action:"snapshot", label, note, status} → snapshot every cms_* row into cms_versions
//   POST {action:"publish",  id}                  → mark version as 'published'
//   POST {action:"revert",   id}                  → restore cms_content / cms_images / cms_settings / cms_page_seo from snapshot
//   POST {action:"list"}                          → list versions (id, label, note, status, counts, created_at)
//   POST {action:"get", id}                       → return one version with full snapshot
//
// All actions require an admin or editor JWT. Revert/publish require admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    // user-context client validates the caller's JWT
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    // role check via SECURITY DEFINER has_role
    const [{ data: isAdmin }, { data: isEditor }] = await Promise.all([
      userClient.rpc("has_role", { _user_id: userId, _role: "admin" }),
      userClient.rpc("has_role", { _user_id: userId, _role: "editor" }),
    ]);
    if (!isAdmin && !isEditor) return json({ error: "Forbidden" }, 403);

    // service-role client for cross-table reads/writes
    const admin = createClient(url, service);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");

    if (action === "list") {
      const { data, error } = await admin
        .from("cms_versions")
        .select("id,label,note,status,content_count,image_count,setting_count,created_at,published_at,created_by")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return json({ error: error.message }, 500);
      return json({ versions: data });
    }

    if (action === "get") {
      const id = String(body?.id || "");
      if (!id) return json({ error: "id required" }, 400);
      const { data, error } = await admin.from("cms_versions").select("*").eq("id", id).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Not found" }, 404);
      return json({ version: data });
    }

    if (action === "snapshot") {
      const label = String(body?.label || "Snapshot");
      const note = body?.note ? String(body.note) : null;
      const status = ["draft", "published", "baseline", "autosave"].includes(body?.status)
        ? body.status
        : "draft";

      const [content, images, settings, seo] = await Promise.all([
        admin.from("cms_content").select("*"),
        admin.from("cms_images").select("*"),
        admin.from("cms_settings").select("*"),
        admin.from("cms_page_seo").select("*"),
      ]);
      for (const r of [content, images, settings, seo]) {
        if (r.error) return json({ error: r.error.message }, 500);
      }

      const snapshot = {
        version: 1,
        captured_at: new Date().toISOString(),
        cms_content: content.data || [],
        cms_images: images.data || [],
        cms_settings: settings.data || [],
        cms_page_seo: seo.data || [],
      };

      const insert = await admin
        .from("cms_versions")
        .insert({
          label,
          note,
          status,
          snapshot,
          content_count: snapshot.cms_content.length,
          image_count: snapshot.cms_images.length,
          setting_count: snapshot.cms_settings.length,
          created_by: userId,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .select("id,label,status,created_at,content_count,image_count,setting_count")
        .single();
      if (insert.error) return json({ error: insert.error.message }, 500);
      return json({ version: insert.data });
    }

    if (action === "publish") {
      if (!isAdmin) return json({ error: "Admin required" }, 403);
      const id = String(body?.id || "");
      if (!id) return json({ error: "id required" }, 400);
      const { data, error } = await admin
        .from("cms_versions")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id)
        .select("id,status,published_at")
        .single();
      if (error) return json({ error: error.message }, 500);
      return json({ version: data });
    }

    if (action === "revert") {
      if (!isAdmin) return json({ error: "Admin required" }, 403);
      const id = String(body?.id || "");
      if (!id) return json({ error: "id required" }, 400);

      // Auto-snapshot current state before destructive revert
      const [content, images, settings, seo] = await Promise.all([
        admin.from("cms_content").select("*"),
        admin.from("cms_images").select("*"),
        admin.from("cms_settings").select("*"),
        admin.from("cms_page_seo").select("*"),
      ]);
      const backup = {
        version: 1,
        captured_at: new Date().toISOString(),
        cms_content: content.data || [],
        cms_images: images.data || [],
        cms_settings: settings.data || [],
        cms_page_seo: seo.data || [],
      };
      await admin.from("cms_versions").insert({
        label: `Auto-backup before revert`,
        status: "autosave",
        snapshot: backup,
        content_count: backup.cms_content.length,
        image_count: backup.cms_images.length,
        setting_count: backup.cms_settings.length,
        created_by: userId,
      });

      const { data: ver, error: verErr } = await admin
        .from("cms_versions").select("snapshot").eq("id", id).maybeSingle();
      if (verErr) return json({ error: verErr.message }, 500);
      if (!ver?.snapshot) return json({ error: "Snapshot not found" }, 404);

      const snap = ver.snapshot as Record<string, unknown[]>;

      // Wipe then restore each table
      await admin.from("cms_content").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await admin.from("cms_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await admin.from("cms_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await admin.from("cms_page_seo").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      const errs: string[] = [];
      if (snap.cms_content?.length)  { const r = await admin.from("cms_content").insert(snap.cms_content);  if (r.error) errs.push("content: "+r.error.message); }
      if (snap.cms_images?.length)   { const r = await admin.from("cms_images").insert(snap.cms_images);   if (r.error) errs.push("images: "+r.error.message); }
      if (snap.cms_settings?.length) { const r = await admin.from("cms_settings").insert(snap.cms_settings); if (r.error) errs.push("settings: "+r.error.message); }
      if (snap.cms_page_seo?.length) { const r = await admin.from("cms_page_seo").insert(snap.cms_page_seo); if (r.error) errs.push("seo: "+r.error.message); }
      if (errs.length) return json({ error: "Partial revert", details: errs }, 500);

      await admin.from("cms_sync_log").insert({
        source: "cms-version",
        action: "revert",
        payload: { version_id: id, user: userId },
        status: "success",
      });

      return json({ ok: true, reverted_to: id });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
