"use client";

import * as React from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { QuickActions } from "@/components/dashboard/quick-actions";

export function DashboardView() {
  return (
    <SidebarProvider>
      {/* Official shadcn Sidebar */}
      <DashboardSidebar />

      {/* Main Inset Content Area */}
      <SidebarInset>
        <DashboardTopbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Welcome back! Here is a summary of your platform analytics and activities.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-4 w-4" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <DashboardStats />

          {/* Tables & Activity Section */}
          <div className="grid gap-6 md:grid-cols-7">
            <RecentInvoices />
            <QuickActions />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
