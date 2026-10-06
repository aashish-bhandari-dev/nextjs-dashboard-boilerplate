import type { Metadata } from "next";
import { RolesView } from "@/components/roles/roles-view";

export const metadata: Metadata = {
  title: `Roles & Permissions | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: "Manage platform role definitions, privilege hierarchies, and granular authorization policies.",
};

export default function RolesPage() {
  return <RolesView />;
}
