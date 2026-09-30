import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { QuickActions } from "@/components/dashboard/quick-actions";

export function DashboardView() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Welcome back! Here is a summary of your platform analytics and
              activities.
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
    </div>
  );
}
