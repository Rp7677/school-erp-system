import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import api from "../../../config/api";
import TabsBar from "./TabsBar";

const StaffLayout = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Selectors
  const bgColor = useSelector((state) => state.color.bgColor);
  const themeMode = useSelector((state) => state.color.mode);

  const tabs = useSelector((state) => state.tabs.tabs);
  const activePath = useSelector((state) => state.tabs.activePath);

  useEffect(() => {
    localStorage.setItem("activeTabs", JSON.stringify(tabs));
    localStorage.setItem("activePath", activePath);
  }, [tabs, activePath]);

  // useEffect(() => {
  //   const fetchDashboard = async () => {
  //     try {
  //       const res = await api.get("/dashboard");
  //       setDashboardData(res.data);
  //     } catch (err) {
  //       console.error("Dashboard Error:", err.response?.data);
  //     }
  //   };
  //   fetchDashboard();
  // }, []);

  return (
    <div
      className="flex h-screen w-full overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: bgColor }}
    >
      {/* 1. SIDEBAR: Fixed to the left */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. RIGHT CONTENT AREA: Vertical stack of Header + Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* HEADER: Always at the top */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <TabsBar />

        {/* MAIN CONTENT: Scrollable area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide relative">
          <div
            className={`w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 ${
              themeMode === "dark" ? "text-white" : "text-[#1A1A1A]"
            }`}
          >
            <Outlet context={{ dashboardData }} />
          </div>

          {/* Background Glow Effect from your screenshot */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#FBCB84]/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-0" />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
