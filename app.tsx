import "@/App.css";
import { useEffect } from "react";
import { CheckoutPage } from "@/pages/checkout-page";
import { ConfirmationPage } from "@/pages/confirmation-page";
import { ContactModal } from "@/components/modals/ContactModal";
import { CMSProvider } from "@/context/cmscontext";
import { ErrorBoundary } from "@/components/error-boundary";
import EditModeBridge from "@/components/edit-mode-bridge";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LandingPage } from "@/pages/landing-page";
import { MapPage } from "@/pages/map-page-leaflet";
import { ModalProvider } from "@/context/modal-context";
import { PropertiesPage } from "@/pages/properties-page";
import { PropertyDetailPage } from "@/pages/property-detail-page";
import { PropertyOwnerModal } from "@/components/modals/PropertyOwnerModal";
import { PropertyOwnersPage } from "@/pages/property-owners-page";
import { StickyCallToAction } from "@/components/sticky-call-to-action";
import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { app } from "@/lib/utils";
import { modalContext } from "@/context/modal-context";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { initializeSecurity } from "@/lib/security/security-middleware";

// Simple SEO that doesn't break
function AppSEO() {
  const location = useLocation();
  // Skip SEO on admin pages
  if (location.pathname.startsWith('/admin')) {
return null;
}
  
  return (
    <Helmet>
      <title>Christiano Property Management | Malta Vacation Rentals</title>
      <meta name="description" content="Malta's premier luxury short-term rental management company." />
    </Helmet>
  );
}

// Smooth-scroll to #hash anchors on route change
function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);
  return null;
}

// Skip link for accessibility
function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-background focus:p-2 focus:rounded"
    >
      Skip to content
    </a>
  );
}

export default function App() {
  // Initialize security middleware on app load
  useEffect(() => {
    initializeSecurity({
      enableCSRF: true,
      enableRateLimit: true,
      enableSecurityHeaders: true,
      enableInputValidation: true,
      enableSecurityLogging: true,
      rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
      rateLimitMaxRequests: 100,
    });
  }, []);

  return (
    <ErrorBoundary>
      <CMSProvider>
        <ModalProvider>
          <HelmetProvider>
            <BrowserRouter>
              <SecurityHeaders />
              <ScrollToHash />
              <SkipLink />
              <Header />
              <main id="main-content" className="min-h-[calc(100vh-4rem)]">
                <AppSEO />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/checkout/:quoteId?" element={<CheckoutPage />} />
                  <Route path="/confirmation" element={<ConfirmationPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin/*" element={<AdminPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/property-owners" element={<PropertyOwnersPage />} />
                </Routes>
              </main>
              <Footer />
              <ContactModal />
              <PropertyOwnerModal />
              <StickyCallToAction />
              <Toaster />
            </BrowserRouter>
          </HelmetProvider>
        </ModalProvider>
      </CMSProvider>
    </ErrorBoundary>
  );
}
