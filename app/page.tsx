import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | AdminHub",
  description: "Modern enterprise admin dashboard and platform overview.",
};

export default function HomePage() {
  return <DashboardView />;
}
