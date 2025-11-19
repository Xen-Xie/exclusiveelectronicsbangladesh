import React from "react";
import { Outlet } from "react-router";
import Navigation from "../components/Navigation";

function Layout() {
  return (
    <>
      <div className="flex flex-col min-h-screen relative">
        <Navigation />
        <main className="grow relative z-30">
          <Outlet />
          
        </main>
        
      </div>
    </>
  );
}

export default Layout;