"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Download,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { UserGrowthChart } from "@/components/analytics/user-growth-chart";
import { PerformanceTrafficChart } from "@/components/analytics/performance-traffic-chart";
import { ConversionFunnel } from "@/components/analytics/conversion-funnel";
import { GeographicBreakdown } from "@/components/analytics/geographic-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const analyticsKpis = [
  {
    title: "Monthly Active Users",
    value: "8,900",
    change: "+14.2%",
    isPositive: true,
    description: "vs. previous month",
    icon: Users2,
  },
  {
    title: "Avg. Session Duration",
    value: "4m 38s",
    change: "+28s",
    isPositive: true,
    description: "user engagement depth",
    icon: Zap,
  },
  {
    title: "Bounce Rate",
    value: "26.4%",
    change: "-3.1%",
    isPositive: true,
    description: "lower indicates better retention",
    icon: TrendingUp,
  },
  {
    title: "Net Promoter Score",
    value: "+68",
    change: "+4 pts",
    isPositive: true,
    description: "top decile enterprise satisfaction",
    icon: Sparkles,
  },
];

export function AnalyticsView() {
  const [period, setPeriod] = React.useState<"30d" | "quarter" | "year">("30d");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Top Header & Range Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Analytics & Insights
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Deep dive into user cohorts, performance telemetry, acquisition funnels, and geographic demand.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPeriod("30d")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  period === "30d"
                    ? "bg-background text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriod("quarter")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  period === "quarter"
                    ? "bg-background text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                This Quarter
              </button>
              <button
                type="button"
                onClick={() => setPeriod("year")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  period === "year"
                    ? "bg-background text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Year-to-Date
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 cursor-pointer"
              onClick={handleRefresh}
            >
              <RefreshCw className={`size-3.5 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button size="sm" className="text-xs h-8 cursor-pointer shadow-xs">
              <Download className="size-3.5 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Analytics Top KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {analyticsKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} className="border border-border/70 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold tracking-tight font-mono text-foreground">
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="size-3" />
                      {kpi.change}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {kpi.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row: User Growth + API Throughput */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-7">
          <UserGrowthChart />
          <PerformanceTrafficChart />
        </div>

        {/* Bottom Analytics Row: Conversion Funnel + Regional Geographic Distribution */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <ConversionFunnel />
          <GeographicBreakdown />
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
