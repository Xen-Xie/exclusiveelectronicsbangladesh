import React from "react";
import { Outlet, useLocation } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/Common/WhatsAppButton";

function Layout() {
  const location = useLocation();

  // Normalize pathname (remove trailing slash)
  const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";

  // Define routes that should have the full layout
  const routesWithLayout = [
    "/",
    "/sign-up",
    "/login",
    "/google-callback",
    "/products",
    "/checkout",
    "/profile",
    "/about",
    "/contact",
    "/payment-success",
    "/payment-cancelled",
    "/payment-failed",
    "/terms-and-conditions",
  ];

  // Check if current path matches any known route pattern
  const isKnownRoute =
    routesWithLayout.includes(normalizedPath) ||
    normalizedPath.startsWith("/products/") ||
    normalizedPath.startsWith("/category/") ||
    normalizedPath.startsWith("/profile/");

  return (
    <>
      <div className="flex flex-col min-h-screen relative">
        {isKnownRoute && <Navigation />}
        <main className="grow relative z-30">
          <Outlet />
        </main>
        <WhatsAppButton />
        {isKnownRoute && <Footer />}
      </div>
    </>
  );
}

export default Layout;
