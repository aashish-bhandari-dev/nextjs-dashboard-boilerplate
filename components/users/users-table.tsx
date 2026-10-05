"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Edit,
  Eye,
  Filter,
  Globe,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users as UsersIcon,
  UserX,
  X,
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
import { Role } from "@/types/role.types";
import { userRepo } from "@/repo/user.repo";
import { roleRepo } from "@/repo/role.repo";
import { DeleteUserModal } from "@/components/users/delete-user-modal";
import { toastr } from "@/components/ui/toaster";

export function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Dynamic roles state fetched from API
  const [availableRoles, setAvailableRoles] = React.useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = React.useState(true);

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // Filters matching backend schema
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("ALL");
  const [selectedProvider, setSelectedProvider] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [selectedEmailVerified, setSelectedEmailVerified] = React.useState("ALL");

  // Debounce search input to avoid hitting backend rate limit on keystrokes
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Delete modal state
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  // Status toggle loading state
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toastr.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

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
    setDebouncedSearchTerm("");
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
      searchTerm: debouncedSearchTerm || undefined,
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
  }, [page, limit, debouncedSearchTerm, selectedRole, selectedProvider, selectedStatus, selectedEmailVerified]);

  React.useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) {
        await fetchUsers();
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, [fetchUsers]);

  // Fetch roles dynamically from API for roles filter
  React.useEffect(() => {
    roleRepo.listRoles({
      query: { limit: 100 },
      onSuccess: (data) => {
        setAvailableRoles(data);
        setIsLoadingRoles(false);
      },
      onError: (msg) => {
        console.error("Failed to load roles for filter:", msg);
        setIsLoadingRoles(false);
      },
    });
  }, []);

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  // Modern crisp role badge styling with subtle borders & vibrant tints
  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toUpperCase()) {
      case "SUPER_ADMIN":
        return "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30";
      case "ADMIN":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "MANAGER":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(totalCount, page * limit);

  // Quick statistics calculated from current loaded dataset
  const activeCount = users.filter((u) => u.isActive).length;
  const verifiedCount = users.filter((u) => u.isEmailVerified).length;
  const privilegedCount = users.filter((u) => {
    const r = typeof u.role === "object" && u.role ? (u.role as { name: string }).name : String(u.role || "");
    return ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(r.toUpperCase());
  }).length;

  return (
    <div className="space-y-5 min-w-0 max-w-full w-full">
      {/* Page Header: Title, Description & Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              User Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage authenticated accounts, assigned roles, security credentials, and access statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            title="Refresh Directory"
            className="h-9 px-3 gap-1.5 text-xs font-medium rounded-lg border-border/80 hover:bg-muted/60 transition-colors shadow-2xs"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Link href="/users/create">
            <Button size="sm" className="gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-lg shadow-sm">
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>Add New User</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Modern Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Accounts
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</span>
              <span className="text-[11px] text-muted-foreground">registered</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UsersIcon className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Status
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {isLoading ? "—" : activeCount}
              </span>
              <span className="text-[11px] text-muted-foreground">in current page</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Email Verified
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "—" : verifiedCount}
              </span>
              <span className="text-[11px] text-muted-foreground">verified</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Mail className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs hover:border-border transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Staff & Admins
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? "—" : privilegedCount}
              </span>
              <span className="text-[11px] text-muted-foreground">privileged</span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Shield className="size-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar - Clean Deck */}
      <div className="rounded-xl border border-border/70 bg-card/80 backdrop-blur-xs p-3 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, username, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-9 pr-8 text-xs bg-background/90 border-input/80 rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-ring"
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

          <div className="hidden lg:block h-5 w-px bg-border/70 mx-0.5 shrink-0" />

          {/* Dynamic Role Filter */}
          <div className="relative shrink-0">
            <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {isLoadingRoles ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Shield className="size-3.5" />
              )}
            </div>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              disabled={isLoadingRoles}
              className="h-9 appearance-none rounded-lg border border-input/80 bg-background/90 pl-8 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer font-medium disabled:opacity-60"
            >
              <option value="ALL">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role.id || role.name} value={role.name}>
                  {role.displayName || role.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          </div>

          {/* Provider Filter */}
          <div className="relative shrink-0">
            <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Globe className="size-3.5" />
            </div>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/80 bg-background/90 pl-8 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer font-medium"
            >
              <option value="ALL">All Providers</option>
              <option value="LOCAL">Local Email</option>
              <option value="GOOGLE">Google</option>
              <option value="APPLE">Apple</option>
              <option value="GITHUB">GitHub</option>
              <option value="FACEBOOK">Facebook</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/80 bg-background/90 pl-3 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer font-medium"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          </div>

          {/* Email Verification Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedEmailVerified}
              onChange={(e) => {
                setSelectedEmailVerified(e.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-input/80 bg-background/90 pl-3 pr-8 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors hover:bg-accent/40 cursor-pointer font-medium"
            >
              <option value="ALL">Email: All</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          </div>
        </div>

        {/* Active Filter Chips & Reset Row */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-border/50 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground font-medium flex items-center gap-1 select-none">
                <Filter className="size-3" /> Active filters:
              </span>

              {searchTerm && (
                <Badge variant="secondary" className="gap-1.5 rounded-md py-0.5 px-2 text-[11px] font-normal border border-border/50">
                  <span>Keyword: &quot;{searchTerm}&quot;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setPage(1);
                    }}
                    className="inline-flex items-center justify-center size-3.5 rounded-full hover:bg-foreground/15 text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto shrink-0"
                    aria-label="Remove search filter"
                  >
                    <X className="size-2.5 stroke-[2.5]" />
                  </button>
                </Badge>
              )}

              {selectedRole !== "ALL" && (
                <Badge variant="secondary" className="gap-1.5 rounded-md py-0.5 px-2 text-[11px] font-normal border border-border/50">
                  <span>
                    Role: {availableRoles.find((r) => r.name === selectedRole)?.displayName || selectedRole}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("ALL");
                      setPage(1);
                    }}
                    className="inline-flex items-center justify-center size-3.5 rounded-full hover:bg-foreground/15 text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto shrink-0"
                    aria-label="Remove role filter"
                  >
                    <X className="size-2.5 stroke-[2.5]" />
                  </button>
                </Badge>
              )}

              {selectedProvider !== "ALL" && (
                <Badge variant="secondary" className="gap-1.5 rounded-md py-0.5 px-2 text-[11px] font-normal border border-border/50">
                  <span>Provider: {selectedProvider}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider("ALL");
                      setPage(1);
                    }}
                    className="inline-flex items-center justify-center size-3.5 rounded-full hover:bg-foreground/15 text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto shrink-0"
                    aria-label="Remove provider filter"
                  >
                    <X className="size-2.5 stroke-[2.5]" />
                  </button>
                </Badge>
              )}

              {selectedStatus !== "ALL" && (
                <Badge variant="secondary" className="gap-1.5 rounded-md py-0.5 px-2 text-[11px] font-normal border border-border/50">
                  <span>Status: {selectedStatus}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("ALL");
                      setPage(1);
                    }}
                    className="inline-flex items-center justify-center size-3.5 rounded-full hover:bg-foreground/15 text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto shrink-0"
                    aria-label="Remove status filter"
                  >
                    <X className="size-2.5 stroke-[2.5]" />
                  </button>
                </Badge>
              )}

              {selectedEmailVerified !== "ALL" && (
                <Badge variant="secondary" className="gap-1.5 rounded-md py-0.5 px-2 text-[11px] font-normal border border-border/50">
                  <span>Email: {selectedEmailVerified}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmailVerified("ALL");
                      setPage(1);
                    }}
                    className="inline-flex items-center justify-center size-3.5 rounded-full hover:bg-foreground/15 text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto shrink-0"
                    aria-label="Remove email verification filter"
                  >
                    <X className="size-2.5 stroke-[2.5]" />
                  </button>
                </Badge>
              )}
            </div>

            {/* Reset Filters Button positioned on the right */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="ml-auto h-6.5 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1.5 rounded-md border-dashed transition-colors shrink-0 cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw className="size-2.5" />
              <span>Reset filters</span>
            </Button>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Users Data Table */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs min-w-0 max-w-full w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/70 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <TableHead className="min-w-[220px] sm:min-w-[260px]">User Account</TableHead>
              <TableHead className="min-w-[180px]">Email & Contact</TableHead>
              <TableHead className="min-w-[140px]">Role & Access</TableHead>
              <TableHead className="min-w-[150px]">Account Status</TableHead>
              <TableHead className="min-w-[110px]">Joined</TableHead>
              <TableHead className="text-right min-w-[90px] w-[110px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16">
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted/60" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-56 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="size-12 rounded-2xl bg-muted/70 flex items-center justify-center text-muted-foreground">
                      <UserX className="size-6" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      No user accounts found
                    </span>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {hasActiveFilters
                        ? "No results matched your active filters. Try clearing or broadening your search criteria."
                        : "There are currently no users registered in the platform."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="mt-1 h-8 text-xs gap-1.5"
                      >
                        <RotateCcw className="size-3" />
                        <span>Clear All Filters</span>
                      </Button>
                    )}
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
                  <TableRow
                    key={u.id}
                    className="text-xs hover:bg-accent/40 transition-colors group"
                  >
                    {/* User Identity Column */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="size-9 rounded-full ring-1 ring-border/60 shadow-2xs">
                            {u.image ? (
                              <AvatarImage
                                src={u.image}
                                alt={u.fullName || u.firstName}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Live status dot */}
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
                              u.isActive ? "bg-emerald-500" : "bg-muted-foreground/40"
                            )}
                            title={u.isActive ? "Active Account" : "Inactive Account"}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/users/${u.id}`}
                            className="font-semibold text-foreground hover:text-primary hover:underline transition-colors truncate text-xs"
                          >
                            {u.fullName || `${u.firstName} ${u.lastName || ""}`.trim()}
                          </Link>
                          <span className="text-[11px] font-mono text-muted-foreground truncate">
                            @{u.username || "no-username"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email & Contact */}
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-foreground font-medium text-xs">
                            {u.email}
                          </span>
                          {u.isEmailVerified ? (
                            <span title="Verified Email" className="text-emerald-500 shrink-0">
                              <CheckCircle2 className="size-3.5" />
                            </span>
                          ) : (
                            <span title="Unverified Email" className="text-muted-foreground/50 shrink-0">
                              <XCircle className="size-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {u.phone || "No phone linked"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider",
                            getRoleBadgeVariant(roleString)
                          )}
                        >
                          <Shield className="mr-1 size-2.5 inline" />
                          {roleString}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Account Status with Inline Toggle */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={u.isActive}
                          disabled={updatingUserId === u.id}
                          onCheckedChange={(checked) => handleToggleStatus(u.id, checked)}
                          aria-label={`Toggle active status for ${u.fullName || u.firstName}`}
                        />
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-medium transition-colors select-none",
                            u.isActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {updatingUserId === u.id ? (
                            <Loader2 className="size-3 animate-spin text-muted-foreground shrink-0" />
                          ) : (
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                u.isActive ? "bg-emerald-500" : "bg-muted-foreground/40"
                              )}
                            />
                          )}
                          <span>{u.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {joinedFormatted}
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/users/${u.id}`} title="View Details">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground rounded-md"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </Link>

                        <Link href={`/users/${u.id}/edit`} title="Edit Profile">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground rounded-md"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer outline-none transition-colors"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuLabel className="text-[11px]">User Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/users/${u.id}`}>
                              <DropdownMenuItem className="cursor-pointer text-xs gap-2">
                                <Eye className="size-3.5 text-muted-foreground" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/users/${u.id}/edit`}>
                              <DropdownMenuItem className="cursor-pointer text-xs gap-2">
                                <Edit className="size-3.5 text-muted-foreground" />
                                <span>Edit Account</span>
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => handleCopy(u.id, u.id)}
                              className="cursor-pointer text-xs gap-2"
                            >
                              {copiedId === u.id ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5 text-muted-foreground" />
                              )}
                              <span>Copy User ID</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setUserToDelete(u)}
                              variant="destructive"
                              className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 gap-2"
                            >
                              <Trash2 className="size-3.5" />
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/70 px-3.5 sm:px-4 py-3 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[11px] sm:text-xs">
              Showing <strong className="text-foreground">{from}</strong>–<strong className="text-foreground">{to}</strong> of{" "}
              <strong className="text-foreground">{totalCount}</strong> users
            </span>
            <div className="h-3 w-px bg-border/80 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Rows:</span>
              <div className="relative shrink-0">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 appearance-none rounded-md border border-input/80 bg-background pl-2 pr-6 text-[11px] text-foreground outline-none focus:border-ring cursor-pointer font-medium"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto flex-wrap">
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

