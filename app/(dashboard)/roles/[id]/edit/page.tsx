import type { Metadata } from "next";
import { EditRoleView } from "@/components/roles/edit-role-view";

export const metadata: Metadata = {
  title: `Edit Role Policy | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Update role attributes, hierarchy priority, and granular authorization policies.",
};

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;

  return <EditRoleView roleId={id} />;
}
