import type { Metadata } from "next";
import { UserDetailsView } from "@/components/users/user-details-view";

export const metadata: Metadata = {
  title: `User Profile & Details | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "View comprehensive user account details, activity, and permissions.",
};

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;

  return <UserDetailsView userId={id} />;
}
