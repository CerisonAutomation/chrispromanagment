import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProofStrip from "@/components/ProofStrip";
import ProcessSection from "@/components/ProcessSection";
import PortfolioSection from "@/components/PortfolioSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import WizardModal from "@/components/WizardModal";

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const openWizard = () => setWizardOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={openWizard} />
      <main id="main">
        <Hero onOpenWizard={openWizard} />
        <ProofStrip />
        <ProcessSection onOpenWizard={openWizard} />
        <PortfolioSection />
        <PricingSection onOpenWizard={openWizard} />
        <TestimonialsSection />
        <AboutSection onOpenWizard={openWizard} />
        <CTABanner onOpenWizard={openWizard} />
        <FAQSection />
      </main>
      <Footer />
      <FloatingCTA onOpenWizard={openWizard} />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
