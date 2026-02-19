/**
 * Shared Layout — wraps every public page with the same Navbar + Footer.
 * Wizard state lives here so any page can open it via context.
 */
import { useState, createContext, useContext, type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WizardModal from "./WizardModal";
import FloatingCTA from "./FloatingCTA";

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
