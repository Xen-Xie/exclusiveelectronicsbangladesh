// src/admin/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router";
import AdminNavbar from "./AdminNavbar";

function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <AdminNavbar />
      <main className="grow relative z-30">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
