"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Layers,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RevenueOverviewChart } from "@/components/dashboard/revenue-overview-chart";
import { ChannelDistributionChart } from "@/components/dashboard/channel-distribution-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardView() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Modern Welcome & Action Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 p-5 sm:p-6 shadow-xs">
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Dashboard Overview
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Real-time operational health, revenue trajectory, user access controls, and transaction activities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              {/* Time Range Selector */}
              <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/60 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTimeRange("7d")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === "7d"
                      ? "bg-background text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("30d")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === "30d"
                      ? "bg-background text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("90d")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === "90d"
                      ? "bg-background text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Quarter
                </button>
              </div>

              <Link href="/analytics">
                <Button size="sm" variant="outline" className="text-xs h-8 cursor-pointer">
                  <TrendingUp className="size-3.5 mr-1 text-primary" />
                  View Analytics
                </Button>
              </Link>

              <Button size="sm" className="text-xs h-8 cursor-pointer shadow-xs">
                <Download className="size-3.5 mr-1" />
                Export Brief
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time KPI Stats Cards */}
        <DashboardStats />

        {/* Charts Section: Revenue Velocity + Channel Distribution */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-7">
          <RevenueOverviewChart />
          <ChannelDistributionChart />
        </div>

        {/* Live System Health & Platform Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border/60 p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">API Latency (p99)</p>
              <p className="text-lg font-bold font-mono text-foreground">42 ms</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowDownRight className="size-3" />
                <span>Optimal (down 8ms)</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="size-5" />
            </div>
          </Card>

          <Card className="border border-border/60 p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Service Uptime</p>
              <p className="text-lg font-bold font-mono text-foreground">99.98%</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3" />
                <span>All regions nominal</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="size-5" />
            </div>
          </Card>

          <Card className="border border-border/60 p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Active Sessions</p>
              <p className="text-lg font-bold font-mono text-foreground">1,842</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="size-3" />
                <span>+12.4% peak hours</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="size-5" />
            </div>
          </Card>

          <Card className="border border-border/60 p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Audit Sync</p>
              <p className="text-lg font-bold font-mono text-foreground">Continuous</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <Clock className="size-3" />
                <span>Synced 1m ago</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
          </Card>
        </div>
      </div>
  );
}
