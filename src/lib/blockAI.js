// Frontend client for block AI edge functions.
import { supabase } from "@/integrations/supabase/client";
import { getBlock, listBlocks } from "./blockRegistry.js";

export async function runBlockAIAction({ blockType, content, action = "improve", context = {} }) {
  const def = getBlock(blockType);
  if (!def) throw new Error(`Unknown block type: ${blockType}`);

  const template = def.ai.promptTemplates?.[action];
  const promptTemplate = template
    ? template.replace("{label}", def.label).replace("{targetLanguage}", context.targetLanguage || "English")
    : undefined;

  const { data, error } = await supabase.functions.invoke("block-ai-action", {
    body: {
      blockType,
      fields: def.editorFields,
      content,
      action,
      promptTemplate,
      context,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  // Validate against block schema; fall back to raw if it fails
  const result = def.validate(data.content);
  return result.success ? result.data : data.content;
}

export async function suggestNextBlocks({ pageSlug, currentBlocks, context = {} } = {}) {
  const catalog = listBlocks({ canSuggest: true }).map((b) => ({
    type: b.type,
    label: b.label,
    category: b.category,
    description: b.description,
  }));

  const { data, error } = await supabase.functions.invoke("block-ai-suggest", {
    body: { pageSlug, currentBlocks: currentBlocks || [], catalog, context },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.suggestions || [];
}
