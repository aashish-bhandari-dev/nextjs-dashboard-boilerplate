"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "cn";
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
import { User, UserQuery } from "@/types/user.types";
import { userRepo } from "@/repo/user.repo";
import { DeleteUserModal } from "@/components/users/delete-user-modal";
import { toastr } from "@/components/ui/toaster";

export function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Filters matching backend schema
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("ALL");
  const [selectedProvider, setSelectedProvider] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [selectedEmailVerified, setSelectedEmailVerified] = React.useState("ALL");

  // Delete modal state
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  // Status toggle loading state
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  const handleToggleStatus = async (userId: string, nextStatus: boolean) => {
    setUpdatingUserId(userId);
    setErrorMessage(null);

    // Optimistically update local users state
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: nextStatus } : u))
    );

    await userRepo.updateUser({
      id: userId,
      data: { isActive: nextStatus },
      onSuccess: (saved) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: saved.isActive } : u))
        );
        toastr.success(`User status changed to ${saved.isActive ? "Active" : "Inactive"}`);
      },
      onError: (msg) => {
        // Revert to original state on error
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !nextStatus } : u))
        );
        setErrorMessage(msg);
        toastr.error(msg || "Failed to update user status");
      },
    });

    setUpdatingUserId(null);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedRole !== "ALL" ||
    selectedProvider !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedEmailVerified !== "ALL";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setSelectedProvider("ALL");
    setSelectedStatus("ALL");
    setSelectedEmailVerified("ALL");
    setPage(1);
  };

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const query: UserQuery = {
      page,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      role: selectedRole !== "ALL" ? selectedRole : undefined,
      provider: selectedProvider !== "ALL" ? selectedProvider : undefined,
    };

    if (selectedStatus === "ACTIVE") query.isActive = true;
    if (selectedStatus === "INACTIVE") query.isActive = false;

    if (selectedEmailVerified === "VERIFIED") query.isEmailVerified = true;
    if (selectedEmailVerified === "UNVERIFIED") query.isEmailVerified = false;

    await userRepo.listUsers({
      query,
      onSuccess: (data, total) => {
        setUsers(data);
        setTotalCount(total ?? data.length);
        setIsLoading(false);
      },
      onError: (msg) => {
        setErrorMessage(msg);
        setIsLoading(false);
      },
    });
  }, [page, limit, searchTerm, selectedRole, selectedProvider, selectedStatus, selectedEmailVerified]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toUpperCase()) {
      case "SUPER_ADMIN":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "MANAGER":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(totalCount, page * limit);

  return (
    <div className="space-y-4">
      {/* Header: Title & Description on Left, Action Buttons on Right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">User Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage registered accounts, assigned roles, and platform access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            title="Refresh List"
            className="h-9 px-3 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0 rounded-lg shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/users/create">
            <Button size="sm" className="gap-1.5 h-9 text-xs font-semibold rounded-lg shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add New User</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar - Single Clean Row */}
      <div className="rounded-xl border bg-card/60 p-2.5 sm:p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-9 pr-3 text-xs bg-background/80 border-input/80 rounded-lg shadow-none focus-visible:ring-1"
            />
          </div>

          <div className="hidden lg:block h-4 w-px bg-border/80 mx-0.5 shrink-0" />

          {/* Filter Prefix */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 select-none">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter :</span>
          </div>

          {/* Role Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/70 bg-background/70 pl-3 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer"
            >
              <option value="ALL">Role: All</option>
              <option value="SUPER_ADMIN">Role: Super Admin</option>
              <option value="ADMIN">Role: Admin</option>
              <option value="MANAGER">Role: Manager</option>
              <option value="USER">Role: User</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Provider Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/70 bg-background/70 pl-3 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer"
            >
              <option value="ALL">Provider: All</option>
              <option value="LOCAL">Provider: Local</option>
              <option value="GOOGLE">Provider: Google</option>
              <option value="APPLE">Provider: Apple</option>
              <option value="GITHUB">Provider: GitHub</option>
              <option value="FACEBOOK">Provider: Facebook</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Account Status Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/70 bg-background/70 pl-3 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="INACTIVE">Status: Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Email Verification Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedEmailVerified}
              onChange={(e) => {
                setSelectedEmailVerified(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/70 bg-background/70 pl-3 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer"
            >
              <option value="ALL">Email: All</option>
              <option value="VERIFIED">Email: Verified</option>
              <option value="UNVERIFIED">Email: Unverified</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Always Visible Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg border-dashed transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </Button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Users Data Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-[11px]">
              <TableHead className="w-[280px]">User Account</TableHead>
              <TableHead>Email & Contact</TableHead>
              <TableHead>Role & Privileges</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-14">
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX className="h-8 w-8 text-muted-foreground/60" />
                    <span className="font-semibold text-foreground">
                      No user accounts found
                    </span>
                    <p className="text-[11px] max-w-sm">
                      {searchTerm
                        ? "No results matched your search query. Try adjusting your filters."
                        : "No user records exist yet. Click 'Add New User' to create the first one."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const initials = u.firstName
                  ? `${u.firstName[0]}${u.lastName ? u.lastName[0] : ""}`.toUpperCase()
                  : "U";
                const roleString =
                  typeof u.role === "object" && u.role !== null
                    ? (u.role as { name: string }).name
                    : String(u.role || "USER");

                const joinedFormatted = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "—";

                return (
                  <TableRow key={u.id} className="text-xs hover:bg-muted/30">
                    {/* User Identity Column */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 shrink-0 border">
                          {u.image ? (
                            <AvatarImage src={u.image} alt={u.fullName || u.firstName} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight min-w-0">
                          <Link
                            href={`/users/${u.id}`}
                            className="font-semibold hover:underline truncate text-foreground"
                          >
                            {u.fullName || u.firstName}
                          </Link>
                          <span className="text-[11px] text-muted-foreground truncate">
                            @{u.username || "no-username"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email & Phone */}
                    <TableCell>
                      <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-foreground font-medium">
                            {u.email}
                          </span>
                          {u.isEmailVerified && (
                            <span title="Email Verified" className="text-emerald-500 shrink-0">
                              <CheckCircle2 className="size-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {u.phone || "No phone"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-bold ${getRoleBadgeVariant(
                          roleString
                        )}`}
                      >
                        <Shield className="mr-1 h-3 w-3 inline" />
                        {roleString}
                      </Badge>
                    </TableCell>

                    {/* Account Status with Inline Toggle */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={u.isActive}
                            disabled={updatingUserId === u.id}
                            onCheckedChange={(checked) => handleToggleStatus(u.id, checked)}
                            aria-label={`Toggle active status for ${u.fullName || u.firstName}`}
                          />
                          <span
                            className={cn(
                              "text-[11px] font-medium transition-colors select-none flex items-center gap-1 min-w-[42px]",
                              u.isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {updatingUserId === u.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
                            ) : null}
                            <span>{u.isActive ? "Active" : "Inactive"}</span>
                          </span>
                        </div>

                        {u.isActive ? (
                          <span
                            title="Active"
                            className="text-emerald-500 shrink-0"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </span>
                        ) : (
                          <span
                            title="Inactive"
                            className="text-red-500 dark:text-red-400 shrink-0"
                          >
                            <XCircle className="size-3.5" />
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-muted-foreground text-[11px]">
                      {joinedFormatted}
                    </TableCell>

                    {/* Actions Dropdown / Shortcuts */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/users/${u.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit User"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer outline-none"
                            aria-label="Open menu"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/users/${u.id}`}>
                              <DropdownMenuItem className="cursor-pointer text-xs">
                                <Eye className="mr-2 size-3.5" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/users/${u.id}/edit`}>
                              <DropdownMenuItem className="cursor-pointer text-xs">
                                <Edit className="mr-2 size-3.5" />
                                <span>Edit Profile</span>
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setUserToDelete(u)}
                              variant="destructive"
                              className="cursor-pointer text-xs text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 size-3.5" />
                              <span>Delete User</span>
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

        {/* Table Footer with Pagination Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{totalCount}</strong> users
            </span>
            <div className="h-3 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Rows:</span>
              <div className="relative shrink-0">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 appearance-none rounded border border-input bg-card pl-2.5 pr-6 text-[11px] text-foreground outline-none focus:border-ring cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] mr-1">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(1)}
              title="First Page"
              className="h-7 w-7 text-xs"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
              className="h-7 w-7 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
              className="h-7 w-7 text-xs"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(totalPages)}
              title="Last Page"
              className="h-7 w-7 text-xs"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      <DeleteUserModal
        user={userToDelete}
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onDeleted={handleUserDeleted}
      />
    </div>
  );
}
