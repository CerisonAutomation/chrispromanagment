import "@/App.css";
import { useEffect, lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { CMSProvider } from "@/context/cmscontext";
import { ModalProvider } from "@/context/modal-context";
import { ErrorBoundary } from "@/components/error-boundary";
import EditModeBridge from "@/components/edit-mode-bridge";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ContactModal } from "@/components/modals/ContactModal";
import { PropertyOwnerModal } from "@/components/modals/PropertyOwnerModal";
import { StickyCallToAction } from "@/components/sticky-call-to-action";
import { CookieConsent } from "@/components/cookie-consent";
import { Toaster } from "@/components/ui/sonner";

const LandingPage            = lazy(() => import("@/pages/landing-page").then((m: any) => ({ default: m.LandingPage ?? m.default })));
const PropertiesPage         = lazy(() => import("@/pages/properties-page").then((m: any) => ({ default: m.PropertiesPage ?? m.default })));
const PropertyDetailPage     = lazy(() => import("@/pages/property-detail-page").then((m: any) => ({ default: m.PropertyDetailPage ?? m.default })));
const CheckoutPage           = lazy(() => import("@/pages/checkout-page").then((m: any) => ({ default: m.CheckoutPage ?? m.default })));
const ConfirmationPage       = lazy(() => import("@/pages/confirmation-page").then((m: any) => ({ default: m.ConfirmationPage ?? m.default })));
const AuthPage               = lazy(() => import("@/pages/auth-page"));
const AdminPage              = lazy(() => import("@/pages/AdminPage"));
const MapPage                = lazy(() => import("@/pages/map-page-leaflet").then((m: any) => ({ default: m.MapPage ?? m.default })));
const PropertyOwnersPage     = lazy(() => import("@/pages/property-owners-page").then((m: any) => ({ default: m.PropertyOwnersPage ?? m.default })));
const AnalyticsDashboard     = lazy(() => import("@/pages/analytics-dashboard-page"));
const ARViewPage             = lazy(() => import("@/pages/arview-page"));
const AuditLogsPage          = lazy(() => import("@/pages/audit-logs-page"));
const AutomationRulesPage    = lazy(() => import("@/pages/automation-rules-page"));
const ChatPage               = lazy(() => import("@/pages/chat-page"));
const ConciergePage          = lazy(() => import("@/pages/concierge-page"));
const ErrorDashboardPage     = lazy(() => import("@/pages/error-dashboard-page"));
const ListingsManagementPage = lazy(() => import("@/pages/listings-management-page"));
const MaintenancePage        = lazy(() => import("@/pages/maintenance-page"));
const OfflineBookingPage     = lazy(() => import("@/pages/offline-booking"));
const OwnerPortalPage        = lazy(() => import("@/pages/owner-portal-page"));
const PricingEnginePage      = lazy(() => import("@/pages/pricing-engine-page"));
const PropertyTokensPage     = lazy(() => import("@/pages/property-tokens-page"));
const TaxReportsPage         = lazy(() => import("@/pages/tax-reports-page"));
const PrivacyPolicyPage      = lazy(() => import("@/pages/privacy-policy-page"));
const TermsPage              = lazy(() => import("@/pages/terms-page"));
const OwnerViewPage          = lazy(() => import("@/pages/owner-view-page"));

function AppSEO() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return (
    <Helmet>
      <title>Christiano Property Management | Malta Vacation Rentals</title>
      <meta name="description" content="Malta's premier luxury short-term rental management company." />
      <meta property="og:title" content="Christiano Property Management | Malta Vacation Rentals" />
      <meta property="og:description" content="Malta's premier luxury short-term rental management company." />
      <meta property="og:type" content="website" />
      <link rel="canonical" href={`https://chrispromanagement.com${location.pathname}`} />
    </Helmet>
  );
}

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);
  return null;
}

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-background focus:p-2 focus:rounded z-50"
    >
      Skip to content
    </a>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-bold text-white/10 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-[#F5F5F0] mb-2">Page not found</h1>
      <p className="text-[#A1A1AA] mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0B] font-semibold rounded hover:bg-[#D4AF37]/90 transition-colors">
        Go home
      </a>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!checked) return <PageFallback />;
  if (!authed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <CMSProvider>
        <ModalProvider>
          <HelmetProvider>
            <BrowserRouter>
              <ScrollToHash />
              <SkipLink />
              <EditModeBridge />
              <Header />
              <main id="main-content" className="min-h-[calc(100vh-4rem)]">
                <AppSEO />
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/"                  element={<LandingPage />} />
                    <Route path="/properties"        element={<PropertiesPage />} />
                    <Route path="/property/:id"      element={<PropertyDetailPage />} />
                    <Route path="/checkout/:quoteId?" element={<CheckoutPage />} />
                    <Route path="/confirmation"      element={<ConfirmationPage />} />
                    <Route path="/auth"              element={<AuthPage />} />
                    <Route path="/admin/*"           element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    <Route path="/map"               element={<MapPage />} />
                    <Route path="/property-owners"   element={<PropertyOwnersPage />} />
                    <Route path="/analytics"         element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/ar"                element={<ARViewPage />} />
                    <Route path="/audit-logs"        element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
                    <Route path="/automation"        element={<ProtectedRoute><AutomationRulesPage /></ProtectedRoute>} />
                    <Route path="/chat"              element={<ChatPage />} />
                    <Route path="/concierge"         element={<ConciergePage />} />
                    <Route path="/error-dashboard"   element={<ProtectedRoute><ErrorDashboardPage /></ProtectedRoute>} />
                    <Route path="/listings"          element={<ProtectedRoute><ListingsManagementPage /></ProtectedRoute>} />
                    <Route path="/maintenance"       element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
                    <Route path="/offline-booking"   element={<ProtectedRoute><OfflineBookingPage /></ProtectedRoute>} />
                    <Route path="/owner-portal"      element={<ProtectedRoute><OwnerPortalPage /></ProtectedRoute>} />
                    <Route path="/pricing"           element={<ProtectedRoute><PricingEnginePage /></ProtectedRoute>} />
                    <Route path="/tokens"            element={<ProtectedRoute><PropertyTokensPage /></ProtectedRoute>} />
                    <Route path="/tax-reports"       element={<ProtectedRoute><TaxReportsPage /></ProtectedRoute>} />
                    <Route path="/owner-view"         element={<OwnerViewPage />} />
                    <Route path="/privacy-policy"    element={<PrivacyPolicyPage />} />
                    <Route path="/terms"             element={<TermsPage />} />
                    <Route path="*"                  element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <ContactModal />
              <PropertyOwnerModal />
              <StickyCallToAction />
              <CookieConsent />
              <Toaster />
            </BrowserRouter>
          </HelmetProvider>
        </ModalProvider>
      </CMSProvider>
    </ErrorBoundary>
  );
}
