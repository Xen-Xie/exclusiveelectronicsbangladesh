import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Analysis from "../../admin/Analysis";
import { useAuth } from "../../auth/useAuth";
import ManiDashboard from "./ManiDashboard";

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: <i className="fa-solid fa-chart-line text-lg" />,
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: <i className="fa-solid fa-chart-pie text-lg" />,
    },
  ];

  const active = tab || "overview";

  const componentMap = {
    overview: <ManiDashboard />,
    analysis: <Analysis />,
  };

  const handleTabChange = (tabId) => {
    navigate(`/admin/dashboard/${tabId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen font-urbanist">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-16 group hover:w-56 transition-all duration-300 ease-out bg-[#0A0A0A] text-primarybg py-6 px-2 overflow-hidden select-none"
        aria-label="Sidebar"
      >
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-3 w-full px-2 py-3 rounded-lg transition-colors duration-200 cursor-pointer
                ${
                  active === item.id
                    ? "bg-primarybg/10"
                    : "hover:bg-primarybg/5"
                }`}
            >
              <div className="w-8 flex items-center justify-center">
                {item.icon}
              </div>
              <span
                className="text-sm font-medium whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                style={{ transitionDelay: "75ms" }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto px-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-primarybg/5 w-full"
          >
            <div className="w-8 flex items-center justify-center">
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </div>
            <span className="text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-1/2 z-50 -translate-y-1/2 rounded-r py-1.5 px-0.5 bg-[#0A0A0A] text-primarybg"
        aria-label="Open menu"
        onClick={() => setOpenMobileMenu(true)}
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* Mobile overlay */}
      {openMobileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-[#0A0A0A]/60 z-40"
          onClick={() => setOpenMobileMenu(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile off-canvas menu */}
      <nav
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#0A0A0A] text-primarybg z-50 transform transition-transform duration-300 ${
          openMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile menu"
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primarybg/10 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div>
                <div className="text-sm font-semibold text-primarybg">
                  {user?.name || "Admin"}
                </div>
                <div className="text-xs text-primarybg">
                  {user?.email || "Admin Panel"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpenMobileMenu(false)}
              className="p-2 rounded hover:bg-primarybg/5"
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="pt-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleTabChange(item.id);
                  setOpenMobileMenu(false);
                }}
                className={`flex items-center gap-4 w-full px-3 py-3 rounded-lg text-left transition-colors duration-150 ${
                  active === item.id
                    ? "bg-primarybg/10"
                    : "hover:bg-primarybg/5"
                }`}
              >
                <div className="w-8 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}

            {/* Mobile Logout */}
            <button
              onClick={() => {
                handleLogout();
                setOpenMobileMenu(false);
              }}
              className="flex items-center gap-4 w-full px-3 py-3 rounded-lg text-left hover:bg-primarybg/5 mt-4"
            >
              <div className="w-8 flex items-center justify-center">
                <i className="fa-solid fa-right-from-bracket text-lg"></i>
              </div>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:pl-6">
        <div className="max-w-4xl mx-auto">{componentMap[active]}</div>
      </main>
    </div>
  );
}
