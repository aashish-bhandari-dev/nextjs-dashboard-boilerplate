import type { Metadata } from "next";
import { RolePermissionsView } from "@/components/roles/role-permissions-view";

export const metadata: Metadata = {
  title: `Manage Role Permissions | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Configure and sync granular authorization policies for this role.",
};

interface RolePermissionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  const { id } = await params;

  return <RolePermissionsView roleId={id} />;
}
