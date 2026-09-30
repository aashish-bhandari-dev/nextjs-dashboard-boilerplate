import Link from "next/link";
import { Bell, LayoutDashboard, Search, Settings } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="bg-card flex items-center justify-between gap-4 border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold">
            AD
          </div>
          <span>AdminHub</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          <span className="text-foreground bg-muted flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2.5 py-1.5 transition-colors">
            Analytics
          </span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2.5 py-1.5 transition-colors">
            Customers
          </span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2.5 py-1.5 transition-colors">
            Settings
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden w-64 sm:block">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input type="search" placeholder="Search..." className="h-9 pl-8" />
        </div>

        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>

        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Sign In
        </Link>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs font-semibold">SB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
