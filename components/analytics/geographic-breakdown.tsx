"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GeographicData {
  country: string;
  code: string;
  users: number;
  revenue: string;
  share: number;
}

const geoData: GeographicData[] = [
  { country: "United States", code: "US", users: 12480, revenue: "$24,500", share: 54 },
  { country: "United Kingdom", code: "GB", users: 3820, revenue: "$7,200", share: 16 },
  { country: "Germany", code: "DE", users: 2450, revenue: "$4,800", share: 11 },
  { country: "Canada", code: "CA", users: 1920, revenue: "$3,600", share: 8 },
  { country: "Australia", code: "AU", users: 1350, revenue: "$2,800", share: 6 },
  { country: "Others", code: "GLOBAL", users: 1140, revenue: "$2,331", share: 5 },
];

export function GeographicBreakdown() {
  return (
    <Card className="col-span-full lg:col-span-3 border border-border/70 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Geographic Distribution</CardTitle>
        <CardDescription className="text-xs">
          Top operating customer regions by user density and total revenue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3.5 pt-1">
        {geoData.map((item) => (
          <div key={item.code} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                {item.code}
              </span>
              <span className="font-medium text-foreground truncate">{item.country}</span>
            </div>
            <div className="flex items-center gap-3 font-mono shrink-0">
              <span className="text-muted-foreground">{item.users.toLocaleString()}</span>
              <span className="font-semibold text-foreground">{item.revenue}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5">
                {item.share}%
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
