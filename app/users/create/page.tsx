import type { Metadata } from "next";
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout";
import { UserForm } from "@/components/users/user-form";

export const metadata: Metadata = {
  title: `Create User | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Create a new user account with role permissions and credentials.",
};

export default function CreateUserPage() {
  return (
    <DashboardLayoutWrapper>
      <UserForm isEdit={false} />
    </DashboardLayoutWrapper>
  );
}
