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
import ScrollSection from "@/components/ScrollSection";

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const openWizard = () => setWizardOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={openWizard} />
      <main id="main">
        <ScrollSection>
          <Hero onOpenWizard={openWizard} />
        </ScrollSection>
        <ScrollSection>
          <ProofStrip />
        </ScrollSection>
        <ScrollSection>
          <ProcessSection onOpenWizard={openWizard} />
        </ScrollSection>
        <ScrollSection>
          <PortfolioSection />
        </ScrollSection>
        <ScrollSection>
          <PricingSection onOpenWizard={openWizard} />
        </ScrollSection>
        <ScrollSection>
          <TestimonialsSection />
        </ScrollSection>
        <ScrollSection>
          <AboutSection onOpenWizard={openWizard} />
        </ScrollSection>
        <ScrollSection>
          <CTABanner onOpenWizard={openWizard} />
        </ScrollSection>
        <ScrollSection>
          <FAQSection />
        </ScrollSection>
      </main>
      <Footer />
      <FloatingCTA onOpenWizard={openWizard} />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
