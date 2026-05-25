// src/lib/gmail.js — thin client for gmail-send / gmail-inbox edge functions.
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function call(fn, { method = "GET", body, params } = {}) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const { data: { session } } = await supabase.auth.getSession();
  const bearer = session?.access_token || ANON;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}${qs}`, {
    method,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${fn} ${res.status}`);
  return data;
}

export const gmail = {
  send: ({ to, subject, text, cc, bcc, replyTo }) =>
    call("gmail-send", { method: "POST", body: { to, subject, text, cc, bcc, replyTo } }),

  // Admin-only:
  listInbox: ({ q, maxResults = 15, labelIds = "INBOX" } = {}) =>
    call("gmail-inbox", { params: { action: "list", q, maxResults, labelIds } }),
  getMessage: (id) => call("gmail-inbox", { params: { action: "get", id } }),
  markRead: (id) =>
    call("gmail-inbox", {
      method: "POST", params: { action: "modify", id },
      body: { removeLabelIds: ["UNREAD"] },
    }),
  markUnread: (id) =>
    call("gmail-inbox", {
      method: "POST", params: { action: "modify", id },
      body: { addLabelIds: ["UNREAD"] },
    }),
  archive: (id) =>
    call("gmail-inbox", {
      method: "POST", params: { action: "modify", id },
      body: { removeLabelIds: ["INBOX"] },
    }),
  trash: (id) =>
    call("gmail-inbox", { method: "POST", params: { action: "trash", id } }),
};
