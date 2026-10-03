"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Edit,
  ExternalLink,
  Eye,
  Globe,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Trash2,
  User as UserIcon,
  XCircle,
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

  if (isLoading) {
    return (
      <div className="flex h-96 w-full max-w-5xl mx-auto flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs">Loading user profile...</span>
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-4">
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
        month: "long",
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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/users")}
            className="h-8 gap-1.5 text-xs shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Users</span>
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-xs text-muted-foreground hidden sm:inline">User Overview</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href={`/users/${user.id}/edit`} className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs w-full sm:w-auto">
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Account</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-8 gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete User</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Summary Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-muted/40 h-20 sm:h-24 border-b relative" />
        <CardContent className="pt-0 relative p-4 sm:px-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="relative group shrink-0">
                <Avatar className="size-16 sm:size-20 border-4 border-card shadow-md shrink-0 bg-muted/40 cursor-pointer">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.fullName || user.firstName} className="object-cover size-full" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg sm:text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {user.image && (
                  <button
                    type="button"
                    onClick={() => setIsImageViewOpen(true)}
                    title="View Full Photo"
                    className="absolute inset-0 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                    {user.fullName || user.firstName}
                  </h1>
                  <Badge variant="outline" className="text-xs font-semibold">
                    <Shield className="mr-1 h-3 w-3 inline text-primary" />
                    {roleString}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground break-all sm:break-normal">
                  @{user.username || "no-username"} • {user.email}
                </p>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {user.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active Account
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-zinc-400" />
                  Inactive Account
                </span>
              )}

              {user.isDeactivated && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  <span className="size-1.5 rounded-full bg-destructive" />
                  Deactivated
                </span>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="text-xs text-muted-foreground border-t pt-3 mt-3">
              {user.bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact & Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span>Contact & Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Mail className="h-3.5 w-3.5" />
                Email
              </span>
              <div className="flex items-center gap-1.5 font-medium break-all sm:break-normal">
                <span>{user.email}</span>
                {user.isEmailVerified ? (
                  <span title="Verified">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  </span>
                ) : (
                  <span title="Unverified">
                    <XCircle className="size-3.5 text-muted-foreground shrink-0" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </span>
              <div className="flex items-center gap-1.5 font-medium">
                <span>{user.phone || "Not configured"}</span>
                {user.isPhoneVerified && (
                  <span title="Verified">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Calendar className="h-3.5 w-3.5" />
                Date of Birth
              </span>
              <span className="font-medium">
                {user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <UserIcon className="h-3.5 w-3.5" />
                Gender
              </span>
              <span className="font-medium">
                {user.gender || "Not specified"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Globe className="h-3.5 w-3.5" />
                Locale & Timezone
              </span>
              <span className="font-medium">
                {user.locale || "en"} / {user.timezone || "UTC"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security, Provider & Auditing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <span>Security & Audit Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Shield className="h-3.5 w-3.5" />
                Authentication Provider
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono w-fit">
                  {user.provider || "LOCAL"}
                </Badge>
                {user.providerId ? (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ({user.providerId})
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Clock className="h-3.5 w-3.5" />
                Last Login
              </span>
              <span className="font-medium">{formattedLastLogin}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <MapPin className="h-3.5 w-3.5" />
                Last Login IP
              </span>
              <span className="font-mono font-medium">
                {user.lastLoginAt ? "Audited via session" : "No record"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Calendar className="h-3.5 w-3.5" />
                Registered On
              </span>
              <span className="font-medium">{formattedJoined}</span>
            </div>
          </CardContent>
        </Card>

        {/* RBAC Permissions List */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Assigned RBAC Permissions</span>
            </CardTitle>
            <CardDescription className="text-xs">
              System access capabilities inherited through role or custom assignment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(user.permissions) && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.permissions.map((p) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className="bg-muted/50 font-mono text-[10px] px-2 py-0.5"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                {user.role === "SUPER_ADMIN"
                  ? "User has SUPER_ADMIN role with unrestricted global access permissions."
                  : "Standard permissions assigned based on role."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Extensible Custom Metadata Card */}
        {user.metadata && Object.keys(user.metadata).length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span>Extensible Custom Metadata</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Custom application metadata, preferences, and integration properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-muted/40 rounded-lg text-xs font-mono overflow-x-auto text-foreground border">
                {JSON.stringify(user.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
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
              {user.image?.startsWith("data:") ? "Local Image File" : user.image || "Default Avatar"}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {user.image?.startsWith("http") && (
                <a
                  href={user.image}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
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
                className="h-8 text-xs"
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
