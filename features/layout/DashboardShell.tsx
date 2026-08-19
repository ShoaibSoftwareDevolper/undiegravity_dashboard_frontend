"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface DashboardShellProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function DashboardShell({ children, isAuthenticated }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If on login page or not authenticated, render plain centered layout
  if (pathname === "/login" || !isAuthenticated) {
    return <main className="min-h-full flex items-center justify-center p-4">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col lg:pl-64">
        {/* Sticky Header */}
        <TopHeader onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
