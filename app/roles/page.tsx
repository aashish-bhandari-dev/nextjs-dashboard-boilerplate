"use client";

import * as React from "react";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { RolesTable } from "@/components/roles/roles-table";
import { PermissionsCatalogView } from "@/components/roles/permissions-catalog-view";
import { KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "cn";

export default function RolesPage() {
  const [activeTab, setActiveTab] = React.useState<"roles" | "permissions">("roles");

  return (
    <DashboardLayoutWrapper>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Roles & Permissions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage platform role definitions, privilege hierarchies, and granular authorization policies.
            </p>
          </div>

          {/* Navigation Pill Tabs - Modern Crisp Segmented Toggle */}
          <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl self-start sm:self-auto border border-border/70 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "roles"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className={cn("size-3.5", activeTab === "roles" ? "text-primary" : "text-muted-foreground")} />
              <span>Roles Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "permissions"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <KeyRound className={cn("size-3.5", activeTab === "permissions" ? "text-primary" : "text-muted-foreground")} />
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

