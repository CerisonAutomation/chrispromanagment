import ThemeController from "./ThemeController";
import type { Json } from "@/integrations/supabase/types";

interface Props {
  onSaveTheme: (theme: Json) => Promise<void>;
  isSaving: boolean;
}

export default function AdvancedThemeController({ onSaveTheme, isSaving }: Props) {
  return <ThemeController />;
}
