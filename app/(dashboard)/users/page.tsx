import type { Metadata } from "next";
import { UsersTable } from "@/components/users/users-table";

export const metadata: Metadata = {
  title: `User Directory | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Manage platform users, roles, account statuses, and access permissions.",
};

export default function UsersPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <UsersTable />
    </div>
  );
}
