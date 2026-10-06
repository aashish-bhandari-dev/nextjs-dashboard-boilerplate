"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  RotateCcw,
  Search,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/types/role.types";
import { GroupedPermissions } from "@/types/permission.types";
import { roleRepo } from "@/repo/role.repo";
import { permissionRepo } from "@/repo/permission.repo";
import { toastr } from "@/components/ui/toaster";

interface RolePermissionsViewProps {
  roleId: string;
}

export function RolePermissionsView({ roleId }: RolePermissionsViewProps) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [groupedPermissions, setGroupedPermissions] = React.useState<GroupedPermissions>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState<string>("all");

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      await Promise.all([
        roleRepo.getRoleById({
          id: roleId,
          onSuccess: (data) => {
            if (isMounted) {
              setRole(data);
              setSelectedPermissions(data.permissions || []);
            }
          },
          onError: (err) => {
            if (isMounted) toastr.error("Role Error", { description: err });
          },
        }),
        permissionRepo.listGroupedPermissions({
          onSuccess: (data) => {
            if (isMounted) setGroupedPermissions(data);
          },
          onError: (err) => {
            if (isMounted) toastr.error("Catalog Error", { description: err });
          },
        }),
      ]);
      if (isMounted) setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [roleId]);

  const availableModules = Object.keys(groupedPermissions);
  const totalCount = Object.values(groupedPermissions).flat().length;

  const filteredGrouped = React.useMemo(() => {
    const result: GroupedPermissions = {};
    const search = searchTerm.toLowerCase().trim();

    for (const [mod, perms] of Object.entries(groupedPermissions)) {
      if (selectedModule !== "all" && mod !== selectedModule) continue;

      const matching = perms.filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search) ||
          p.displayName.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );

      if (matching.length > 0) {
        result[mod] = matching;
      }
    }
    return result;
  }, [groupedPermissions, searchTerm, selectedModule]);

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSelectAllModule = (moduleName: string) => {
    const modulePerms = (groupedPermissions[moduleName] || []).map((p) => p.name);
    const allSelected = modulePerms.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !modulePerms.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modulePerms])));
    }
  };

  const handleSelectAll = () => {
    const all = Object.values(groupedPermissions)
      .flat()
      .map((p) => p.name);
    setSelectedPermissions(all);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    if (isSaving || !role) return;

    setIsSaving(true);
    await roleRepo.assignPermissions({
      id: role.id,
      permissions: selectedPermissions,
      onSuccess: () => {
        toastr.success("Permissions Saved", {
          description: `Authorization policy updated for '${role.displayName}'.`,
        });
        setIsSaving(false);
        router.push(`/roles/${role.id}`);
      },
      onError: (msg) => {
        toastr.error("Save Failed", { description: msg });
        setIsSaving(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading role permissions...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <Shield className="size-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold">Role Not Found</h2>
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
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
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
                Manage Role Permissions
              </h1>
              <Badge variant="outline" className="text-[10px] uppercase font-mono font-semibold">
                {role.displayName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Grant or revoke authorization policies for role {role.displayName} ({role.name}).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`/roles/${role.id}`)}
            disabled={isSaving}
            className="h-8 px-3 text-xs"
          >
            Discard
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 px-4 gap-1.5 text-xs font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Permissions</span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Permissions Card */}
      <Card className="shadow-xs border-border/60">
        <CardHeader className="border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">Permissions Authorization Policy</CardTitle>
                <Badge variant="secondary" className="text-xs font-bold py-0.5 px-2">
                  {selectedPermissions.length} / {totalCount} granted
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Toggle specific actions and resource access policies below
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-8 text-xs px-3 text-primary border-primary/30 hover:bg-primary/10"
              >
                <CheckCheck className="size-3.5 mr-1.5" />
                Grant All ({totalCount})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="h-8 text-xs px-3 text-muted-foreground hover:bg-muted"
              >
                <RotateCcw className="size-3 mr-1.5" />
                Revoke All
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions by keyword, operation, or module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Module Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedModule("all")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedModule === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All Modules ({totalCount})
              </button>
              {availableModules.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors uppercase shrink-0 ${
                    selectedModule === mod
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {mod} ({groupedPermissions[mod]?.length || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Module Grid List */}
          {Object.keys(filteredGrouped).length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
              No matching permissions found for &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredGrouped).map(([modName, perms]) => {
                const modulePerms = perms.map((p) => p.name);
                const allSelected =
                  modulePerms.length > 0 &&
                  modulePerms.every((p) => selectedPermissions.includes(p));
                const grantedInMod = perms.filter((p) =>
                  selectedPermissions.includes(p.name)
                ).length;

                return (
                  <div
                    key={modName}
                    className="border border-border/60 rounded-xl overflow-hidden bg-card"
                  >
                    {/* Module Title Bar */}
                    <div className="flex items-center justify-between p-3.5 bg-muted/30 border-b border-border/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {modName}
                        </span>
                        <Badge
                          variant={grantedInMod > 0 ? "default" : "secondary"}
                          className="text-[10px] py-0 px-2 font-mono font-semibold"
                        >
                          {grantedInMod} / {perms.length} granted
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAllModule(modName)}
                        className="h-7 text-xs px-2.5 text-primary hover:bg-primary/10 font-semibold"
                      >
                        {allSelected ? "Revoke All in Module" : "Grant All in Module"}
                      </Button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {perms.map((perm) => {
                        const isGranted = selectedPermissions.includes(perm.name);
                        return (
                          <div
                            key={perm.name}
                            onClick={() => togglePermission(perm.name)}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all select-none ${
                              isGranted
                                ? "bg-primary/5 border-primary/50 shadow-xs dark:bg-primary/10"
                                : "bg-background border-border/60 hover:border-border hover:bg-muted/40"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isGranted ? (
                                <div className="size-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                                  <Check className="size-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="size-5 rounded-md border-2 border-input hover:border-primary transition-colors bg-background" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-foreground truncate">
                                  {perm.displayName}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 uppercase font-mono font-bold"
                                >
                                  {perm.action}
                                </Badge>
                              </div>
                              <p className="text-[10px] font-mono font-medium text-muted-foreground mt-0.5 truncate">
                                {perm.name}
                              </p>
                              {perm.description && (
                                <p className="text-[11px] text-muted-foreground/90 mt-1 line-clamp-2 leading-relaxed">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Save Footer */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card shadow-sm sticky bottom-4">
        <div className="text-xs text-muted-foreground">
          Selected: <strong className="text-foreground">{selectedPermissions.length}</strong>{" "}
          permissions
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/roles/${role.id}`)}
            disabled={isSaving}
            className="text-xs h-9 px-4 font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs h-9 px-6 font-semibold gap-2 shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Permissions Policy"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
