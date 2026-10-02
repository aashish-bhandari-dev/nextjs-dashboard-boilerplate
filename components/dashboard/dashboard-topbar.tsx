"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth.store";

export function DashboardTopbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
    router.refresh();
  };

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase()
    : "AD";

  const displayName = user?.fullName || user?.firstName || "Administrator";
  const displayRole = user?.role || "ADMIN";
  const displayEmail = user?.email || "admin@company.com";

  return (
    <header className="bg-card/80 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 backdrop-blur-md">
      {/* Left: Official shadcn SidebarTrigger & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hover:text-foreground transition-colors cursor-pointer">
            Portal
          </span>
          <span>/</span>
          <span className="font-semibold text-foreground">Dashboard Overview</span>
        </div>
      </div>

      {/* Right: Search, Notifications, and Admin User Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5" />
          <Input
            type="search"
            placeholder="Search console..."
            className="h-9 pl-8 pr-12 text-xs bg-muted/40"
          />
          <kbd className="bg-background text-muted-foreground pointer-events-none absolute top-2 right-2.5 inline-flex h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Status Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Services Healthy</span>
        </div>

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8"
          aria-label="View system notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* User Profile Dropdown Menu in Top Right */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-muted outline-hidden cursor-pointer">
            <Avatar className="size-8 shrink-0 border">
              {user?.image ? (
                <AvatarImage src={user.image} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {displayName}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 h-3.5 font-bold border-primary/30 text-primary"
                >
                  {displayRole}
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {displayEmail}
              </span>
            </div>

            <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="w-64 p-1.5 shadow-lg rounded-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                <div className="flex flex-col space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{displayName}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-3.5 font-bold border-primary/30 text-primary"
                    >
                      {displayRole}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer text-xs">
                <UserCheck className="mr-2 h-4 w-4" />
                <span>Admin Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-xs">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-xs">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Security & Permissions</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
              className="cursor-pointer text-xs text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
