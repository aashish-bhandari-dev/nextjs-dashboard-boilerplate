"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CreditCard,
  FileText,
  KeyRound,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    group: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "#analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        title: "User Directory",
        href: "/users",
        icon: Users,
      },
      {
        title: "Roles & Permissions",
        href: "#roles",
        icon: ShieldCheck,
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <Sidebar collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="w-full">
              <SidebarMenuButton size="lg" className="hover:bg-muted">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-black text-xs tracking-wider shadow-sm">
                  AH
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-bold">AdminHub</span>
                  <span className="truncate text-[10px] text-muted-foreground font-medium">
                    Enterprise Console
                  </span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav Content */}
      <SidebarContent>
        {navigationItems.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link href={item.href} className="w-full">
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.title}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Clean Minimal Sidebar Footer */}
      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="font-medium">AdminHub v1.0</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </SidebarFooter>

      {/* Interactive Rail */}
      <SidebarRail />
    </Sidebar>
  );
}
