import { useState } from "react";
import {
  LayoutDashboard, Settings, Plug, LogOut, Eye, FileText, ChevronRight,
  Palette, Layers, Image, LayoutTemplate, Activity, ChevronLeft, Menu
} from "lucide-react";
import type { CmsContent } from "@/hooks/use-cms";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
  sections: CmsContent[];
  onLogout: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, activeSection, setActiveSection, sections, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "sections", label: "Content", icon: FileText },
    { key: "page-builder", label: "Page Builder", icon: Layers },
    { key: "pages", label: "Pages", icon: Layers },
    { key: "templates", label: "Templates", icon: LayoutTemplate },
    { key: "components", label: "Components", icon: Layers },
    { key: "media", label: "Media", icon: Image },
    { key: "theme", label: "Theme", icon: Palette },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "integrations", label: "Integrations", icon: Plug },
    { key: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <aside className={`min-h-screen bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">CMS Pro</h2>
            <p className="text-[0.6rem] text-muted-foreground">Full Site Control</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            title={collapsed ? t.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
              activeTab === t.key
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <t.icon size={16} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{t.label}</span>
                {activeTab === t.key && <ChevronRight size={12} />}
              </>
            )}
          </button>
        ))}

        {/* Section list when Content tab is active */}
        <AnimatePresence>
          {activeTab === "sections" && !collapsed && sections.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Sections</p>
                {sections.map((s) => (
                  <button
                    key={s.section_key}
                    onClick={() => setActiveSection(s.section_key)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      activeSection === s.section_key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.is_visible ? "bg-green-500" : "bg-border"}`} />
                      {s.section_label}
                    </span>
                    {!s.is_visible && <Eye size={10} className="opacity-30" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className={`p-2 border-t border-border space-y-0.5 ${collapsed ? "px-1" : ""}`}>
        <a
          href="/"
          target="_blank"
          className={`flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Preview Site" : undefined}
        >
          <Eye size={14} /> {!collapsed && "Preview Site"}
        </a>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={14} /> {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
