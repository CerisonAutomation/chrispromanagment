import { useState } from "react";
import { ArrowLeft, ExternalLink, Settings } from "lucide-react";

export default function QloApps() {
  const [qloUrl, setQloUrl] = useState(() => localStorage.getItem("qlo_url") || "");
  const [showSetup, setShowSetup] = useState(!localStorage.getItem("qlo_url"));

  const saveUrl = () => {
    localStorage.setItem("qlo_url", qloUrl);
    setShowSetup(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Back to Site
          </a>
          <h1 className="font-serif text-lg font-semibold text-foreground">Property Management</h1>
        </div>
        <div className="flex items-center gap-3">
          {qloUrl && (
            <a href={qloUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink size={14} /> Open in new tab
            </a>
          )}
          <button onClick={() => setShowSetup(true)} className="p-2 text-muted-foreground hover:text-foreground rounded transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </header>

      {showSetup ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md glass-surface rounded-xl p-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Connect QloApps</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your QloApps instance URL to embed the property management system.</p>
            <input
              type="url"
              value={qloUrl}
              onChange={(e) => setQloUrl(e.target.value)}
              placeholder="https://your-qloapps-instance.com"
              className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-4"
            />
            <button
              onClick={saveUrl}
              disabled={!qloUrl}
              className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-gold-light disabled:opacity-40 transition-colors"
            >
              Connect & Embed
            </button>
          </div>
        </div>
      ) : qloUrl ? (
        <iframe
          src={qloUrl}
          className="flex-1 w-full border-none"
          title="QloApps Property Management"
          allow="fullscreen"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No QloApps URL configured
        </div>
      )}
    </div>
  );
}
