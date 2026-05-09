import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to CMS table changes and invalidates relevant React Query caches.
 * Mount once at the app root (or on any page that should mirror live CMS edits).
 */
export function useCmsRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("cms-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cms_content" },
        () => {
          qc.invalidateQueries({ queryKey: ["cms-content"] });
          qc.invalidateQueries({ queryKey: ["cms-section"] });
          qc.invalidateQueries({ queryKey: ["cms-all-sections"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cms_settings" },
        () => qc.invalidateQueries({ queryKey: ["cms-settings"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cms_images" },
        () => qc.invalidateQueries({ queryKey: ["cms-images"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
