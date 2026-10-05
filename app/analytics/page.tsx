import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = {
  title: `Analytics & Telemetry | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Comprehensive product analytics, real-time API performance telemetry, conversion funnels, and geographic growth charts.",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
