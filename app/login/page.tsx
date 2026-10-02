import type { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Admin Portal Sign In | AdminHub",
  description: "Secure administrator sign in for system management, platform controls, and user administration.",
};

export default function LoginPage() {
  return <LoginView />;
}
