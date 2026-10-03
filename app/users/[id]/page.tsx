import type { Metadata } from "next";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { UserDetailsView } from "@/components/users/user-details-view";

export const metadata: Metadata = {
  title: "User Profile & Details | AdminHub",
  description: "View comprehensive user account details, activity, and permissions.",
};

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;

  return (
    <DashboardLayoutWrapper>
      <UserDetailsView userId={id} />
    </DashboardLayoutWrapper>
  );
}
