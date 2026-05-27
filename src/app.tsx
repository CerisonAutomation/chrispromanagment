// @ts-nocheck
import "@/App.css";
import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { HelmetProvider } from "react-helmet-async";
import { CMSProvider } from "@/context/cmscontext";
import { ModalProvider } from "@/context/modal-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { FrontendLayout } from "@/layouts/FrontendLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

interface PageModule {
  default?: React.ComponentType;
  [key: string]: React.ComponentType | unknown;
}

const LandingPage            = lazy(() => import("@/pages/landing-page").then((m: PageModule) => ({ default: (m.LandingPage ?? m.default) as React.ComponentType })));
const PropertiesPage         = lazy(() => import("@/pages/properties-page").then((m: PageModule) => ({ default: (m.PropertiesPage ?? m.default) as React.ComponentType })));
const PropertyDetailPage     = lazy(() => import("@/pages/property-detail-page").then((m: PageModule) => ({ default: (m.PropertyDetailPage ?? m.default) as React.ComponentType })));
const CheckoutPage           = lazy(() => import("@/pages/checkout-page").then((m: PageModule) => ({ default: (m.CheckoutPage ?? m.default) as React.ComponentType })));
const ConfirmationPage       = lazy(() => import("@/pages/confirmation-page").then((m: PageModule) => ({ default: (m.ConfirmationPage ?? m.default) as React.ComponentType })));
const AuthPage               = lazy(() => import("@/pages/auth-page"));
const AdminPage              = lazy(() => import("@/pages/AdminPage"));
const MapPage                = lazy(() => import("@/pages/map-page-leaflet").then((m: PageModule) => ({ default: (m.MapPage ?? m.default) as React.ComponentType })));
const PropertyOwnersPage     = lazy(() => import("@/pages/property-owners-page").then((m: PageModule) => ({ default: (m.PropertyOwnersPage ?? m.default) as React.ComponentType })));
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

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-bold text-white/10 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-[#F5F5F0] mb-2">Page not found</h1>
      <p className="text-[#A1A1AA] mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-[#C9A84C] text-[#0A0A0B] font-semibold rounded hover:bg-[#C9A84C]/90 transition-colors">
        Go home
      </a>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = true }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { session, isAdmin, isLoading } = useAuthStore();
  if (isLoading) return <PageFallback />;
  if (!session) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

export default function App() {
  useEffect(() => {
    useAuthStore.getState().init();
    import('@/core/service-container').then(m => {
      m.registerCoreServices?.();
    }).catch((error) => {
      console.error('[app] service container registration failed:', error)
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <CMSProvider>
        <ModalProvider>
          <HelmetProvider>
            <BrowserRouter>
              <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Standalone auth — no layout wrapper, no nav/footer */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Public frontend */}
                <Route element={<FrontendLayout />}>
                  <Route path="/"                   element={<LandingPage />} />
                  <Route path="/properties"         element={<PropertiesPage />} />
                  <Route path="/property/:id"       element={<PropertyDetailPage />} />
                  <Route path="/checkout/:quoteId?" element={<CheckoutPage />} />
                  <Route path="/confirmation"       element={<ConfirmationPage />} />
                  <Route path="/map"                element={<MapPage />} />
                  <Route path="/property-owners"    element={<PropertyOwnersPage />} />
                  <Route path="/ar"                 element={<ARViewPage />} />
                  <Route path="/chat"               element={<ChatPage />} />
                  <Route path="/concierge"          element={<ConciergePage />} />
                  <Route path="/owner-view"         element={<OwnerViewPage />} />
                  <Route path="/privacy-policy"     element={<PrivacyPolicyPage />} />
                  <Route path="/terms"              element={<TermsPage />} />
                </Route>

                {/* Admin — all under /admin/, requires admin role */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin"              element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                  <Route path="/admin/*"            element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                  <Route path="/admin/analytics"    element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                  <Route path="/admin/audit-logs"   element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
                  <Route path="/admin/automation"   element={<ProtectedRoute><AutomationRulesPage /></ProtectedRoute>} />
                  <Route path="/admin/errors"       element={<ProtectedRoute><ErrorDashboardPage /></ProtectedRoute>} />
                  <Route path="/admin/listings"     element={<ProtectedRoute><ListingsManagementPage /></ProtectedRoute>} />
                  <Route path="/admin/maintenance"  element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
                  <Route path="/admin/booking"      element={<ProtectedRoute><OfflineBookingPage /></ProtectedRoute>} />
                  <Route path="/admin/owner-portal" element={<ProtectedRoute><OwnerPortalPage /></ProtectedRoute>} />
                  <Route path="/admin/pricing"      element={<ProtectedRoute><PricingEnginePage /></ProtectedRoute>} />
                  <Route path="/admin/tokens"       element={<ProtectedRoute><PropertyTokensPage /></ProtectedRoute>} />
                  <Route path="/admin/tax-reports"  element={<ProtectedRoute><TaxReportsPage /></ProtectedRoute>} />

                  {/* Legacy redirects so old bookmarks don't 404 */}
                  <Route path="/analytics"          element={<Navigate to="/admin/analytics" replace />} />
                  <Route path="/audit-logs"         element={<Navigate to="/admin/audit-logs" replace />} />
                  <Route path="/automation"         element={<Navigate to="/admin/automation" replace />} />
                  <Route path="/error-dashboard"    element={<Navigate to="/admin/errors" replace />} />
                  <Route path="/listings"           element={<Navigate to="/admin/listings" replace />} />
                  <Route path="/maintenance"        element={<Navigate to="/admin/maintenance" replace />} />
                  <Route path="/offline-booking"    element={<Navigate to="/admin/booking" replace />} />
                  <Route path="/owner-portal"       element={<Navigate to="/admin/owner-portal" replace />} />
                  <Route path="/pricing"            element={<Navigate to="/admin/pricing" replace />} />
                  <Route path="/tokens"             element={<Navigate to="/admin/tokens" replace />} />
                  <Route path="/tax-reports"        element={<Navigate to="/admin/tax-reports" replace />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </HelmetProvider>
        </ModalProvider>
      </CMSProvider>
    </ErrorBoundary>
    </QueryClientProvider>
  );
}
