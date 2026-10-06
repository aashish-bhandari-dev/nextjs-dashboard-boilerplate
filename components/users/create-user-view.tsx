import * as React from "react";
import { UserForm } from "@/components/users/user-form";

export function CreateUserView() {
  return <UserForm isEdit={false} />;
}
