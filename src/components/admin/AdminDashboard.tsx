import { FileText, Settings, Clock, Eye, EyeOff, ArrowRight } from "lucide-react";
import type { CmsContent, CmsSetting } from "@/hooks/use-cms";

interface Props {
  sections: CmsContent[];
  settings: CmsSetting[];
  onNavigate: (tab: string, section?: string) => void;
}

export default function AdminDashboard({ sections, settings, onNavigate }: Props) {
  const visibleCount = sections.filter((s) => s.is_visible).length;
  const hiddenCount = sections.length - visibleCount;

  const recentlyUpdated = [...sections]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your website content</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-surface rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Sections</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{sections.length}</p>
        </div>
        <div className="glass-surface rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Visible</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{visibleCount}</p>
        </div>
        <div className="glass-surface rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff size={16} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Hidden</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{hiddenCount}</p>
        </div>
        <div className="glass-surface rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Settings</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{settings.length}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate("sections")}
          className="glass-surface rounded-lg p-5 text-left hover:border-primary/30 transition-colors group"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Edit Content</h3>
          <p className="text-xs text-muted-foreground">Update section text, images, and visibility</p>
          <ArrowRight size={14} className="text-primary mt-3 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => onNavigate("settings")}
          className="glass-surface rounded-lg p-5 text-left hover:border-primary/30 transition-colors group"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Site Settings</h3>
          <p className="text-xs text-muted-foreground">Manage global site configuration</p>
          <ArrowRight size={14} className="text-primary mt-3 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => onNavigate("integrations")}
          className="glass-surface rounded-lg p-5 text-left hover:border-primary/30 transition-colors group"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Integrations</h3>
          <p className="text-xs text-muted-foreground">Google Sheets, Zapier, API webhooks</p>
          <ArrowRight size={14} className="text-primary mt-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Recently updated */}
      <div className="glass-surface rounded-lg p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Recently Updated</h3>
        <div className="space-y-3">
          {recentlyUpdated.map((s) => (
            <button
              key={s.section_key}
              onClick={() => onNavigate("sections", s.section_key)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${s.is_visible ? "bg-green-500" : "bg-border"}`} />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{s.section_label}</p>
                  <p className="text-xs text-muted-foreground">{s.section_key}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                {formatTimeAgo(s.updated_at)}
              </div>
            </button>
          ))}
          {recentlyUpdated.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No sections yet. Create content to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
