import { LayoutDashboard, Settings, Plug, LogOut, Eye, FileText, ChevronRight } from "lucide-react";
import type { CmsContent } from "@/hooks/use-cms";

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
  sections: CmsContent[];
  onLogout: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, activeSection, setActiveSection, sections, onLogout }: Props) {
  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "sections", label: "Content", icon: FileText },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "integrations", label: "Integrations", icon: Plug },
  ];

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="font-serif text-lg font-semibold text-foreground">Site CMS</h2>
        <p className="text-xs text-muted-foreground">Christiano PM Admin</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              activeTab === t.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {activeTab === t.key && <ChevronRight size={12} className="ml-auto" />}
          </button>
        ))}

        {activeTab === "sections" && sections.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border space-y-0.5">
            <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Sections</p>
            {sections.map((s) => (
              <button
                key={s.section_key}
                onClick={() => setActiveSection(s.section_key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                  activeSection === s.section_key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
        )}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
        >
          <Eye size={14} /> Preview Site
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
