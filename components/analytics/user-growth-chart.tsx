"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
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

const userGrowthData = [
  { month: "Jan", newUsers: 340, activeUsers: 2400 },
  { month: "Feb", newUsers: 480, activeUsers: 2750 },
  { month: "Mar", newUsers: 510, activeUsers: 3100 },
  { month: "Apr", newUsers: 620, activeUsers: 3580 },
  { month: "May", newUsers: 790, activeUsers: 4200 },
  { month: "Jun", newUsers: 920, activeUsers: 4950 },
  { month: "Jul", newUsers: 1150, activeUsers: 5800 },
  { month: "Aug", newUsers: 1240, activeUsers: 6600 },
  { month: "Sep", newUsers: 1400, activeUsers: 7450 },
  { month: "Oct", newUsers: 1680, activeUsers: 8900 },
];

export function UserGrowthChart() {
  const [activeSeries, setActiveSeries] = React.useState<"all" | "new" | "active">("all");

  return (
    <Card className="col-span-full xl:col-span-4 border border-border/70 shadow-xs">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">User Acquisition & Retention</CardTitle>
          <CardDescription className="text-xs">
            Monthly onboarding volume compared to monthly active users (MAU).
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/60 p-1 rounded-lg border border-border/50">
          <Button
            size="xs"
            variant={activeSeries === "all" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5 rounded-md cursor-pointer"
            onClick={() => setActiveSeries("all")}
          >
            Combined
          </Button>
          <Button
            size="xs"
            variant={activeSeries === "new" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5 rounded-md cursor-pointer"
            onClick={() => setActiveSeries("new")}
          >
            New Signups
          </Button>
          <Button
            size="xs"
            variant={activeSeries === "active" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5 rounded-md cursor-pointer"
            onClick={() => setActiveSeries("active")}
          >
            Active MAU
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={userGrowthData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
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
                tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-xs text-xs space-y-1">
                        <p className="font-semibold text-foreground">{label} 2026</p>
                        {payload.map((item) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-muted-foreground">
                              {item.name === "newUsers" ? "New Signups:" : "Active MAU:"}
                            </span>
                            <span className="font-bold text-foreground font-mono">
                              {Number(item.value).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(activeSeries === "all" || activeSeries === "active") && (
                <Bar
                  dataKey="activeUsers"
                  name="activeUsers"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              )}
              {(activeSeries === "all" || activeSeries === "new") && (
                <Bar
                  dataKey="newUsers"
                  name="newUsers"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
