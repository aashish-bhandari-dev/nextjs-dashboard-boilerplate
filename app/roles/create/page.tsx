import type { Metadata } from "next";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { RoleForm } from "@/components/roles/role-form";

export const metadata: Metadata = {
  title: `Create Role | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Create a new system or custom access role with granular permissions.",
};

export default function CreateRolePage() {
  return (
    <DashboardLayoutWrapper>
      <RoleForm isEdit={false} />
    </DashboardLayoutWrapper>
  );
}
