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
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        href: "/analytics",
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
      <SidebarHeader className="h-16 flex items-center justify-between px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-16 shrink-0">
        <SidebarMenu className="w-full group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="w-full flex items-center group-data-[collapsible=icon]:justify-center">
            {/* Collapsed view: Logo only, perfectly centered with tooltip */}
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href="/"
                      className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs tracking-wider shadow-sm shrink-0 hover:opacity-90 transition-opacity"
                    >
                      AH
                    </Link>
                  }
                />
                <TooltipContent side="right" align="center" sideOffset={12}>
                  AdminHub Console
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Expanded view: Full menu button with logo and text */}
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-muted group-data-[collapsible=icon]:hidden w-full"
            >
              <Link href="/" className="flex items-center gap-2.5">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-black text-xs tracking-wider shadow-sm shrink-0">
                  AH
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-bold">AdminHub</span>
                  <span className="truncate text-[10px] text-muted-foreground font-medium">
                    Enterprise Console
                  </span>
                </div>
              </Link>
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
                  const active = isItemActive(item.href);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon className="size-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden font-medium">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Clean Minimal Sidebar Footer */}
      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden w-full">
          <span className="font-medium">AdminHub v1.0</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs cursor-pointer" />
              }
            />
            <TooltipContent side="right" align="center" sideOffset={12}>
              System Online (v1.0)
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
