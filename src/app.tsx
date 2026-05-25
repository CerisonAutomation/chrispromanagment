import { useEffect, lazy, Suspense } from "react";
import { ContactModal } from "@/components/modals/ContactModal";
import { CMSProvider } from "@/context/cmscontext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import EditModeBridge from "@/components/EditModeBridge";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ModalProvider } from "@/context/modal-context";
import { StickyCallToAction } from "@/components/StickyCallToAction";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Lazy load page components for better performance
const CheckoutPage = lazy(() => import('@/pages/checkout-page'));
const ConfirmationPage = lazy(() => import('@/pages/confirmation-page'));
const LandingPage = lazy(() => import('@/pages/landing-page'));
const MapPage = lazy(() => import('@/pages/map-page-leaflet'));
const PropertiesPage = lazy(() => import('@/pages/properties-page'));
const PropertyDetailPage = lazy(() => import('@/pages/property-detail-page'));
const PropertyOwnersPage = lazy(() => import('@/pages/PropertyOwnersPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const PropertyOwnerModal = lazy(() => import('@/components/modals/PropertyOwnerModal'));

// Game-changer: Real-time booking updates
import { useRealtimeBookings } from "@/hooks/use-realtime-bookings";

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
  // Game-changer: Real-time booking notifications
  const { newBooking } = useRealtimeBookings();

  // Show notification for new bookings
  useEffect(() => {
    if (newBooking) {
      // You could show a toast notification here
      console.log('New booking received:', newBooking);
    }
  }, [newBooking]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
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
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <CMSProvider>
          <ModalProvider>
            <div className="min-h-screen bg-background-dark">
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </div>
          </ModalProvider>
        </CMSProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
