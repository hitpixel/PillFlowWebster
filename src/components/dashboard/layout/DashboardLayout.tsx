import React, { ReactNode } from "react";
import TopNavigation from "./TopNavigation";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine active item based on current path
  const getActiveItem = () => {
    if (currentPath.includes("/dashboard")) return "Dashboard";
    if (currentPath.includes("/scan-out")) return "Scan Out";
    if (currentPath.includes("/customers")) return "Customers";
    if (currentPath.includes("/schedule")) return "Schedule";
    if (currentPath.includes("/reports")) return "Reports";
    if (currentPath.includes("/settings")) return "Settings";
    return "";
  };

  return (
    <div className="flex min-h-screen bg-[#0a0e17]">
      <Sidebar activeItem={getActiveItem()} />
      <div className="flex flex-1 flex-col">
        <TopNavigation title={title || getActiveItem()} />
        <main className="flex-1 overflow-auto bg-[#0a0e17] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
