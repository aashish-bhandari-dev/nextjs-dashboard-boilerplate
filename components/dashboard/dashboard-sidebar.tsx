"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
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
        href: "/roles",
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
      <SidebarHeader className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <SidebarMenu className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <Link
              href="/"
              className="w-full flex items-center group-data-[collapsible=icon]:justify-center"
            >
              {/* Collapsed view: Logo only, perfectly centered */}
              <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground font-black text-xs tracking-wider shadow-sm shrink-0">
                AH
              </div>

              {/* Expanded view: Full menu button with logo and text */}
              <SidebarMenuButton size="lg" className="hover:bg-muted group-data-[collapsible=icon]:hidden">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-black text-xs tracking-wider shadow-sm shrink-0">
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
                      <Link
                        href={item.href}
                        className="w-full flex items-center group-data-[collapsible=icon]:justify-center"
                      >
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.title}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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
