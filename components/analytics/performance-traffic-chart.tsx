"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
import { Badge } from "@/components/ui/badge";

const trafficData = [
  { time: "00:00", requests: 120, latency: 38 },
  { time: "03:00", requests: 80, latency: 35 },
  { time: "06:00", requests: 240, latency: 40 },
  { time: "09:00", requests: 950, latency: 52 },
  { time: "12:00", requests: 1420, latency: 64 },
  { time: "15:00", requests: 1280, latency: 58 },
  { time: "18:00", requests: 1650, latency: 68 },
  { time: "21:00", requests: 820, latency: 44 },
  { time: "23:59", requests: 310, latency: 39 },
];

export function PerformanceTrafficChart() {
  return (
    <Card className="col-span-full xl:col-span-3 border border-border/70 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">API Throughput & Latency</CardTitle>
            <CardDescription className="text-xs">
              Live 24h request traffic and round-trip service response times.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Realtime
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trafficData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/50"
              />
              <XAxis
                dataKey="time"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}ms`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-xs text-xs space-y-1">
                        <p className="font-semibold text-foreground">Time: {label}</p>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-primary" />
                          <span className="text-muted-foreground">Requests/min:</span>
                          <span className="font-bold text-foreground font-mono">
                            {payload[0]?.value}
                          </span>
                        </div>
                        {payload[1] && (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-amber-500" />
                            <span className="text-muted-foreground">Latency:</span>
                            <span className="font-bold text-foreground font-mono">
                              {payload[1]?.value} ms
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="latency"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2, fill: "#f59e0b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
