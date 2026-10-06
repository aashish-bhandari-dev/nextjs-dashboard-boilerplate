import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: `Dashboard | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Modern enterprise admin dashboard and platform overview.",
};

export default function HomePage() {
  return <DashboardView />;
}
