import type { Metadata } from "next";
import { RoleForm } from "@/components/roles/role-form";

export const metadata: Metadata = {
  title: `Edit Role Policy | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Update role attributes, hierarchy priority, and granular authorization policies.",
};

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;

  return <RoleForm isEdit={true} roleId={id} />;
}
