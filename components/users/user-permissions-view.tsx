"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  KeyRound,
  Loader2,
  Mail,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/types/user.types";
import {
  UserEffectivePermissionsResponse,
  UserPermissionItemState,
} from "@/types/permission.types";
import { userRepo } from "@/repo/user.repo";
import { toastr } from "@/components/ui/toaster";
import { cn } from "cn";

interface UserPermissionsViewProps {
  userId: string;
}

export function UserPermissionsView({ userId }: UserPermissionsViewProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [permData, setPermData] = React.useState<UserEffectivePermissionsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  // Local state for desired permissions
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState<string>("all");

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        userRepo.getUserById({
          id: userId,
          onSuccess: (u) => {
            if (isMounted) setUser(u);
          },
          onError: (err) => {
            if (isMounted) toastr.error("User Error", { description: err });
          },
        }),
        userRepo.getUserPermissions({
          userId,
          onSuccess: (data) => {
            if (isMounted) {
              setPermData(data);
              setSelectedPermissions(data.effectivePermissions || []);
            }
          },
          onError: (err) => {
            if (isMounted) toastr.error("Permissions Error", { description: err });
          },
        }),
      ]);
      if (isMounted) setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const isSuperAdmin = Boolean(
    permData?.effectivePermissions?.includes("*") ||
    permData?.rolePermissions?.includes("*") ||
    user?.role === "SUPER_ADMIN"
  );

  const availableModules = React.useMemo(() => {
    if (!permData?.catalog) return [];
    return Array.from(new Set(permData.catalog.map((p) => p.module)));
  }, [permData]);

  // Filter catalog items
  const filteredCatalog = React.useMemo(() => {
    if (!permData?.catalog) return [];
    const q = searchTerm.toLowerCase().trim();

    return permData.catalog.filter((item) => {
      if (selectedModule !== "all" && item.module !== selectedModule) {
        return false;
      }
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.displayName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [permData, selectedModule, searchTerm]);

  // Group filtered catalog by module
  const groupedFiltered = React.useMemo(() => {
    const map: Record<string, UserPermissionItemState[]> = {};
    for (const item of filteredCatalog) {
      if (!map[item.module]) {
        map[item.module] = [];
      }
      map[item.module].push(item);
    }
    return map;
  }, [filteredCatalog]);

  const togglePermission = (permName: string) => {
    if (isSuperAdmin) return;
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await userRepo.updateUserPermissions({
      userId,
      data: {
        permissions: selectedPermissions,
      },
      onSuccess: (updated) => {
        setPermData(updated);
        setSelectedPermissions(updated.effectivePermissions || []);
        toastr.success("Permissions Synchronized", {
          description: "Custom user authorization policies have been saved successfully.",
        });
        setIsSaving(false);
      },
      onError: (err) => {
        toastr.error("Update Failed", { description: err });
        setIsSaving(false);
      },
    });
  };

  const handleResetToRoleDefaults = async () => {
    if (!confirm("Reset this user's custom permissions back to their default role policies?")) {
      return;
    }

    setIsResetting(true);
    await userRepo.resetUserPermissions({
      userId,
      onSuccess: (resetResult) => {
        setPermData(resetResult);
        setSelectedPermissions(resetResult.effectivePermissions || []);
        toastr.success("Permissions Reset", {
          description: "User permissions have been reverted to role defaults.",
        });
        setIsResetting(false);
      },
      onError: (err) => {
        toastr.error("Reset Failed", { description: err });
        setIsResetting(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          Loading user permission specifications...
        </p>
      </div>
    );
  }

  if (!user || !permData) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="size-12 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">User Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested user account or authorization record does not exist.
        </p>
        <Link href="/users">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="size-3.5" />
            Back to User Directory
          </Button>
        </Link>
      </div>
    );
  }

  const roleName = permData.role || String(user.role || "USER");
  const directOverridesCount = permData.directPermissions?.length || 0;
  const isCustomized = permData.hasCustomPermissions || directOverridesCount > 0;
  const initials = user.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase()
    : "U";

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/70 pb-5">
        <div className="flex items-start gap-3.5 min-w-0">
          <Link href={`/users`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs rounded-lg border-border/80 cursor-pointer shadow-2xs hover:bg-muted mt-0.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-border/80 hidden sm:block mt-2" />

          {/* User Identity Block */}
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="size-11 rounded-full ring-1 ring-border/70 shadow-2xs shrink-0 mt-0.5">
              {user.image ? (
                <AvatarImage
                  src={user.image}
                  alt={user.fullName || user.firstName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
                  {user.fullName || `${user.firstName} ${user.lastName || ""}`.trim()}
                </h1>

                {/* Role Badge */}
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-2 py-0.5 font-bold uppercase tracking-wider bg-primary/5 border-primary/20 text-foreground"
                >
                  <Shield className="size-3 mr-1 text-primary inline" />
                  {roleName}
                </Badge>

                {/* Status Badges */}
                {isCustomized ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Custom Overrides Active
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Role Default
                  </Badge>
                )}
              </div>

              {/* Username & Email row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono font-medium text-foreground/80">
                  @{user.username || "no-username"}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                  <Mail className="size-3 text-muted-foreground" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
          {isCustomized && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToRoleDefaults}
              disabled={isResetting || isSaving || isSuperAdmin}
              className="h-8 px-3 gap-1.5 text-xs rounded-lg border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className={cn("size-3.5", isResetting && "animate-spin")} />
              <span>Reset to Role Defaults</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isResetting || isSuperAdmin}
            className="h-8 px-4 gap-1.5 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Assigned Role</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-foreground">{roleName}</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Role Default Policies</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">
                {permData.rolePermissions?.length || 0}
              </span>
              <span className="text-[10px] text-muted-foreground">inherited</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Direct Overrides</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {directOverridesCount}
              </span>
              <span className="text-[10px] text-muted-foreground">custom</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <KeyRound className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Effective Privileges</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {isSuperAdmin ? "ALL (*)" : selectedPermissions.length}
              </span>
              <span className="text-[10px] text-muted-foreground">active</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCheck className="size-4" />
          </div>
        </div>
      </div>

      {/* Main Permissions Editor Card */}
      <Card className="shadow-2xs border-border/70">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Grant or Revoke Permissions
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] font-semibold px-2 py-0">
                  {isSuperAdmin ? "Super Admin" : `${selectedPermissions.length} Granted`}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Toggle capabilities to override default role behavior for this specific user.
              </CardDescription>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-7 text-xs h-8 bg-background border-input rounded-lg shadow-none focus-visible:ring-1"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedModule("all")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer",
                selectedModule === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              All Modules ({permData.catalog.length})
            </button>
            {availableModules.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all uppercase shrink-0 cursor-pointer",
                  selectedModule === mod
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {mod}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Wildcard Alert */}
          {isSuperAdmin && (
            <div className="p-4 mb-4 rounded-xl border border-violet-500/25 bg-violet-500/10 text-xs text-violet-900 dark:text-violet-300 flex items-start gap-3">
              <div className="size-7 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 text-violet-600 dark:text-violet-400 mt-0.5">
                <Sparkles className="size-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-xs text-foreground">
                  User Has Master Wildcard Permission (<code className="font-mono font-bold">*</code>)
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Because this user holds the SUPER_ADMIN role with unrestricted access, individual policy toggles cannot restrict their access.
                </p>
              </div>
            </div>
          )}

          {Object.keys(groupedFiltered).length === 0 ? (
            <div className="p-10 text-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground space-y-1.5">
              <ShieldAlert className="size-7 mx-auto text-muted-foreground/60" />
              <p className="font-medium text-foreground">No matching permissions found</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                {searchTerm
                  ? `No permissions match "${searchTerm}".`
                  : "No registered system permissions for this module."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedFiltered).map(([mod, perms]) => (
                <div
                  key={mod}
                  className="border border-border/70 rounded-xl overflow-hidden bg-card"
                >
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {mod} Module
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {perms.length} {perms.length === 1 ? "action" : "actions"}
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {perms.map((perm) => {
                      const isChecked = isSuperAdmin || selectedPermissions.includes(perm.name);
                      const isInherited = perm.isInheritedFromRole;
                      const hasOverride = isChecked !== isInherited;

                      return (
                        <div
                          key={perm.name}
                          onClick={() => togglePermission(perm.name)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none",
                            isChecked
                              ? "bg-primary/5 border-primary/30"
                              : "bg-background border-border/60 hover:bg-muted/20",
                            isSuperAdmin && "opacity-75 cursor-not-allowed"
                          )}
                        >
                          {/* Toggle Switch */}
                          <div className="pt-0.5 shrink-0 pointer-events-auto">
                            <Switch
                              checked={isChecked}
                              disabled={isSuperAdmin}
                              onCheckedChange={() => {
                                togglePermission(perm.name);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="cursor-pointer"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">
                                {perm.displayName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {hasOverride && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0 font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  >
                                    Override
                                  </Badge>
                                )}
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[9px] uppercase font-mono py-0 font-bold",
                                    perm.action === "delete"
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : perm.action === "create" || perm.action === "write"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : perm.action === "update"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  )}
                                >
                                  {perm.action}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-[10px] font-mono text-muted-foreground truncate">
                              {perm.name}
                            </p>

                            {perm.description && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                {perm.description}
                              </p>
                            )}

                            <div className="pt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                              {isInherited ? (
                                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                  <Shield className="size-2.5" />
                                  Inherited from role
                                </span>
                              ) : (
                                <span>Explicit grant</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
