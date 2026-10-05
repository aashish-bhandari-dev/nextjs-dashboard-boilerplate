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

interface ConversionStep {
  step: string;
  count: number;
  rate: number;
  dropoff: number;
}

const funnelSteps: ConversionStep[] = [
  { step: "Landing Page Visits", count: 42800, rate: 100, dropoff: 0 },
  { step: "Sign-up Form Started", count: 18400, rate: 43, dropoff: 57 },
  { step: "Account Verified (Email/OAuth)", count: 12200, rate: 28.5, dropoff: 14.5 },
  { step: "Workspace Initialized", count: 8900, rate: 20.8, dropoff: 7.7 },
  { step: "Subscribed to Paid Tier", count: 2350, rate: 5.5, dropoff: 15.3 },
];

export function ConversionFunnel() {
  return (
    <Card className="col-span-full lg:col-span-4 border border-border/70 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">User Conversion Lifecycle</CardTitle>
            <CardDescription className="text-xs">
              End-to-end journey from initial discovery to active enterprise subscription.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            5.5% Overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {funnelSteps.map((step, idx) => (
          <div key={step.step} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                <span className="font-mono text-muted-foreground mr-1.5">{idx + 1}.</span>
                {step.step}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">{step.count.toLocaleString()}</span>
                <span className="font-semibold text-foreground">({step.rate}%)</span>
              </div>
            </div>
            {/* Custom styled progress bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${step.rate}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
