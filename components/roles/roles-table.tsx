"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Eye,
  KeyRound,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role, RoleQuery } from "@/types/role.types";
import { roleRepo } from "@/repo/role.repo";
import { DeleteRoleModal } from "./delete-role-modal";

export function RolesTable() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleTypeFilter, setRoleTypeFilter] = React.useState<"ALL" | "SYSTEM" | "CUSTOM">("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Modal state (Only Delete modal is retained)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = React.useState<Role | null>(null);

  const fetchRoles = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const query: RoleQuery = {
      page,
      limit,
    };

    if (searchTerm.trim()) {
      query.searchTerm = searchTerm.trim();
    }

    await roleRepo.listRoles({
      query,
      onSuccess: (data, total) => {
        setRoles(data);
        setTotalCount(total ?? data.length);
        setIsLoading(false);
      },
      onError: (msg) => {
        setErrorMessage(msg);
        setIsLoading(false);
      },
    });
  }, [page, limit, searchTerm]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoles();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRoles]);

  // Client-side type filter
  const displayedRoles = React.useMemo(() => {
    if (roleTypeFilter === "ALL") return roles;
    if (roleTypeFilter === "SYSTEM") return roles.filter((r) => r.isSystem);
    if (roleTypeFilter === "CUSTOM") return roles.filter((r) => !r.isSystem);
    return roles;
  }, [roles, roleTypeFilter]);

  const handleRoleDeleted = (deletedId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== deletedId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  // Metrics
  const systemRolesCount = roles.filter((r) => r.isSystem).length;
  const customRolesCount = roles.filter((r) => !r.isSystem).length;

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/60 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Roles
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{totalCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Configured access profiles
            </p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Roles
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{systemRolesCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Protected base configurations
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Lock className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Custom Roles
            </p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{customRolesCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              User-defined tenant roles
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/60 p-3.5 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search roles by name or title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 text-xs h-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setRoleTypeFilter("ALL")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                roleTypeFilter === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Roles
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter("SYSTEM")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                roleTypeFilter === "SYSTEM"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              System
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter("CUSTOM")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                roleTypeFilter === "CUSTOM"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchRoles}
            disabled={isLoading}
            className="h-9 px-3 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/roles/create">
            <Button
              size="sm"
              className="h-9 px-4 gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="size-4" />
              Create Role
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRoles}
            className="h-6 text-xs text-red-700 dark:text-red-400 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[260px] text-xs font-bold uppercase">Role Definition</TableHead>
              <TableHead className="text-xs font-bold uppercase">Type</TableHead>
              <TableHead className="text-xs font-bold uppercase text-center">Hierarchy</TableHead>
              <TableHead className="text-xs font-bold uppercase text-center">Assigned Users</TableHead>
              <TableHead className="text-xs font-bold uppercase">Permissions Granted</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-bold uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading role definitions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShieldAlert className="size-8 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-foreground">No roles found</p>
                    <p className="text-xs max-w-sm">
                      {searchTerm
                        ? `No roles match your search term "${searchTerm}". Try another search or clear the filter.`
                        : "There are currently no custom roles created in the system."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedRoles.map((role) => {
                const isSuperAdmin = (role.permissions || []).includes("*");
                const permissionCount = role.permissions?.length ?? 0;

                return (
                  <TableRow key={role.id} className="hover:bg-muted/40 transition-colors">
                    {/* Role Title & Identifier */}
                    <TableCell>
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            role.isSystem
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          <Shield className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/roles/${role.id}`}
                            className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {role.displayName}
                          </Link>
                          <p className="text-[11px] font-mono font-medium text-muted-foreground">
                            {role.name}
                          </p>
                          {role.description && (
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Type */}
                    <TableCell>
                      {role.isSystem ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold uppercase tracking-wider"
                        >
                          <Lock className="size-2.5 mr-1" />
                          System
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800 font-semibold uppercase tracking-wider"
                        >
                          Custom
                        </Badge>
                      )}
                    </TableCell>

                    {/* Hierarchy Level */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
                        {role.hierarchy}
                      </Badge>
                    </TableCell>

                    {/* Assigned Users Count */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Users className="size-3.5" />
                        <span>{role.usersCount ?? 0}</span>
                      </div>
                    </TableCell>

                    {/* Permissions Granted */}
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSuperAdmin ? (
                            <Badge className="text-[10px] bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold">
                              * ALL (SUPER ADMIN)
                            </Badge>
                          ) : permissionCount === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                              No permissions assigned
                            </span>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {permissionCount} permissions
                              </Badge>
                              {(role.permissions || []).slice(0, 3).map((perm) => (
                                <span
                                  key={perm}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40"
                                >
                                  {perm}
                                </span>
                              ))}
                              {permissionCount > 3 && (
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  +{permissionCount - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Action Menu */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="size-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer outline-none transition-colors"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="text-xs">Role Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <Link href={`/roles/${role.id}`} className="cursor-pointer">
                            <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                              <Eye className="size-3.5 text-muted-foreground" />
                              View Role Overview
                            </DropdownMenuItem>
                          </Link>

                          <Link href={`/roles/${role.id}/permissions`} className="cursor-pointer">
                            <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                              <KeyRound className="size-3.5 text-primary" />
                              Manage Permissions
                            </DropdownMenuItem>
                          </Link>

                          <Link href={`/roles/${role.id}/edit`} className="cursor-pointer">
                            <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                              <Edit className="size-3.5 text-muted-foreground" />
                              Edit Role Details
                            </DropdownMenuItem>
                          </Link>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRoleForDelete(role);
                              setIsDeleteModalOpen(true);
                            }}
                            disabled={role.isSystem || (role.usersCount ?? 0) > 0}
                            className={`text-xs gap-2 cursor-pointer ${
                              role.isSystem || (role.usersCount ?? 0) > 0
                                ? "opacity-50 cursor-not-allowed"
                                : "text-red-600 dark:text-red-400 focus:text-red-600"
                            }`}
                          >
                            <Trash2 className="size-3.5" />
                            {role.isSystem
                              ? "Cannot Delete (System)"
                              : (role.usersCount ?? 0) > 0
                              ? "Has Users Assigned"
                              : "Delete Role"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/60 bg-muted/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalCount)} of {totalCount} roles
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="size-7 p-0"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="size-7 p-0"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            <span className="px-2 font-medium text-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="size-7 p-0"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="size-7 p-0"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (Only modal used in the feature) */}
      <DeleteRoleModal
        role={selectedRoleForDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRoleForDelete(null);
        }}
        onSuccess={handleRoleDeleted}
      />
    </div>
  );
}
