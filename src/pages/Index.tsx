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
      <ScrollSection fitScreen sectionKey="hero">
        <Hero onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection sectionKey="proofStrip">
        <ProofStrip />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="process">
        <ProcessSection onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="portfolio">
        <PortfolioSection />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="pricing">
        <PricingSection onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="testimonials">
        <TestimonialsSection />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="about">
        <AboutSection onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="ctaBanner">
        <CTABanner onOpenWizard={openWizard} />
      </ScrollSection>
      <ScrollSection fitScreen sectionKey="faq">
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

