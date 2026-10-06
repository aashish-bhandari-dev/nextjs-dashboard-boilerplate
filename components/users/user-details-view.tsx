"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Database,
  Edit,
  ExternalLink,
  Eye,
  Globe,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user.types";
import { userRepo } from "@/repo/user.repo";
import { DeleteUserModal } from "@/components/users/delete-user-modal";

interface UserDetailsViewProps {
  userId: string;
}

export function UserDetailsView({ userId }: UserDetailsViewProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isImageViewOpen, setIsImageViewOpen] = React.useState(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Metadata tab & search
  const [metadataViewMode, setMetadataViewMode] = React.useState<"structured" | "raw">("structured");
  const [metadataSearch, setMetadataSearch] = React.useState("");

  // Permissions filter
  const [permissionSearch, setPermissionSearch] = React.useState("");

  React.useEffect(() => {
    userRepo.getUserById({
      id: userId,
      onSuccess: (data) => {
        setUser(data);
        setIsLoading(false);
      },
      onError: (msg) => {
        setErrorMessage(msg);
        setIsLoading(false);
      },
    });
  }, [userId]);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full max-w-7xl mx-auto flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-medium">Loading user profile...</span>
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/users")}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Users</span>
        </Button>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-semibold text-sm">Failed to load user</p>
          <p className="text-xs mt-1 text-muted-foreground">
            {errorMessage || "User account not found."}
          </p>
        </div>
      </div>
    );
  }

  const initials = user.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`.toUpperCase()
    : "U";

  const roleString =
    typeof user.role === "object" && user.role !== null
      ? (user.role as { name: string }).name
      : String(user.role || "USER");

  const formattedJoined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const formattedLastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never logged in";

  const metadataEntries = user.metadata && typeof user.metadata === "object"
    ? Object.entries(user.metadata)
    : [];

  const filteredMetadata = metadataEntries.filter(([k, v]) => {
    if (!metadataSearch.trim()) return true;
    const query = metadataSearch.toLowerCase();
    return (
      k.toLowerCase().includes(query) ||
      String(v).toLowerCase().includes(query)
    );
  });

  const permissionsList = Array.isArray(user.permissions) ? user.permissions : [];
  const filteredPermissions = permissionsList.filter((p) => {
    if (!permissionSearch.trim()) return true;
    return p.toLowerCase().includes(permissionSearch.toLowerCase());
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/users")}
            className="h-8 gap-1.5 text-xs shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Users</span>
          </Button>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
            {user.fullName || user.firstName}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href={`/users/${user.id}/permissions`} className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs w-full sm:w-auto cursor-pointer">
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              <span>Permissions</span>
            </Button>
          </Link>
          <Link href={`/users/${user.id}/edit`} className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs w-full sm:w-auto cursor-pointer">
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Account</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-8 gap-1.5 text-xs flex-1 sm:flex-initial cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Summary Hero Card */}
      <Card className="overflow-hidden border shadow-xs bg-card">
        {/* Subtle Decorative Banner */}
        <div className="h-20 sm:h-24 bg-linear-to-r from-muted/60 via-muted/30 to-muted/60 border-b relative" />

        <CardContent className="pt-0 relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              {/* Profile Avatar with Zoom Preview */}
              <div className="relative group shrink-0">
                <Avatar className="size-18 sm:size-22 border-4 border-card shadow-sm shrink-0 bg-muted/40 cursor-pointer">
                  {user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.fullName || user.firstName}
                      className="object-cover size-full"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg sm:text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {user.image && (
                  <button
                    type="button"
                    onClick={() => setIsImageViewOpen(true)}
                    title="View Photo"
                    className="absolute inset-0 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>
                )}
                {/* Active Indicator Ring on Avatar */}
                <span
                  className={`absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-card ${
                    user.isActive ? "bg-emerald-500" : "bg-zinc-400"
                  }`}
                  title={user.isActive ? "Active Account" : "Inactive Account"}
                />
              </div>

              {/* Identity & Contact Headings */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {user.fullName || user.firstName}
                  </h1>
                  <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary bg-primary/5">
                    <Shield className="mr-1 size-3 inline" />
                    {roleString}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground/80">@{user.username || "no-username"}</span>
                  <span>•</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              {user.isActive ? (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold gap-1.5 py-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-border bg-muted text-muted-foreground text-xs font-medium gap-1.5 py-0.5">
                  <span className="size-1.5 rounded-full bg-zinc-400" />
                  Inactive
                </Badge>
              )}

              {user.isDeactivated && (
                <Badge variant="destructive" className="text-xs font-semibold gap-1.5 py-0.5">
                  <span className="size-1.5 rounded-full bg-destructive-foreground" />
                  Deactivated
                </Badge>
              )}

              {user.isEmailVerified && (
                <Badge variant="outline" className="border-border text-muted-foreground text-xs font-medium gap-1 py-0.5">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  Email Verified
                </Badge>
              )}
            </div>
          </div>

          {/* User Bio if present */}
          {user.bio && (
            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/60 mt-3 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Joined Date</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formattedJoined}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Last Active</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{formattedLastLogin}</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Provider</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5 font-mono">
                <Shield className="size-3.5 text-muted-foreground" />
                {user.provider || "LOCAL"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Permissions</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-muted-foreground" />
                {permissionsList.length} Assigned
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact & Personal Information Card */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserIcon className="size-4 text-primary" />
              <span>Contact & Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            {/* Email */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Mail className="size-3.5" />
                Email Address
              </span>
              <div className="flex items-center gap-2 font-medium">
                <span className="font-mono text-foreground select-all">{user.email}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.email, "email")}
                  title="Copy email"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted cursor-pointer"
                >
                  {copiedKey === "email" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Phone className="size-3.5" />
                Phone Number
              </span>
              <div className="flex items-center gap-2 font-medium">
                <span className={user.phone ? "font-mono text-foreground select-all" : "text-muted-foreground italic"}>
                  {user.phone || "Not configured"}
                </span>
                {user.phone && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.phone || "", "phone")}
                    title="Copy phone"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted cursor-pointer"
                  >
                    {copiedKey === "phone" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Calendar className="size-3.5" />
                Date of Birth
              </span>
              <span className="font-medium text-foreground">
                {user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not provided"}
              </span>
            </div>

            {/* Gender */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <UserIcon className="size-3.5" />
                Gender
              </span>
              <span className="font-medium text-foreground capitalize">
                {user.gender || "Not specified"}
              </span>
            </div>

            {/* Locale & Timezone */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Globe className="size-3.5" />
                Locale & Timezone
              </span>
              <span className="font-mono text-foreground font-medium">
                {user.locale || "en-US"} • {user.timezone || "UTC"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Audit Tracking Card */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <span>Security & Audit Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            {/* Auth Provider */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Shield className="size-3.5" />
                Authentication Provider
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold">
                  {user.provider || "LOCAL"}
                </Badge>
                {user.providerId && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({user.providerId})
                  </span>
                )}
              </div>
            </div>

            {/* Last Login Timestamp */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Clock className="size-3.5" />
                Last Login
              </span>
              <span className="font-medium text-foreground font-mono">{formattedLastLogin}</span>
            </div>

            {/* Last Login Audit */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <MapPin className="size-3.5" />
                Session Audit
              </span>
              <span className="font-medium text-foreground">
                {user.lastLoginAt ? "Verified via secure session" : "No recent activity recorded"}
              </span>
            </div>

            {/* Account ID */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Database className="size-3.5" />
                Internal User ID
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-foreground select-all truncate max-w-[140px] sm:max-w-[200px]">
                  {user.id}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.id, "id")}
                  title="Copy ID"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted cursor-pointer"
                >
                  {copiedKey === "id" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium">
                <Calendar className="size-3.5" />
                Account Record Created
              </span>
              <span className="font-medium text-foreground font-mono">{formattedJoined}</span>
            </div>
          </CardContent>
        </Card>

        {/* RBAC Assigned Permissions Card */}
        <Card className="md:col-span-2 shadow-xs">
          <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  <span>Assigned RBAC Permissions</span>
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                  {permissionsList.length}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Access capabilities inherited through user role or direct authorization overrides.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {permissionsList.length > 6 && (
                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  <Input
                    placeholder="Filter permissions..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    className="h-7 text-xs pl-7"
                  />
                </div>
              )}
              <Link href={`/users/${user.id}/permissions`}>
                <Button variant="outline" size="xs" className="h-7 text-xs gap-1.5 cursor-pointer shrink-0">
                  <KeyRound className="size-3 text-primary" />
                  <span>Manage Overrides</span>
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {filteredPermissions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {filteredPermissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="outline"
                    className="bg-muted/40 text-foreground font-mono text-[11px] px-2.5 py-1 border-border/80 hover:bg-muted transition-colors"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            ) : permissionsList.length > 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                No permissions matching &ldquo;{permissionSearch}&rdquo;
              </p>
            ) : (
              <div className="rounded-lg bg-muted/20 border border-border/60 p-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  {user.role === "SUPER_ADMIN"
                    ? "User holds SUPER_ADMIN privileges with unrestricted global capabilities across all services."
                    : "No specific individual permission overrides configured. Standard permissions are inherited automatically."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extensible Custom Metadata Card (Clean Structured View) */}
        <Card className="md:col-span-2 shadow-xs">
          <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="size-4 text-primary" />
                  <span>Extensible Custom Metadata</span>
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                  {metadataEntries.length} {metadataEntries.length === 1 ? "field" : "fields"}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Custom application properties, preferences, and external integrations configured for this profile.
              </CardDescription>
            </div>

            {/* Filter & View Mode Toggle */}
            {metadataEntries.length > 0 && (
              <div className="flex items-center gap-2">
                {metadataEntries.length > 4 && (
                  <div className="relative w-44">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      placeholder="Search metadata..."
                      value={metadataSearch}
                      onChange={(e) => setMetadataSearch(e.target.value)}
                      className="h-7 text-xs pl-7"
                    />
                  </div>
                )}

                <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/70 text-xs">
                  <button
                    type="button"
                    onClick={() => setMetadataViewMode("structured")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      metadataViewMode === "structured"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Structured
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetadataViewMode("raw")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      metadataViewMode === "raw"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {metadataEntries.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-1.5">
                <div className="size-9 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                  <Code2 className="size-4.5" />
                </div>
                <p className="text-xs font-semibold text-foreground">No Custom Metadata Configured</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  This user profile does not contain custom properties or integration metadata. Custom fields can be added via the Edit Account page.
                </p>
              </div>
            ) : metadataViewMode === "raw" ? (
              <div className="p-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(user.metadata, null, 2), "raw-json")}
                    className="absolute right-3 top-3 text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 border border-border shadow-2xs hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer z-10"
                  >
                    {copiedKey === "raw-json" ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-emerald-600 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <pre className="p-4 bg-muted/30 rounded-xl text-xs font-mono overflow-x-auto text-foreground border leading-relaxed">
                    {JSON.stringify(user.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              /* Clean Structured Metadata Key-Value Table */
              <div className="divide-y divide-border/60">
                {filteredMetadata.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic">
                    No metadata fields matching &ldquo;{metadataSearch}&rdquo;
                  </div>
                ) : (
                  filteredMetadata.map(([key, value]) => {
                    const valueType = getMetadataType(value);

                    return (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 sm:px-6 hover:bg-muted/20 transition-colors"
                      >
                        {/* Key & Type Badge */}
                        <div className="flex items-center gap-2.5 min-w-[180px] sm:max-w-xs shrink-0">
                          <span className="font-mono text-xs font-semibold text-foreground select-all">
                            {key}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-mono px-1.5 py-0 text-muted-foreground uppercase bg-muted/40 border-border/70"
                          >
                            {valueType}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(String(value), `meta-${key}`)}
                            title="Copy value"
                            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted cursor-pointer transition-colors"
                          >
                            {copiedKey === `meta-${key}` ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>

                        {/* Clean Rendered Value */}
                        <div className="flex-1 sm:text-right">
                          {renderCleanMetadataValue(value)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete User Confirmation Modal */}
      <DeleteUserModal
        user={user}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => router.push("/users")}
      />

      {/* High-Resolution Full Image Dialog / Lightbox */}
      <Dialog open={isImageViewOpen} onOpenChange={setIsImageViewOpen}>
        <DialogContent className="max-w-md sm:max-w-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Profile Photo Preview
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl border">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.fullName || user.firstName}
                className="max-h-72 w-auto object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="size-40 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-muted-foreground truncate max-w-[280px]">
              {user.image?.startsWith("data:") ? "Uploaded Image File" : user.image || "Default Avatar"}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {user.image?.startsWith("http") && (
                <a
                  href={user.image}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="size-3" />
                  <span>Open in tab</span>
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsImageViewOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: Detect type of metadata property
// ---------------------------------------------------------------------------
function getMetadataType(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return `array [${value.length}]`;
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "object") return "object";
  return "string";
}

// ---------------------------------------------------------------------------
// Helper: Render clean visual representation instead of raw JSON
// ---------------------------------------------------------------------------
function renderCleanMetadataValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic text-xs">null</span>;
  }

  // Boolean: Clean Pill Badges
  if (typeof value === "boolean") {
    return value ? (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold gap-1.5 py-0.5"
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        True
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="border-border bg-muted/60 text-muted-foreground text-xs font-medium gap-1.5 py-0.5"
      >
        <span className="size-1.5 rounded-full bg-zinc-400" />
        False
      </Badge>
    );
  }

  // Number: Monospace number formatting
  if (typeof value === "number") {
    return (
      <span className="font-mono text-xs font-semibold text-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/60">
        {value.toLocaleString()}
      </span>
    );
  }

  // String: URL check or clean text
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-mono break-all font-medium"
        >
          <span>{value}</span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      );
    }
    return (
      <span className="text-xs font-medium text-foreground select-all break-all">
        {value}
      </span>
    );
  }

  // Array: Tag list chips
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground italic text-xs">Empty array</span>;
    }
    return (
      <div className="flex flex-wrap sm:justify-end gap-1.5">
        {value.map((item, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="text-[11px] font-mono px-2 py-0.5 font-medium"
          >
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  // Nested Object: Formatted key-value chip table
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-muted-foreground italic text-xs">Empty object</span>;
    }

    return (
      <div className="inline-flex flex-col gap-1 text-left bg-muted/30 border border-border/70 rounded-lg p-2.5 text-xs font-mono max-w-full">
        {entries.map(([nestedKey, nestedVal]) => (
          <div key={nestedKey} className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">{nestedKey}:</span>
            <span className="text-foreground">
              {typeof nestedVal === "object"
                ? JSON.stringify(nestedVal)
                : String(nestedVal)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className="font-mono text-xs text-foreground">
      {String(value)}
    </span>
  );
}
