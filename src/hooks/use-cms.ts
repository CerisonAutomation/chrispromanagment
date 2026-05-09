import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface CmsContent {
  id: string;
  section_key: string;
  section_label: string;
  content: Json;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

export interface CmsSetting {
  id: string;
  setting_key: string;
  setting_label: string;
  setting_value: Json;
  setting_group: string;
}

export function useCmsContent() {
  return useQuery({
    queryKey: ["cms-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_content")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CmsContent[];
    },
  });
}

export function useCmsSection(sectionKey: string) {
  return useQuery({
    queryKey: ["cms-content", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_content")
        .select("*")
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (error) throw error;
      return data as CmsContent;
    },
  });
}

export function useCmsSettings() {
  return useQuery({
    queryKey: ["cms-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_settings")
        .select("*")
        .order("setting_group");
      if (error) throw error;
      return data as CmsSetting[];
    },
  });
}

export function useUpdateCmsContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionKey, content, isVisible }: { sectionKey: string; content: Json; isVisible?: boolean }) => {
      const update: { content: Json; is_visible?: boolean } = { content };
      if (isVisible !== undefined) update.is_visible = isVisible;
      const { error } = await supabase
        .from("cms_content")
        .update(update)
        .eq("section_key", sectionKey);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-content"] });
    },
  });
}

export function useUpdateCmsSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ settingKey, value }: { settingKey: string; value: Json }) => {
      const { error } = await supabase
        .from("cms_settings")
        .update({ setting_value: value })
        .eq("setting_key", settingKey);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-settings"] });
    },
  });
}
