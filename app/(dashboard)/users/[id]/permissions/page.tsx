import type { Metadata } from "next";
import { UserPermissionsView } from "@/components/users/user-permissions-view";

export const metadata: Metadata = {
  title: `User Permissions & Overrides | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Configure granular user authorization policies, role inheritance, and direct capability overrides.",
};

interface UserPermissionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPermissionsPage({ params }: UserPermissionsPageProps) {
  const { id } = await params;

  return <UserPermissionsView userId={id} />;
}
