"use client";

import * as React from "react";
import Link from "next/link";
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

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both administrator email and password.");
      return;
    }

    setIsLoading(true);
    // Simulated authentication process
    setTimeout(() => {
      setIsLoading(false);
      // For demonstration, redirect or auth session handling
    }, 1200);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
          <Shield className="text-primary h-3 w-3" />
          <span>Restricted Portal</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Sign In</h2>
        <p className="text-muted-foreground text-sm">
          Enter your authorized credentials to access the management console.
        </p>
      </div>

      {errorMessage && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Admin Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Admin Email or Username</Label>
          <div className="relative">
            <Mail className="text-muted-foreground pointer-events-none absolute top-3 left-3 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 pl-9"
              autoComplete="email"
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
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="text-muted-foreground pointer-events-none absolute top-3 left-3 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Verifying credentials...
            </>
          ) : (
            "Sign In to Console"
          )}
        </Button>
      </form>

      {/* Security notice & Administrator Support */}
      <div className="text-muted-foreground space-y-2 border-t pt-2 text-center text-xs">
        <p>
          Need access or facing issues?{" "}
          <Link
            href="#support"
            className="text-foreground hover:text-primary font-medium underline underline-offset-4 transition-colors"
          >
            Contact System Administrator
          </Link>
        </p>
        <p className="text-muted-foreground/80 text-[11px]">
          All sign-in attempts are logged, audited, and encrypted.
        </p>
      </div>
    </div>
  );
}
