import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCmsRealtime } from "@/hooks/use-cms-realtime";
import { useCmsContent, useCmsSettings, useUpdateCmsContent, useUpdateCmsSetting } from "@/hooks/use-cms";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BlockEditor from "@/components/admin/BlockEditor";
import SettingsEditor from "@/components/admin/SettingsEditor";
import IntegrationsPanel from "@/components/admin/IntegrationsPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdvancedThemeController from "@/components/admin/AdvancedThemeController";
import DragDropPageBuilder, { type BlockConfig } from "@/components/admin/DragDropPageBuilder";
import PagesManager from "@/components/admin/PagesManager";
import MediaManager from "@/components/admin/MediaManager";
import ComponentLibrary from "@/components/admin/ComponentLibrary";
import TemplatesManager from "@/components/admin/TemplatesManager";
import ActivityFeed from "@/components/admin/ActivityFeed";
import MirrorCanvas from "@/components/admin/MirrorCanvas";
import type { Session } from "@supabase/supabase-js";

function PageBuilderWrapper({ onSave, isSaving }: { onSave: (key: string, content: Json) => Promise<void>; isSaving: boolean }) {
  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">Page Builder</h2>
      <DragDropPageBuilder
        blocks={blocks}
        onChange={setBlocks}
        onSave={() => onSave("page-builder", blocks as unknown as Json)}
        isSaving={isSaving}
      />
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("mirror");
  const [activeSection, setActiveSection] = useState<string>("hero");
  const { toast } = useToast();
  useCmsRealtime();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: sections, isLoading: sectionsLoading } = useCmsContent();
  const { data: settings, isLoading: settingsLoading } = useCmsSettings();
  const updateContent = useUpdateCmsContent();
  const updateSetting = useUpdateCmsSetting();

  const handleSaveContent = async (sectionKey: string, content: Json, isVisible?: boolean) => {
    try {
      await updateContent.mutateAsync({ sectionKey, content, isVisible });
      toast({ title: "✓ Saved", description: `${sectionKey} updated successfully` });
    } catch {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleSaveSetting = async (settingKey: string, value: Json) => {
    try {
      await updateSetting.mutateAsync({ settingKey, value });
      toast({ title: "✓ Saved", description: "Setting updated" });
    } catch {
      toast({ title: "Error", description: "Failed to save setting", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading admin...</p>
      </div>
    </div>
  );

  if (!session) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sections={sections || []}
        onLogout={() => supabase.auth.signOut()}
      />
      <main className={`flex-1 overflow-y-auto ${activeTab === "mirror" ? "p-6" : "p-6 lg:p-8"}`}>
        <div className={activeTab === "mirror" ? "w-full" : "max-w-5xl mx-auto"}>
          {activeTab === "mirror" && (
            <MirrorCanvas
              sections={sections || []}
              onSave={handleSaveContent}
              isSaving={updateContent.isPending}
            />
          )}
          {activeTab === "dashboard" && (
            <AdminDashboard
              sections={sections || []}
              settings={settings || []}
              onNavigate={(tab, section) => {
                setActiveTab(tab);
                if (section) setActiveSection(section);
              }}
            />
          )}
          {activeTab === "sections" && (
            <BlockEditor
              sections={sections || []}
              activeSection={activeSection}
              isLoading={sectionsLoading}
              onSave={handleSaveContent}
              isSaving={updateContent.isPending}
            />
          )}
          {activeTab === "pages" && <PagesManager />}
          {activeTab === "templates" && <TemplatesManager />}
          {activeTab === "components" && <ComponentLibrary />}
          {activeTab === "media" && <MediaManager />}
          {activeTab === "theme" && <AdvancedThemeController onSaveTheme={(t) => handleSaveSetting("theme", t)} isSaving={updateSetting.isPending} />}
          {activeTab === "page-builder" && (
            <PageBuilderWrapper onSave={handleSaveContent} isSaving={updateContent.isPending} />
          )}
          {activeTab === "settings" && (
            <SettingsEditor
              settings={settings || []}
              isLoading={settingsLoading}
              onSave={handleSaveSetting}
              isSaving={updateSetting.isPending}
            />
          )}
          {activeTab === "integrations" && (
            <IntegrationsPanel
              settings={settings || []}
              onSaveSetting={handleSaveSetting}
            />
          )}
          {activeTab === "activity" && <ActivityFeed />}
        </div>
      </main>
    </div>
  );
}
