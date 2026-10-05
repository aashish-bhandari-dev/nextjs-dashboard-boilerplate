"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const revenueData = [
  { month: "Jan", revenue: 18400, target: 15000, expenses: 11200 },
  { month: "Feb", revenue: 22100, target: 17500, expenses: 12400 },
  { month: "Mar", revenue: 19800, target: 19000, expenses: 13100 },
  { month: "Apr", revenue: 27400, target: 22000, expenses: 14500 },
  { month: "May", revenue: 31200, target: 24000, expenses: 16800 },
  { month: "Jun", revenue: 34800, target: 28000, expenses: 17900 },
  { month: "Jul", revenue: 38900, target: 30000, expenses: 19200 },
  { month: "Aug", revenue: 42100, target: 34000, expenses: 20100 },
  { month: "Sep", revenue: 39800, target: 35000, expenses: 21400 },
  { month: "Oct", revenue: 45231, target: 38000, expenses: 22800 },
];

export function RevenueOverviewChart() {
  const [metric, setMetric] = React.useState<"revenue" | "target">("revenue");

  return (
    <Card className="col-span-full xl:col-span-4 border border-border/70 shadow-xs">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Revenue Velocity</CardTitle>
          <CardDescription className="text-xs">
            Monthly gross platform revenue versus growth projection targets.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/60 p-1 rounded-lg border border-border/50">
          <Button
            size="xs"
            variant={metric === "revenue" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5 rounded-md cursor-pointer font-medium"
            onClick={() => setMetric("revenue")}
          >
            Actual Revenue
          </Button>
          <Button
            size="xs"
            variant={metric === "target" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5 rounded-md cursor-pointer font-medium"
            onClick={() => setMetric("target")}
          >
            Target Baseline
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/50"
              />
              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-xs text-xs space-y-1">
                        <p className="font-semibold text-foreground">{label} 2026</p>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-primary" />
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-bold text-foreground font-mono">
                            ${Number(payload[0]?.value).toLocaleString()}
                          </span>
                        </div>
                        {payload[1] && (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Target:</span>
                            <span className="font-bold text-foreground font-mono">
                              ${Number(payload[1]?.value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={metric === "revenue" ? "revenue" : "target"}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
              {metric === "revenue" && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
