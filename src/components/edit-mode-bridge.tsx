// Edit-mode bridge: mounted in the live frontend when loaded inside the admin
// editor's iframe (parent posts {type:"cvpm:edit-mode", on:true|false}).
// When ON: hover-outline editable text, click to focus, edits stream back to
// parent via postMessage so the editor can persist them.
// When OFF: passive — user can navigate the site normally.
// Also re-applies persisted text overlays on every page so live edits survive reloads.

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const HL_STYLE_ID = "cvpm-edit-style";
const STYLE_CSS = `
  [data-cvpm-edit-target] { outline: 1px dashed rgba(212,175,55,0.45) !important; outline-offset: 2px !important; cursor: text !important; }
  [data-cvpm-edit-target]:hover { outline: 2px solid rgba(212,175,55,0.9) !important; background: rgba(212,175,55,0.06) !important; }
  [data-cvpm-edit-active="true"] { outline: 2px solid #D4AF37 !important; background: rgba(212,175,55,0.1) !important; }
  .cvpm-edit-toolbar {
    position: fixed; z-index: 2147483646; top: 12px; right: 12px;
    background: #0a0a0b; color: #f0ede8; border: 1px solid #1e1e22; border-radius: 8px;
    padding: 8px 12px; font: 500 12px/1.2 system-ui, sans-serif;
    box-shadow: 0 12px 32px rgba(0,0,0,.45);
    display: flex; align-items: center; gap: 10px;
  }
  .cvpm-edit-toolbar b { color: #D4AF37; font-weight: 600; }
  .cvpm-edit-toolbar a { color: #A1A1AA; text-decoration: none; padding: 4px 8px; border-radius: 4px; }
  .cvpm-edit-toolbar a:hover { background: #1a1a1e; color: #f0ede8; }
`;

function isInsideAdminFrame() {
  try { return window.self !== window.top; } catch { return true; }
}

function isEditableNode(node) {
  if (!node || node.nodeType !== 1) return false;
  const tag = node.tagName;
  if (["SCRIPT","STYLE","IMG","SVG","PATH","INPUT","TEXTAREA","BUTTON","A","NAV","HEADER","FOOTER","MAIN","SECTION","ARTICLE","DIV","UL","OL"].includes(tag)) {
    // allow common block-level only if they have direct text content
    const txt = (node.textContent || "").trim();
    if (!txt) return false;
    // must have direct text node, not just descendants
    const hasDirect = Array.from(node.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasDirect && !["H1","H2","H3","H4","H5","H6","P","SPAN","STRONG","EM","LI","BLOCKQUOTE","CAPTION","LABEL"].includes(tag)) return false;
  }
  if (["H1","H2","H3","H4","H5","H6","P","SPAN","STRONG","EM","LI","BLOCKQUOTE","CAPTION","LABEL"].includes(tag)) {
    const txt = (node.textContent || "").trim();
    return txt.length > 0 && txt.length < 600;
  }
  return false;
}

function buildSelector(el) {
  // Stable-ish path used for identification; not used for re-querying server-side
  const parts = [];
  let n = el;
  while (n && n.nodeType === 1 && parts.length < 6 && n.tagName !== "BODY") {
    let p = n.tagName.toLowerCase();
    if (n.id) { p += `#${n.id}`; parts.unshift(p); break; }
    if (n.className && typeof n.className === "string") {
      const cls = n.className.trim().split(/\s+/).slice(0,2).join(".");
      if (cls) p += `.${cls}`;
    }
    const parent = n.parentElement;
    if (parent) {
      const sib = Array.from(parent.children).filter(c => c.tagName === n.tagName);
      if (sib.length > 1) p += `:nth-of-type(${sib.indexOf(n) + 1})`;
    }
    parts.unshift(p);
    n = n.parentElement;
  }
  return parts.join(" > ");
}

export default function EditModeBridge() {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const focusedRef = useRef(null);

  useEffect(() => { activeRef.current = active; }, [active]);

  // Only run when embedded in the admin iframe
  useEffect(() => {
    if (!isInsideAdminFrame()) return;

    const onMsg = (e) => {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "cvpm:edit-mode") setActive(!!d.on);
      if (d.type === "cvpm:request-url") {
        try { window.parent.postMessage({ type: "cvpm:url", url: window.location.pathname + window.location.search + window.location.hash }, "*"); } catch { /* empty */ }
      }
      if (d.type === "cvpm:edit-push" && d.selector) {
        // Find element matching saved selector and update its text content
        try {
          const targets = document.querySelectorAll("[data-cvpm-edit-target]");
          for (const el of targets) {
            if (buildSelector(el) === d.selector) {
              if (el !== focusedRef.current) {
                el.innerText = d.text;
              } else if (document.activeElement !== el) {
                el.innerText = d.text;
              }
              break;
            }
          }
// eslint-disable-next-line no-empty
      } catch {}
      }
    };
    window.addEventListener("message", onMsg);

    // Tell parent we're mounted and what URL we're on
    const ping = () => {
      try { window.parent.postMessage({ type: "cvpm:ready", url: window.location.pathname + window.location.search }, "*"); } catch { /* empty */ }
    };
    ping();

    // Detect SPA route changes
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
 
    window.history.pushState = function (...args) { const r = origPush.apply(this, args); ping(); return r; };
     
    window.history.replaceState = function (...args) { const r = origReplace.apply(this, args); ping(); return r; };
    window.addEventListener("popstate", ping);

    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("popstate", ping);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  // Load + apply persisted overlays for the current URL
  useEffect(() => {
    if (!isInsideAdminFrame()) return;
    let cancelled = false;
    const apply = async () => {
      try {
        const { data } = await supabase
          .from("cms_content")
          .select("content")
          .eq("section_key", "live_overlays")
          .maybeSingle();
        if (cancelled) return;
        const items = data?.content?.items || [];
        const path = window.location.pathname;
        const matches = items.filter(o => o.url === path);
        if (!matches.length) return;
        // Wait briefly for DOM
        const tryApply = (attempt = 0) => {
          if (attempt > 8) return;
          let appliedAny = false;
          for (const m of matches) {
            const candidates = document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,li,blockquote,caption,label,strong,em");
            for (const el of candidates) {
              if (buildSelector(el) === m.selector) {
                if (el.innerText !== m.text) el.innerText = m.text;
                appliedAny = true;
                break;
              }
            }
          }
          if (!appliedAny) setTimeout(() => tryApply(attempt + 1), 250);
        };
        setTimeout(() => tryApply(), 200);
// eslint-disable-next-line no-empty
      } catch {}
    };
     
    apply();
    const onPop = () => apply();
    window.addEventListener("popstate", onPop);
    return () => { cancelled = true; window.removeEventListener("popstate", onPop); };
  }, []);

  // Inject highlight CSS + scan editable nodes when active
  useEffect(() => {
    if (!isInsideAdminFrame()) return;
    if (!active) {
      // teardown
      document.querySelectorAll("[data-cvpm-edit-target]").forEach(el => {
        el.removeAttribute("data-cvpm-edit-target");
        el.removeAttribute("data-cvpm-edit-active");
        el.removeAttribute("contenteditable");
      });
      const s = document.getElementById(HL_STYLE_ID); if (s) s.remove();
      const tb = document.getElementById("cvpm-edit-toolbar"); if (tb) tb.remove();
      focusedRef.current = null;
      return;
    }

    // inject style
    if (!document.getElementById(HL_STYLE_ID)) {
      const s = document.createElement("style");
      s.id = HL_STYLE_ID;
      s.textContent = STYLE_CSS;
      document.head.appendChild(s);
    }

    // toolbar
    if (!document.getElementById("cvpm-edit-toolbar")) {
      const tb = document.createElement("div");
      tb.id = "cvpm-edit-toolbar";
      tb.className = "cvpm-edit-toolbar";
      tb.innerHTML = `<b>EDIT MODE</b><span>Click any text to edit</span>`;
      document.body.appendChild(tb);
    }

    // mark editable nodes
    const mark = () => {
      const all = document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,li,blockquote,caption,label,strong,em");
      all.forEach(el => {
        if (el.closest("[data-cvpm-edit-toolbar]") || el.closest(".cvpm-edit-toolbar")) return;
        if (isEditableNode(el)) el.setAttribute("data-cvpm-edit-target", "1");
      });
    };
    mark();
    const mo = new MutationObserver(() => mark());
    mo.observe(document.body, { childList: true, subtree: true });

    const onClick = (e) => {
      if (!activeRef.current) return;
      const el = e.target.closest("[data-cvpm-edit-target]");
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      // toggle focus
      if (focusedRef.current && focusedRef.current !== el) {
        focusedRef.current.removeAttribute("data-cvpm-edit-active");
        focusedRef.current.removeAttribute("contenteditable");
      }
      focusedRef.current = el;
      el.setAttribute("data-cvpm-edit-active", "true");
      el.setAttribute("contenteditable", "true");
      el.focus();
      try {
        window.parent.postMessage({
          type: "cvpm:edit-focus",
          selector: buildSelector(el),
          text: el.innerText,
          tag: el.tagName.toLowerCase(),
          url: window.location.pathname,
        }, "*");
      } catch {}
    };
    const onInput = (e) => {
      const el = focusedRef.current;
      if (!el || !el.contains(e.target) && el !== e.target) return;
      try {
        window.parent.postMessage({
          type: "cvpm:edit-change",
          selector: buildSelector(el),
          text: el.innerText,
        }, "*");
      } catch {}
    };
    const onBlur = () => {
      const el = focusedRef.current;
      if (!el) return;
      try {
        window.parent.postMessage({
          type: "cvpm:edit-commit",
          selector: buildSelector(el),
          text: el.innerText,
        }, "*");
      } catch {}
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("focusout", onBlur, true);

    return () => {
      mo.disconnect();
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("focusout", onBlur, true);
    };
  }, [active]);

  return null;
}
