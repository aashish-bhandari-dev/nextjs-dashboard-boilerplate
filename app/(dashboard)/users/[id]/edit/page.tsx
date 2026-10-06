import type { Metadata } from "next";
import { EditUserView } from "@/components/users/edit-user-view";

export const metadata: Metadata = {
  title: `Edit User | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Update user account information, assigned roles, and access credentials.",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  return <EditUserView userId={id} />;
}
