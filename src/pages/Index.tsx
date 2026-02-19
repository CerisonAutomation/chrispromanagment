import { useWizard } from "@/components/Layout";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import ProofStrip from "@/components/ProofStrip";
import ProcessSection from "@/components/ProcessSection";
import PortfolioSection from "@/components/PortfolioSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";
import ScrollSection from "@/components/ScrollSection";

function IndexContent() {
  const { openWizard } = useWizard();

  return (
    <>
      <ScrollSection fitScreen>
        <Hero onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection>
        <ProofStrip />
      </ScrollSection>
      <ScrollSection fitScreen>
        <ProcessSection onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen>
        <PortfolioSection />
      </ScrollSection>
      <ScrollSection fitScreen>
        <PricingSection onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen>
        <TestimonialsSection />
      </ScrollSection>
      <ScrollSection fitScreen>
        <AboutSection onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen>
        <CTABanner onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen>
        <FAQSection />
      </ScrollSection>
    </>
  );
}

const Index = () => (
  <Layout mode="home">
    <IndexContent />
  </Layout>
);

export default Index;

