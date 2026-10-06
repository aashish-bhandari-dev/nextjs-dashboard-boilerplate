import * as React from "react";
import { UserForm } from "@/components/users/user-form";

interface EditUserViewProps {
  userId: string;
}

export function EditUserView({ userId }: EditUserViewProps) {
  return <UserForm isEdit={true} userId={userId} />;
}
