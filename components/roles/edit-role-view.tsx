import * as React from "react";
import { RoleForm } from "@/components/roles/role-form";

interface EditRoleViewProps {
  roleId: string;
}

export function EditRoleView({ roleId }: EditRoleViewProps) {
  return <RoleForm isEdit={true} roleId={roleId} />;
}
