import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider, Helmet } from "react-helmet-async";

// Pages
import { LandingPage } from "@/pages/LandingPage";
import { PropertiesPage } from "@/pages/PropertiesPage";
import { PropertyDetailPage } from "@/pages/PropertyDetailPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { PropertyOwnersPage } from "@/pages/PropertyOwnersPage";
import { MapPage } from "@/pages/MapPageLeaflet";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import { StickyCallToAction } from "@/components/StickyCallToAction";

// Layout
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Modals
import { ContactModal } from "@/components/modals/ContactModal";
import { PropertyOwnerModal } from "@/components/modals/PropertyOwnerModal";

// Context
import { ModalProvider } from "@/context/ModalContext";
import { CMSProvider } from "@/context/CMSContext";
import EditModeBridge from "@/components/EditModeBridge";

// Simple SEO that doesn't break
function AppSEO() {
  const location = useLocation();
  // Skip SEO on admin pages
  if (location.pathname.startsWith('/admin')) return null;
  
  return (
    <Helmet>
      <title>Christiano Property Management | Malta Vacation Rentals</title>
      <meta name="description" content="Malta's premier luxury short-term rental management company." />
    </Helmet>
  );
}

// Smooth-scroll to #hash anchors on route change so dropdown menu items land on the right section
function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Wait a tick for the destination page to mount
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);
  return null;
}

function AppContent() {
  return (
    <>
      <EditModeBridge />
      <AppSEO />
      <ScrollToHash />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/en" element={<LandingPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/en/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/en/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/checkout/:quoteId" element={<CheckoutPage />} />
          <Route path="/en/checkout/:quoteId" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/en/confirmation" element={<ConfirmationPage />} />
          <Route path="/property-owners" element={<PropertyOwnersPage />} />
          <Route path="/for-owners" element={<PropertyOwnersPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/en/map" element={<MapPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
      <StickyCallToAction />
      <Toaster position="top-right" richColors />
      <ContactModal />
      <PropertyOwnerModal />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <CMSProvider>
        <ModalProvider>
          <div className="min-h-screen bg-[#0F0F10]">
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </div>
        </ModalProvider>
      </CMSProvider>
    </HelmetProvider>
  );
}

export default App;
