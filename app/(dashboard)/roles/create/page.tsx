import type { Metadata } from "next";
import { CreateRoleView } from "@/components/roles/create-role-view";

export const metadata: Metadata = {
  title: `Create Role | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Create a new system or custom access role with granular permissions.",
};

export default function CreateRolePage() {
  return <CreateRoleView />;
}
