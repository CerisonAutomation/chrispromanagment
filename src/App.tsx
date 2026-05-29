import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// Route-level code splitting — each route is its own chunk
const Landing        = lazy(() => import("./pages/Landing"));
const Auth           = lazy(() => import("./pages/Auth"));
const Booking        = lazy(() => import("./pages/Booking"));
const ListingDetail  = lazy(() => import("./pages/ListingDetail"));
const Owners         = lazy(() => import("./pages/Owners"));
const Admin          = lazy(() => import("./pages/Admin"));
const AdminCMS       = lazy(() => import("./pages/AdminCMS"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));
const NotFound       = lazy(() => import("./pages/NotFound"));

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,
      gcTime:               1000 * 60 * 10,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Toaster theme="dark" position="top-center" richColors closeButton />
          <ErrorBoundary>
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                <Route path="/"                element={<Landing />} />
                <Route path="/auth"            element={<Auth />} />
                <Route path="/booking"         element={<Booking />} />
                <Route path="/listing/:id"     element={<ListingDetail />} />
                <Route path="/owners"          element={<Owners />} />
                <Route path="/admin"           element={<Admin />} />
                <Route path="/admin/cms"       element={<AdminCMS />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="*"               element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
