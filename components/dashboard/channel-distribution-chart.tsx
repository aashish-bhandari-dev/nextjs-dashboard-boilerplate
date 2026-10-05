"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const channelData = [
  { name: "Direct SaaS", value: 45, color: "hsl(var(--primary))" },
  { name: "Enterprise API", value: 30, color: "#3b82f6" },
  { name: "Partner Referrals", value: 15, color: "#10b981" },
  { name: "Marketplace Addons", value: 10, color: "#f59e0b" },
];

export function ChannelDistributionChart() {
  return (
    <Card className="col-span-full xl:col-span-3 border border-border/70 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Channel Distribution</CardTitle>
        <CardDescription className="text-xs">
          Revenue share breakdown by acquisition stream.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur-xs text-xs space-y-0.5">
                        <p className="font-semibold text-foreground">{data.name}</p>
                        <p className="text-muted-foreground font-mono">
                          Share: <span className="text-foreground font-bold">{data.value}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={channelData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered KPI label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono tracking-tight">100%</span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Diversified</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60">
          {channelData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-1 justify-between items-center min-w-0">
                <span className="truncate text-muted-foreground">{item.name}</span>
                <span className="font-mono font-semibold text-foreground ml-1.5">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
