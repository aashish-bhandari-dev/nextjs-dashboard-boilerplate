"use client";

import * as React from "react";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { RolesTable } from "@/components/roles/roles-table";
import { PermissionsCatalogView } from "@/components/roles/permissions-catalog-view";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function RolesPage() {
  const [activeTab, setActiveTab] = React.useState<"roles" | "permissions">("roles");

  return (
    <DashboardLayoutWrapper>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-xs text-muted-foreground">
              Manage platform role definitions, privilege hierarchies, and granular authorization policies.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg self-start sm:self-auto border border-border/50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "roles"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>Roles Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "permissions"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="size-3.5" />
              <span>Permissions Matrix</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "roles" ? (
          <RolesTable />
        ) : (
          <PermissionsCatalogView />
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}
