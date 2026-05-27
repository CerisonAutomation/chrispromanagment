// @ts-nocheck
import { Outlet } from "react-router-dom";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function FrontendLayout() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default FrontendLayout;
