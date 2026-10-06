"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardTopbar />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 min-w-0 max-w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
