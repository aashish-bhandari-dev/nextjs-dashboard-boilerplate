import type { Metadata } from "next";
import { UsersView } from "@/components/users/users-view";

export const metadata: Metadata = {
  title: `User Directory | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Manage platform users, roles, account statuses, and access permissions.",
};

export default function UsersPage() {
  return <UsersView />;
}
