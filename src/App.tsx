import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import Owners from "./pages/Owners";
import Admin from "./pages/Admin";
import AdminCMS from "./pages/AdminCMS";
import AdminInquiries from "./pages/AdminInquiries";
import NotFound from "./pages/NotFound";

const qc = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Toaster theme="dark" position="top-center" richColors />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/cms" element={<AdminCMS />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
