"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  KeyRound,
  Loader2,
  Lock,
  RotateCcw,
  Search,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Role, CreateRoleInput, UpdateRoleInput } from "@/types/role.types";
import { GroupedPermissions } from "@/types/permission.types";
import { roleRepo } from "@/repo/role.repo";
import { permissionRepo } from "@/repo/permission.repo";
import { toastr } from "@/components/ui/toaster";

interface RoleFormProps {
  isEdit?: boolean;
  roleId?: string;
}

export function RoleForm({ isEdit = false, roleId }: RoleFormProps) {
  const router = useRouter();

  // Role data
  const [role, setRole] = React.useState<Role | null>(null);
  const [isLoadingRole, setIsLoadingRole] = React.useState(isEdit);

  // Form Fields
  const [name, setName] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [hierarchy, setHierarchy] = React.useState<number>(10);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  // Permissions Catalog
  const [groupedPermissions, setGroupedPermissions] = React.useState<GroupedPermissions>({});
  const [isLoadingPermissions, setIsLoadingPermissions] = React.useState(true);
  const [permSearch, setPermSearch] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState<string>("all");

  // Submission & Validation
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // 1. Fetch permissions catalog on mount
  React.useEffect(() => {
    let isMounted = true;
    permissionRepo.listGroupedPermissions({
      onSuccess: (data) => {
        if (isMounted) {
          setGroupedPermissions(data);
          setIsLoadingPermissions(false);
        }
      },
      onError: (err) => {
        if (isMounted) {
          toastr.error("Catalog Error", { description: err });
          setIsLoadingPermissions(false);
        }
      },
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch role details if in edit mode
  React.useEffect(() => {
    if (isEdit && roleId) {
      roleRepo.getRoleById({
        id: roleId,
        onSuccess: (data) => {
          setRole(data);
          setName(data.name || "");
          setDisplayName(data.displayName || "");
          setDescription(data.description || "");
          setHierarchy(data.hierarchy ?? 10);
          setSelectedPermissions(data.permissions || []);
          setIsLoadingRole(false);
        },
        onError: (err) => {
          toastr.error("Failed to load role", { description: err });
          setIsLoadingRole(false);
        },
      });
    }
  }, [isEdit, roleId]);

  const isSystemRole = Boolean(role?.isSystem);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Role identifier code is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      errors.name = "Can only contain letters, numbers, hyphens, and underscores";
    } else if (name.trim().length < 2) {
      errors.name = "Role code must be at least 2 characters";
    }

    if (!displayName.trim()) {
      errors.displayName = "Display title is required";
    } else if (displayName.trim().length < 2) {
      errors.displayName = "Display title must be at least 2 characters";
    }

    if (hierarchy < 0 || hierarchy > 1000) {
      errors.hierarchy = "Hierarchy level must be between 0 and 1000";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleSelectAllGlobal = () => {
    const all = Object.values(groupedPermissions)
      .flat()
      .map((p) => p.name);
    setSelectedPermissions(all);
  };

  const handleDeselectAllGlobal = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    if (isEdit && role) {
      const updatePayload: UpdateRoleInput = {
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        hierarchy,
        permissions: selectedPermissions,
      };

      if (!isSystemRole && name.trim().toUpperCase() !== role.name) {
        updatePayload.name = name.trim().toUpperCase();
      }

      await roleRepo.updateRole({
        id: role.id,
        data: updatePayload,
        onSuccess: (updated) => {
          toastr.success("Role Updated", {
            description: `Role '${updated.displayName}' was updated successfully.`,
          });
          setIsSubmitting(false);
          router.push(`/roles/${updated.id}`);
        },
        onError: (msg) => {
          toastr.error("Update Failed", { description: msg });
          setIsSubmitting(false);
        },
      });
    } else {
      const createPayload: CreateRoleInput = {
        name: name.trim().toUpperCase(),
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        hierarchy,
        permissions: selectedPermissions,
      };

      await roleRepo.createRole({
        data: createPayload,
        onSuccess: (created) => {
          toastr.success("Role Created", {
            description: `Role '${created.displayName}' has been created successfully.`,
          });
          setIsSubmitting(false);
          router.push(`/roles/${created.id}`);
        },
        onError: (msg) => {
          toastr.error("Creation Failed", { description: msg });
          setIsSubmitting(false);
        },
      });
    }
  };

  // Modules catalog
  const availableModules = Object.keys(groupedPermissions);
  const totalPermCount = Object.values(groupedPermissions).flat().length;

  const filteredGrouped = React.useMemo(() => {
    const result: GroupedPermissions = {};
    const searchLower = permSearch.toLowerCase().trim();

    for (const [mod, perms] of Object.entries(groupedPermissions)) {
      if (selectedModule !== "all" && mod !== selectedModule) continue;

      const matching = perms.filter(
        (p) =>
          !searchLower ||
          p.name.toLowerCase().includes(searchLower) ||
          p.displayName.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );

      if (matching.length > 0) {
        result[mod] = matching;
      }
    }
    return result;
  }, [groupedPermissions, permSearch, selectedModule]);

  if (isLoadingRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading role configuration...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-full min-[1800px]:max-w-6xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/roles">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {isEdit ? "Edit Role" : "Create New Role"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Update role attributes, hierarchy priority, and granular permissions."
                : "Define a new custom role and assign modular permission capabilities."}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="h-8 px-3 text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-8 px-4 gap-1.5 text-xs font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEdit ? "Save Role Changes" : "Create Role"}</span>
            )}
          </Button>
        </div>
      </div>

      {/* System Role Notification */}
      {isSystemRole && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
          <Lock className="size-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">Protected System Role</p>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
              This role is a default system role. Its internal identifier code is locked to
              preserve platform security policies, but you can modify its display title,
              description, and assigned permissions below.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Core Configuration */}
      <Card className="shadow-xs border-border/60">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">1. General Information</CardTitle>
              <CardDescription className="text-xs">
                Essential identification and hierarchy attributes
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Role Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="role-name" className="text-xs font-semibold">
                  Role Identifier Code <span className="text-red-500">*</span>
                </Label>
                {isSystemRole && (
                  <Badge variant="secondary" className="text-[10px] font-mono py-0">
                    Locked
                  </Badge>
                )}
              </div>
              <Input
                id="role-name"
                placeholder="e.g. BILLING_AUDITOR"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toUpperCase());
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                disabled={isSystemRole || isSubmitting}
                className={`font-mono text-xs uppercase h-10 ${formErrors.name ? "border-red-500 focus-visible:ring-red-500/20" : ""
                  }`}
              />
              {formErrors.name ? (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5">
                  {formErrors.name}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Unique uppercase identifier used internally (e.g. ADMIN, MANAGER).
                </p>
              )}
            </div>

            {/* Display Title */}
            <div className="space-y-1.5">
              <Label htmlFor="role-displayName" className="text-xs font-semibold">
                Display Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role-displayName"
                placeholder="e.g. Billing Auditor"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (formErrors.displayName) {
                    setFormErrors((prev) => ({ ...prev, displayName: "" }));
                  }
                }}
                disabled={isSubmitting}
                className={`text-xs h-10 ${formErrors.displayName ? "border-red-500 focus-visible:ring-red-500/20" : ""
                  }`}
              />
              {formErrors.displayName ? (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5">
                  {formErrors.displayName}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  The human-friendly label displayed across the platform.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Hierarchy */}
            <div className="space-y-1.5">
              <Label htmlFor="role-hierarchy" className="text-xs font-semibold">
                Hierarchy Rank Level
              </Label>
              <Input
                id="role-hierarchy"
                type="number"
                min={0}
                max={1000}
                value={hierarchy}
                onChange={(e) => setHierarchy(Number(e.target.value) || 0)}
                disabled={isSubmitting}
                className="text-xs h-10 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Numerical rank (e.g. 100 = Super Admin, 10 = User).
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="role-description" className="text-xs font-semibold">
                Description & Notes
              </Label>
              <Input
                id="role-description"
                placeholder="Describe the scope of access and responsibilities for this role..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="text-xs h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Optional guidance for system administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Permissions Policy Builder */}
      <Card className="shadow-xs border-border/60">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <KeyRound className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">2. Permissions Policy</CardTitle>
                  <Badge variant="secondary" className="text-xs font-bold py-0.5 px-2">
                    {selectedPermissions.length} / {totalPermCount} granted
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Grant modular permissions for resources and specific operations
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllGlobal}
                className="h-8 text-xs px-3 text-primary border-primary/30 hover:bg-primary/10"
              >
                <CheckCheck className="size-3.5 mr-1.5" />
                Grant All ({totalPermCount})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAllGlobal}
                className="h-8 text-xs px-3 text-muted-foreground hover:bg-muted"
              >
                <RotateCcw className="size-3 mr-1.5" />
                Revoke All
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter permissions by keyword, operation, or action..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="pl-9 text-xs h-10"
              />
              {permSearch && (
                <button
                  type="button"
                  onClick={() => setPermSearch("")}
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
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${selectedModule === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                All Modules ({totalPermCount})
              </button>
              {availableModules.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors uppercase shrink-0 ${selectedModule === mod
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
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center p-16 border border-border/60 rounded-xl bg-muted/10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="ml-3 text-xs text-muted-foreground">
                Loading permissions catalog...
              </span>
            </div>
          ) : Object.keys(filteredGrouped).length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
              No matching permissions found for &quot;{permSearch}&quot;
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
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all select-none ${isGranted
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

      {/* Bottom Floating Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card shadow-sm sticky bottom-4">
        <div className="text-xs text-muted-foreground">
          Selected: <strong className="text-foreground">{selectedPermissions.length}</strong>{" "}
          permissions
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-xs h-9 px-4 font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs h-9 px-6 font-semibold gap-2 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Role Changes"
            ) : (
              "Create Role"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
