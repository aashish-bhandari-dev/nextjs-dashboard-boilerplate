import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export function LoginView() {
  return (
    <div className="bg-background grid min-h-screen w-full lg:grid-cols-2">
      {/* Left Column: Visual Showcase (Desktop) */}
      <AuthShowcase />

      {/* Right Column: Clean Admin Login Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        <div />

        <div className="flex items-center justify-center py-8">
          <Card className="w-full max-w-[420px] border-none shadow-none sm:border sm:shadow-sm">
            <CardContent className="pt-6 sm:p-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
}
