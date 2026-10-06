import type { Metadata } from "next";
import { RoleDetailsView } from "@/components/roles/role-details-view";

export const metadata: Metadata = {
  title: `Role Configuration & Details | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "View comprehensive role metadata, granted authorization policies, and assigned users.",
};

interface RoleDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailsPage({ params }: RoleDetailsPageProps) {
  const { id } = await params;

  return <RoleDetailsView roleId={id} />;
}
