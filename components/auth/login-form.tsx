"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/auth.store";
import { authRepo } from "@/repo/auth.repo";
import { loginFormSchema } from "@/schemas";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { setAuth } = useAuthStore();

  // Handle unauthorized redirect from proxy
  const isUnauthorized = searchParams.get("error") === "unauthorized";
  const urlError = isUnauthorized
    ? "Access denied. Only administrators (SUPER_ADMIN or ADMIN) can access this dashboard."
    : null;

  const displayedError = errorMessage || urlError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const parseResult = loginFormSchema.safeParse({
      identifier,
      password,
      rememberMe,
    });

    if (!parseResult.success) {
      const msg = parseResult.error.issues[0]?.message || "Please enter valid credentials.";
      setErrorMessage(msg);
      return;
    }

    const trimmedIdentifier = identifier.trim();
    setIsLoading(true);

    // Call AuthRepo outside the store
    await authRepo.login({
      credentials: { identifier: trimmedIdentifier, password },
      onSuccess: (data) => {
        // Pure state update in the store
        setAuth(data, rememberMe);
        const redirectUrl = searchParams.get("from") || "/";
        router.push(redirectUrl);
        router.refresh();
      },
      onError: (message) => {
        setErrorMessage(message);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
          <Shield className="text-primary h-3.5 w-3.5" />
          <span>Restricted Portal</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Portal Sign In</h2>
        <p className="text-muted-foreground text-sm">
          Enter authorized credentials to access system management, platform configuration, and administrative controls.
        </p>
      </div>

      {displayedError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {/* Admin Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Administrator Identifier</Label>
          <div className="relative">
            <Mail className="text-muted-foreground pointer-events-none absolute top-3 left-3 h-4 w-4" />
            <Input
              id="identifier"
              type="text"
              placeholder="admin@company.com, username, or phone"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (displayedError) setErrorMessage(null);
              }}
              className="h-10 pl-9"
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="#forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors hover:underline"
            >
              Reset credentials?
            </Link>
          </div>
          <div className="relative">
            <Lock className="text-muted-foreground pointer-events-none absolute top-3 left-3 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (displayedError) setErrorMessage(null);
              }}
              className="h-10 pr-10 pl-9"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-3 right-3 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="text-muted-foreground cursor-pointer text-xs font-normal"
            >
              Remember this session for 30 days
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full font-medium transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating administrator...
            </>
          ) : (
            "Sign In to Admin Portal"
          )}
        </Button>
      </form>

      {/* Security notice & Administrator Support */}
      <div className="text-muted-foreground pt-1 text-center text-xs">
        <span>Need access? </span>
        <Link
          href="#support"
          className="text-foreground hover:text-primary font-medium underline underline-offset-4 transition-colors"
        >
          Contact Administrator
        </Link>
        <span className="mx-2 text-muted-foreground/40">•</span>
        <span className="text-muted-foreground/80 text-[11px]">Audited & Encrypted</span>
      </div>
    </div>
  );
}
