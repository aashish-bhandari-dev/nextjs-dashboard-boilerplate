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
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/types/role.types";
import { GroupedPermissions } from "@/types/permission.types";
import { roleRepo } from "@/repo/role.repo";
import { permissionRepo } from "@/repo/permission.repo";
import { DeleteRoleModal } from "./delete-role-modal";
import { toastr } from "@/components/ui/toaster";

interface RoleDetailsViewProps {
  roleId: string;
}

export function RoleDetailsView({ roleId }: RoleDetailsViewProps) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [groupedPermissions, setGroupedPermissions] = React.useState<GroupedPermissions>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
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
          onError: () => {},
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

  // Granted permissions grouped by module (unconditionally declared before returns)
  const grantedByModule = React.useMemo(() => {
    if (!role) return {};
    const result: GroupedPermissions = {};
    const q = searchTerm.toLowerCase().trim();

    for (const [mod, perms] of Object.entries(groupedPermissions)) {
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
  }, [groupedPermissions, role, isSuperAdmin, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading role configuration...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="size-12 text-red-500 mx-auto" />
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
    <div className="space-y-6 w-full max-w-full min-[1800px]:max-w-6xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/roles">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-lg border-border/80">
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/80 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {role.displayName}
              </h1>
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
                  Custom Role
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{role.name}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link href={`/roles/${role.id}/permissions`}>
            <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 text-xs font-semibold rounded-lg border-border/80">
              <KeyRound className="size-3.5 text-primary" />
              <span>Manage Permissions</span>
            </Button>
          </Link>

          {!role.isSystem && (
            <>
              <Link href={`/roles/${role.id}/edit`}>
                <Button size="sm" className="h-8 px-3 gap-1.5 text-xs font-semibold rounded-lg shadow-sm">
                  <Edit className="size-3.5" />
                  <span>Edit Role</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={(role.usersCount ?? 0) > 0}
                className="h-8 px-2.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 rounded-lg"
                title="Delete Role"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Hierarchy Level
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">{role.hierarchy}</span>
              <span className="text-[11px] text-muted-foreground">priority rank</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Users
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{role.usersCount ?? 0}</span>
              <span className="text-[11px] text-muted-foreground">accounts</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Policies
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {isSuperAdmin ? "ALL (*)" : grantedCount}
              </span>
              <span className="text-[11px] text-muted-foreground">granted</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <KeyRound className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Creation Date
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-foreground">
                {new Date(role.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Calendar className="size-5" />
          </div>
        </div>
      </div>

      {/* Role Description Card */}
      {role.description && (
        <Card className="shadow-2xs border-border/70 bg-card/70">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description & Scope of Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs sm:text-sm text-foreground leading-relaxed">
            {role.description}
          </CardContent>
        </Card>
      )}

      {/* Granted Permissions Section */}
      <Card className="shadow-2xs border-border/70">
        <CardHeader className="p-4 sm:p-5 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">Active Permission Policies</CardTitle>
                <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                  {isSuperAdmin ? "Full Platform Access" : `${grantedCount} Policies Granted`}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Capabilities authorized for accounts assigned to this role
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search granted permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-7 text-xs h-8 bg-background/90 border-input/80 rounded-lg"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {isSuperAdmin && (
            <div className="p-4 mb-5 rounded-xl border border-violet-500/30 bg-violet-500/10 dark:bg-violet-950/20 text-xs text-violet-900 dark:text-violet-300">
              <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-violet-600 dark:text-violet-400" />
                Master Wildcard Access Granted
              </p>
              <p className="leading-relaxed">
                This role holds the <code className="font-mono bg-violet-500/20 px-1 py-0.5 rounded font-bold">*</code> master permission, which authorizes unrestricted
                access to all endpoints, resources, and administrative actions in the platform.
              </p>
            </div>
          )}

          {Object.keys(grantedByModule).length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
              {searchTerm
                ? `No granted permissions matching "${searchTerm}"`
                : "No permissions are currently granted to this role."}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grantedByModule).map(([mod, perms]) => (
                <div
                  key={mod}
                  className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs"
                >
                  <div className="flex items-center justify-between p-3.5 bg-muted/30 border-b border-border/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {mod}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold bg-background">
                      {perms.length} {perms.length === 1 ? "action" : "actions"}
                    </Badge>
                  </div>

                  <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {perms.map((perm) => (
                      <div
                        key={perm.name}
                        className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-background/80 hover:bg-muted/30 transition-colors"
                      >
                        <div className="size-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/20">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground truncate">
                              {perm.displayName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[9px] uppercase font-mono py-0 font-medium"
                            >
                              {perm.action}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {perm.name}
                          </p>
                          {perm.description && (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">
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
