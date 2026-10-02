import * as React from "react";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { LoginForm } from "@/components/auth/login-form";

export function LoginView() {
  return (
    <div className="bg-muted/40 relative flex min-h-screen w-full items-center justify-center p-[5vh_5vw] overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full blur-3xl" />
        <div className="bg-blue-500/5 absolute -bottom-40 left-1/3 -translate-x-1/2 h-[500px] w-[700px] rounded-full blur-3xl" />
      </div>

      {/* Floating Centered Card: 90% Viewport Width & Height with Equal 5% Margins */}
      <div className="bg-card text-card-foreground relative z-10 w-full h-[90vh] min-h-[640px] max-w-[1560px] overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-sm flex flex-col">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Visual Showcase (Desktop) */}
          <AuthShowcase />

          {/* Right Column: Clean Admin Login Form */}
          <div className="flex h-full flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
            <div />

            <div className="my-auto flex items-center justify-center py-6">
              <div className="w-full max-w-[440px]">
                <React.Suspense
                  fallback={
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                      Loading login form...
                    </div>
                  }
                >
                  <LoginForm />
                </React.Suspense>
              </div>
            </div>

            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
