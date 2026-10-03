import type { Metadata } from "next";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { UserForm } from "@/components/users/user-form";

export const metadata: Metadata = {
  title: "Edit User | AdminHub",
  description: "Update user account information, assigned roles, and access credentials.",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  return (
    <DashboardLayoutWrapper>
      <UserForm isEdit={true} userId={id} />
    </DashboardLayoutWrapper>
  );
}
