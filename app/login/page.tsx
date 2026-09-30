import type { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Login | AdminHub",
  description: "Sign in to access your AdminHub dashboard and analytics.",
};

export default function LoginPage() {
  return <LoginView />;
}
