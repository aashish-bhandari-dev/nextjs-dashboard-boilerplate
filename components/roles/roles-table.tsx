"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Edit,
  Eye,
  KeyRound,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
import { toastr } from "@/components/ui/toaster";
import { cn } from "cn";

export function RolesTable() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [roleTypeFilter, setRoleTypeFilter] = React.useState<"ALL" | "SYSTEM" | "CUSTOM">("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Debounce search input to avoid hitting backend rate limit
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = React.useState<Role | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toastr.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchRoles = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const query: RoleQuery = {
      page,
      limit,
    };

    if (debouncedSearchTerm) {
      query.searchTerm = debouncedSearchTerm;
    }

    await roleRepo.listRoles({
      query,
      bypassCache: !!debouncedSearchTerm,
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
  }, [page, limit, debouncedSearchTerm]);

  React.useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) {
        await fetchRoles();
      }
    })();
    return () => {
      isSubscribed = false;
    };
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
  const totalAssignedUsers = roles.reduce((acc, curr) => acc + (curr.usersCount ?? 0), 0);

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(totalCount, page * limit);

  return (
    <div className="space-y-5">
      {/* Modern Crisp Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Roles
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</span>
              <span className="text-[11px] text-muted-foreground">configured</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              System Roles
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {isLoading ? "—" : systemRolesCount}
              </span>
              <span className="text-[11px] text-muted-foreground">locked</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Custom Roles
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {isLoading ? "—" : customRolesCount}
              </span>
              <span className="text-[11px] text-muted-foreground">tenant-defined</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Users
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "—" : totalAssignedUsers}
              </span>
              <span className="text-[11px] text-muted-foreground">members</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/80 backdrop-blur-xs border border-border/70 p-3 rounded-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search roles by title, code, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 text-xs h-9 bg-background/90 border-input/80 rounded-lg shadow-none focus-visible:ring-1"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
                title="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setRoleTypeFilter("ALL")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                roleTypeFilter === "ALL"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Roles ({roles.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter("SYSTEM")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                roleTypeFilter === "SYSTEM"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="size-3" />
              System ({systemRolesCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter("CUSTOM")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                roleTypeFilter === "CUSTOM"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="size-3" />
              Custom ({customRolesCount})
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchRoles}
            disabled={isLoading}
            className="h-9 px-3 gap-1.5 text-xs font-medium rounded-lg border-border/80 hover:bg-muted/60 transition-colors shadow-2xs"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Link href="/roles/create">
            <Button
              size="sm"
              className="h-9 px-3.5 gap-1.5 text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>Create Role</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRoles}
            className="h-6 text-xs text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/70 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <TableHead className="w-[280px]">Role Definition</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Hierarchy</TableHead>
              <TableHead className="text-center">Assigned Users</TableHead>
              <TableHead>Permissions Granted</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16">
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted/60" />
                  </TableCell>
                </TableRow>
              ))
            ) : displayedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-56 text-center">
                  <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                    <div className="size-12 rounded-2xl bg-muted/70 flex items-center justify-center text-muted-foreground">
                      <ShieldAlert className="size-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No roles found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {searchTerm
                        ? `No roles match your search term "${searchTerm}". Try another query or clear the filter.`
                        : "There are currently no roles matching the active filter selection."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedRoles.map((role) => {
                const isSuperAdmin = (role.permissions || []).includes("*");
                const permissionCount = role.permissions?.length ?? 0;

                return (
                  <TableRow
                    key={role.id}
                    className="hover:bg-accent/40 transition-colors text-xs group"
                  >
                    {/* Role Title & Identifier */}
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "size-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 shadow-2xs",
                            role.isSystem
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                          )}
                        >
                          {role.isSystem ? (
                            <Lock className="size-4" />
                          ) : (
                            <Shield className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/roles/${role.id}`}
                            className="font-bold text-foreground hover:text-primary transition-colors truncate block text-xs"
                          >
                            {role.displayName}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/50">
                              {role.name}
                            </span>
                          </div>
                          {role.description && (
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-1">
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
                          className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 font-bold uppercase tracking-wider"
                        >
                          <Lock className="size-2.5 mr-1" />
                          System
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold uppercase tracking-wider"
                        >
                          Custom
                        </Badge>
                      )}
                    </TableCell>

                    {/* Hierarchy Level */}
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs px-2.5 py-0.5 bg-muted/70 text-foreground font-semibold"
                      >
                        Rank {role.hierarchy}
                      </Badge>
                    </TableCell>

                    {/* Assigned Users Count */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                        <Users className="size-3.5 text-muted-foreground/80" />
                        <span className="font-semibold text-foreground">{role.usersCount ?? 0}</span>
                      </div>
                    </TableCell>

                    {/* Permissions Granted */}
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSuperAdmin ? (
                            <Badge className="text-[10px] bg-violet-600 hover:bg-violet-700 text-white font-mono font-bold px-2 py-0.5 shadow-2xs">
                              <Sparkles className="size-2.5 mr-1" />
                              * FULL PLATFORM ACCESS
                            </Badge>
                          ) : permissionCount === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                              No permissions assigned
                            </span>
                          ) : (
                            <>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold bg-muted/50 border-border/60"
                              >
                                {permissionCount} policies
                              </Badge>
                              {(role.permissions || []).slice(0, 3).map((perm) => (
                                <span
                                  key={perm}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50"
                                >
                                  {perm}
                                </span>
                              ))}
                              {permissionCount > 3 && (
                                <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted/30">
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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/roles/${role.id}`} title="View Role Overview">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground rounded-md"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </Link>

                        <Link href={`/roles/${role.id}/permissions`} title="Manage Permissions">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-primary hover:text-primary hover:bg-primary/10 rounded-md"
                          >
                            <KeyRound className="size-3.5" />
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="size-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer outline-none transition-colors"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[11px]">Role Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <Link href={`/roles/${role.id}`} className="cursor-pointer">
                              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                <Eye className="size-3.5 text-muted-foreground" />
                                <span>View Overview</span>
                              </DropdownMenuItem>
                            </Link>

                            <Link href={`/roles/${role.id}/permissions`} className="cursor-pointer">
                              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                <KeyRound className="size-3.5 text-primary" />
                                <span>Manage Permissions</span>
                              </DropdownMenuItem>
                            </Link>

                            <Link href={`/roles/${role.id}/edit`} className="cursor-pointer">
                              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                <Edit className="size-3.5 text-muted-foreground" />
                                <span>Edit Details</span>
                              </DropdownMenuItem>
                            </Link>

                            <DropdownMenuItem
                              onClick={() => handleCopy(role.id, role.id)}
                              className="text-xs gap-2 cursor-pointer"
                            >
                              {copiedId === role.id ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5 text-muted-foreground" />
                              )}
                              <span>Copy Role ID</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRoleForDelete(role);
                                setIsDeleteModalOpen(true);
                              }}
                              disabled={role.isSystem || (role.usersCount ?? 0) > 0}
                              className={cn(
                                "text-xs gap-2 cursor-pointer",
                                role.isSystem || (role.usersCount ?? 0) > 0
                                  ? "opacity-50 cursor-not-allowed"
                                  : "text-red-600 dark:text-red-400 focus:text-red-600"
                              )}
                            >
                              <Trash2 className="size-3.5" />
                              <span>
                                {role.isSystem
                                  ? "Cannot Delete (System)"
                                  : (role.usersCount ?? 0) > 0
                                  ? "Assigned to Users"
                                  : "Delete Role"}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border/70 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 rounded-md border border-input/80 bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{totalCount}</strong> roles
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] mr-1">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(1)}
              title="First Page"
              className="size-7 rounded-md"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
              className="size-7 rounded-md"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
              className="size-7 rounded-md"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(totalPages)}
              title="Last Page"
              className="size-7 rounded-md"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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

