import React from "react";
import { Outlet } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/Common/WhatsAppButton";
import BottomNav from "../components/BottomNav";
import ScrollToTop from "../components/ScrollToTop";

function Layout() {
  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative">
        <Navigation />
        <main className="grow relative z-30">
          <Outlet />
        </main>
        <WhatsAppButton />
        <BottomNav />
        <Footer />
      </div>
    </>
  );
}

export default Layout;
