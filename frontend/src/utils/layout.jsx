import React from "react";
import { Outlet } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/Common/WhatsAppButton";

function Layout() {
  return (
    <>
      <div className="flex flex-col min-h-screen relative">
        <Navigation />
        <main className="grow relative z-30">
          <Outlet />
        </main>
        <WhatsAppButton />
        <Footer />
      </div>
    </>
  );
}

export default Layout;
