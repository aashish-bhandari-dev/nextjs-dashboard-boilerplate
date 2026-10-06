"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Edit,
  KeyRound,
  Loader2,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Role } from "@/types/role.types";
import { GroupedPermissions } from "@/types/permission.types";
import { roleRepo } from "@/repo/role.repo";
import { permissionRepo } from "@/repo/permission.repo";
import { DeleteRoleModal } from "./delete-role-modal";
import { toastr } from "@/components/ui/toaster";
import { cn } from "cn";

interface RoleDetailsViewProps {
  roleId: string;
}

export function RoleDetailsView({ roleId }: RoleDetailsViewProps) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [groupedPermissions, setGroupedPermissions] = React.useState<GroupedPermissions>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = React.useState<string>("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        roleRepo.getRoleById({
          id: roleId,
          onSuccess: (data) => {
            if (isMounted) setRole(data);
          },
          onError: (err) => {
            if (isMounted) toastr.error("Role Not Found", { description: err });
          },
        }),
        permissionRepo.listGroupedPermissions({
          onSuccess: (catalog) => {
            if (isMounted) setGroupedPermissions(catalog);
          },
          onError: () => { },
        }),
      ]);
      if (isMounted) setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [roleId]);

  const isSuperAdmin = Boolean(role && (role.permissions || []).includes("*"));
  const grantedCount = role?.permissions?.length ?? 0;

  // Filter granted permissions
  const grantedByModule = React.useMemo(() => {
    if (!role) return {};
    const result: GroupedPermissions = {};
    const q = searchTerm.toLowerCase().trim();

    for (const [mod, perms] of Object.entries(groupedPermissions)) {
      if (selectedModuleFilter !== "all" && mod !== selectedModuleFilter) {
        continue;
      }

      const grantedInMod = perms.filter((p) => {
        const isGranted = isSuperAdmin || (role.permissions || []).includes(p.name);
        if (!isGranted) return false;

        if (q) {
          return (
            p.name.toLowerCase().includes(q) ||
            p.displayName.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }
        return true;
      });

      if (grantedInMod.length > 0) {
        result[mod] = grantedInMod;
      }
    }
    return result;
  }, [groupedPermissions, role, isSuperAdmin, searchTerm, selectedModuleFilter]);

  const modulesWithGrants = React.useMemo(() => {
    if (!role) return [];
    return Object.keys(groupedPermissions).filter((mod) => {
      const perms = groupedPermissions[mod] || [];
      return perms.some((p) => isSuperAdmin || (role.permissions || []).includes(p.name));
    });
  }, [groupedPermissions, role, isSuperAdmin]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading role specifications...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="size-12 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">Role Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested role does not exist or may have been deleted.
        </p>
        <Link href="/roles">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="size-3.5" />
            Back to Roles Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">

      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/roles`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">
                View Role Permissions
              </h1>
              <Badge variant="outline" className="text-[11px] uppercase font-mono font-semibold">
                {role.displayName}
              </Badge>
              {role.isSystem ? (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 font-bold uppercase text-[10px] tracking-wider"
                >
                  <Lock className="size-2.5 mr-1" />
                  System Role
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold uppercase text-[10px] tracking-wider"
                >
                  <ShieldCheck className="size-2.5 mr-1" />
                  Custom Role
                </Badge>
              )}
              {/* Description */}
              {role.description ? (
                <p className="text-xs sm:text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  {role.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/80 italic">
                  No description configured for this role.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              View and manage permissions assigned to this role.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link href={`/roles/${role.id}/permissions`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-semibold rounded-lg border-border/80 hover:bg-muted cursor-pointer shadow-2xs"
            >
              <KeyRound className="size-3.5 text-primary" />
              <span>Edit Permissions</span>
            </Button>
          </Link>

          {!role.isSystem && (
            <>
              <Link href={`/roles/${role.id}/edit`}>
                <Button size="sm" className="h-8 px-3.5 gap-1.5 text-xs font-semibold rounded-lg shadow-xs cursor-pointer">
                  <Edit className="size-3.5" />
                  <span>Edit Role</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={(role.usersCount ?? 0) > 0}
                className="h-8 px-2.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 rounded-lg cursor-pointer"
                title={(role.usersCount ?? 0) > 0 ? "Cannot delete role with assigned users" : "Delete Role"}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Crisp Minimal Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Hierarchy Rank</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{role.hierarchy}</span>
              <span className="text-[10px] text-muted-foreground">priority tier</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="size-4" />
          </div>
        </div>

        <Link
          href={`/users?roleId=${role.id}`}
          className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs hover:border-border transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Assigned Users
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">{role.usersCount ?? 0}</span>
              <span className="text-[10px] text-muted-foreground">accounts</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="size-4" />
          </div>
        </Link>

        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Active Policies</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {isSuperAdmin ? "ALL (*)" : grantedCount}
              </span>
              <span className="text-[10px] text-muted-foreground">granted actions</span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <KeyRound className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground">Created On</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold font-mono text-foreground">
                {new Date(role.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Calendar className="size-4" />
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <Card className="shadow-2xs border-border/70">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Assigned Permissions
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] font-semibold px-2 py-0">
                  {isSuperAdmin ? "Full Wildcard Access" : `${grantedCount} Active`}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Authorized privileges and resource capabilities for this role.
              </CardDescription>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-95">
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
          {!isSuperAdmin && modulesWithGrants.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedModuleFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer",
                  selectedModuleFilter === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                All ({grantedCount})
              </button>
              {modulesWithGrants.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModuleFilter(mod)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all uppercase shrink-0 cursor-pointer",
                    selectedModuleFilter === mod
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mod} ({groupedPermissions[mod]?.filter((p) => (role.permissions || []).includes(p.name)).length || 0})
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Wildcard Alert */}
          {isSuperAdmin && (
            <div className="p-4 mb-4 rounded-xl border border-violet-500/25 bg-violet-500/10 text-xs text-violet-900 dark:text-violet-300 flex items-start gap-3">
              <div className="size-7 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 text-violet-600 dark:text-violet-400 mt-0.5">
                <Unlock className="size-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-xs text-foreground">
                  Full Platform Wildcard Permission (<code className="font-mono font-bold">*</code>)
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Accounts assigned to this role bypass module constraints and hold unrestricted access across all endpoints.
                </p>
              </div>
            </div>
          )}

          {Object.keys(grantedByModule).length === 0 ? (
            <div className="p-10 text-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground space-y-1.5">
              <ShieldAlert className="size-7 mx-auto text-muted-foreground/60" />
              <p className="font-medium text-foreground">No permissions found</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                {searchTerm
                  ? `No permissions match "${searchTerm}".`
                  : "This role does not have any direct permission policies granted."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grantedByModule).map(([mod, perms]) => (
                <div
                  key={mod}
                  className="border border-border/70 rounded-xl overflow-hidden bg-card"
                >
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {mod}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {perms.length} {perms.length === 1 ? "action" : "actions"}
                    </span>
                  </div>

                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <div
                        key={perm.name}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/60 bg-background hover:bg-muted/20 transition-colors"
                      >
                        <div className="size-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/20">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {perm.displayName}
                            </span>
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
                          <p className="text-[10px] font-mono text-muted-foreground truncate">
                            {perm.name}
                          </p>
                          {perm.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 pt-0.5">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteRoleModal
        role={role}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          router.push("/roles");
        }}
      />
    </div>
  );
}
