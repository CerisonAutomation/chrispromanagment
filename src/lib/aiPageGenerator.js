// Client helper for the cms-ai-page-generate edge function.
// Pulls the live block catalog from blockRegistry so the AI always
// sees the same block types/defaults that the editor and renderer support.

import { supabase } from "@/integrations/supabase/client";
import { listBlocks } from "@/lib/blockRegistry";

/**
 * @param {object} opts
 * @param {string} opts.description   Page brief (goal, audience, tone).
 * @param {"owners"|"guests"|"mixed"} [opts.audience]
 * @param {"modern"|"minimal"|"bold"|"elegant"} [opts.style]
 * @param {string} [opts.pageSlug]
 * @param {string} [opts.model]
 * @returns {Promise<{ root:{props:{title?:string,description?:string}}, blocks: Array<{id:string,type:string,data:object,visible:boolean}>, warnings?: object }>}
 */
export async function generatePage({ description, audience, style = "elegant", pageSlug, model }) {
  if (!description || typeof description !== "string") {
    throw new Error("description is required");
  }

  const availableBlocks = listBlocks().map((b) => ({
    type: b.type,
    label: b.label,
    category: b.category,
    defaults: safeDefaults(b),
  }));

  const { data, error } = await supabase.functions.invoke("cms-ai-page-generate", {
    body: { description, audience, style, pageSlug, availableBlocks, model },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data || !Array.isArray(data.blocks)) {
    throw new Error("AI returned no blocks");
  }
  return data;
}

function safeDefaults(b) {
  try { return typeof b.defaults === "function" ? b.defaults() : (b.defaults ?? {}); }
  catch { return {}; }
}
