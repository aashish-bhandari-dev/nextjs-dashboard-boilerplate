import * as React from "react";
import { UsersTable } from "@/components/users/users-table";

export function UsersView() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <UsersTable />
    </div>
  );
}
