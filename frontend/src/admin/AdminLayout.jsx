// src/admin/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router";
import AdminNavbar from "./AdminNavbar";

function AdminLayout() {
  return (
    <div>
      <AdminNavbar />
      <main className="p-4 bg-gray-100 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
