/**
 * Shared Layout — wraps every public page with the same Navbar + Footer.
 * Wizard state lives here so any page can open it via context.
 */
import { useState, createContext, useContext, useEffect, type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WizardModal from "./WizardModal";
import FloatingCTA from "./FloatingCTA";
import { useCmsRealtime } from "@/hooks/use-cms-realtime";

interface WizardCtx {
  openWizard: () => void;
}

const WizardContext = createContext<WizardCtx>({ openWizard: () => {} });
export const useWizard = () => useContext(WizardContext);

interface LayoutProps {
  children: ReactNode;
  /** Override the navbar mode: guest | owner | home */
  mode?: "guest" | "owner" | "home";
  /** Hide floating CTA pill */
  hideFloatingCTA?: boolean;
}

export default function Layout({ children, mode = "home", hideFloatingCTA = false }: LayoutProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const openWizard = () => setWizardOpen(true);
  useCmsRealtime();

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as { type?: string; sectionKey?: string } | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "cms:scroll-to" && data.sectionKey) {
        const el = document.querySelector(`[data-section-key="${data.sectionKey}"]`);
        if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMsg);
    window.parent?.postMessage({ type: "cms:ready" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <WizardContext.Provider value={{ openWizard }}>
      <div className="min-h-screen bg-background">
        <Navbar onOpenWizard={openWizard} mode={mode} />
        <main id="main">{children}</main>
        <Footer />
        {!hideFloatingCTA && <FloatingCTA onOpenWizard={openWizard} />}
        <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
      </div>
    </WizardContext.Provider>
  );
}
