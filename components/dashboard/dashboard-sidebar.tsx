"use client";

import * as React from "react";
import Link from "next/link";
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
        isActive: true,
      },
      {
        title: "Analytics",
        href: "#analytics",
        icon: BarChart3,
      },
      {
        title: "System Health",
        href: "#health",
        icon: Activity,
        badge: "Live",
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        title: "User Directory",
        href: "#users",
        icon: Users,
        badge: "1,280",
      },
      {
        title: "Roles & Permissions",
        href: "#roles",
        icon: ShieldCheck,
      },
      {
        title: "Invoices & Billing",
        href: "#invoices",
        icon: CreditCard,
      },
      {
        title: "Audit & Access Logs",
        href: "#audit-logs",
        icon: FileText,
      },
    ],
  },
  {
    group: "System & Security",
    items: [
      {
        title: "Portal Settings",
        href: "#settings",
        icon: Settings,
      },
      {
        title: "API Keys & Webhooks",
        href: "#api-keys",
        icon: KeyRound,
      },
      {
        title: "Threat & Lockout Rules",
        href: "#security-rules",
        icon: ShieldAlert,
      },
    ],
  },
];

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
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
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link href={item.href} className="w-full">
                        <SidebarMenuButton
                          isActive={item.isActive}
                          tooltip={item.title}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
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
