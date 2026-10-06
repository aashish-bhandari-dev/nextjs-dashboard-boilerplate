"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  Save,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateUserInput, UpdateUserInput, User } from "@/types/user.types";
import { Role } from "@/types/role.types";
import { userRepo } from "@/repo/user.repo";
import { roleRepo } from "@/repo/role.repo";
import { toastr } from "@/components/ui/toaster";
import { userFormSchema } from "@/schemas";

interface UserFormProps {
  initialData?: User | null;
  userId?: string;
  isEdit?: boolean;
}

interface MetadataField {
  id: string;
  key: string;
  value: string;
}

const AUTH_PROVIDERS = [
  { value: "LOCAL", label: "Local (Email / Password)" },
  { value: "GOOGLE", label: "Google OAuth" },
  { value: "APPLE", label: "Apple ID" },
  { value: "GITHUB", label: "GitHub OAuth" },
  { value: "FACEBOOK", label: "Facebook OAuth" },
];

const PRESET_AVATARS = [
  { label: "Male 1", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80" },
  { label: "Female 1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80" },
  { label: "Male 2", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80" },
  { label: "Female 2", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
  { label: "Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80" },
];

export function UserForm({ initialData, userId, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const topRef = React.useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      const scrollableParent =
        topRef.current?.closest("main") || document.querySelector("main");
      if (scrollableParent) {
        scrollableParent.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // Form state holding all backend-accepted fields (without custom roleId)
  const [formData, setFormData] = React.useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    password: "",
    phone: initialData?.phone || "",
    image: initialData?.image || "",
    bio: initialData?.bio || "",
    gender: initialData?.gender || "",
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    locale: initialData?.locale || "en",
    timezone: initialData?.timezone || "UTC",
    role: initialData?.role || "USER",
    provider: initialData?.provider || "LOCAL",
    providerId: initialData?.providerId || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    isDeactivated: initialData?.isDeactivated || false,
    isEmailVerified: initialData?.isEmailVerified || false,
    isPhoneVerified: initialData?.isPhoneVerified || false,
  });

  // Dynamic Key-Value Metadata entries
  const [metadataFields, setMetadataFields] = React.useState<MetadataField[]>(() => {
    if (initialData?.metadata && typeof initialData.metadata === "object") {
      return Object.entries(initialData.metadata).map(([k, v]) => ({
        id: Math.random().toString(36).slice(2, 9),
        key: k,
        value: typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? ""),
      }));
    }
    return [];
  });

  // Dynamic roles state fetched from API
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = React.useState(true);

  const [isLoadingUser, setIsLoadingUser] = React.useState(isEdit && !initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Image lightbox state
  const [isImageViewOpen, setIsImageViewOpen] = React.useState(false);
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const handleCopyUrl = () => {
    if (!formData.image) return;
    navigator.clipboard.writeText(formData.image);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // If in edit mode and no initialData was passed, fetch user by ID
  React.useEffect(() => {
    if (isEdit && userId && !initialData) {
      userRepo.getUserById({
        id: userId,
        onSuccess: (user) => {
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            username: user.username || "",
            email: user.email || "",
            password: "",
            phone: user.phone || "",
            image: user.image || "",
            bio: user.bio || "",
            gender: user.gender || "",
            dateOfBirth: user.dateOfBirth
              ? new Date(user.dateOfBirth).toISOString().split("T")[0]
              : "",
            locale: user.locale || "en",
            timezone: user.timezone || "UTC",
            role: user.role || "USER",
            provider: user.provider || "LOCAL",
            providerId: user.providerId || "",
            isActive: user.isActive,
            isDeactivated: user.isDeactivated || false,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
          });

          if (user.metadata && typeof user.metadata === "object") {
            const fields = Object.entries(user.metadata).map(([k, v]) => ({
              id: Math.random().toString(36).slice(2, 9),
              key: k,
              value: typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? ""),
            }));
            setMetadataFields(fields);
          }

          setIsLoadingUser(false);
        },
        onError: (err) => {
          toastr.error(err);
          setIsLoadingUser(false);
        },
      });
    }
  }, [isEdit, userId, initialData]);

  // Fetch roles dynamically from API
  React.useEffect(() => {
    roleRepo.listRoles({
      query: { limit: 100 },
      onSuccess: (data) => {
        setRoles(data);
        setIsLoadingRoles(false);
      },
      onError: (err) => {
        console.error("Failed to load roles for user form:", err);
        setIsLoadingRoles(false);
      },
    });
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Smoothly scroll to and focus a field by its id
  const focusField = (fieldId: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      } else {
        scrollToTop();
      }
    });
  };

  // Map backend error messages (e.g. "A record with this phone already exists")
  // to the matching form field so it is highlighted inline.
  const API_ERROR_FIELD_MATCHERS: { field: string; patterns: RegExp }[] = [
    { field: "email", patterns: /\be-?mail\b/i },
    { field: "phone", patterns: /\b(phone|mobile|contact number)\b/i },
    { field: "username", patterns: /\buser\s?name\b/i },
    { field: "password", patterns: /\bpassword\b/i },
    { field: "firstName", patterns: /\bfirst\s?name\b/i },
    { field: "lastName", patterns: /\blast\s?name\b/i },
    { field: "image", patterns: /\b(image|avatar|photo)\b/i },
    { field: "bio", patterns: /\bbio\b/i },
  ];

  const handleApiFieldError = (err: string) => {
    const match = API_ERROR_FIELD_MATCHERS.find(({ patterns }) => patterns.test(err));
    if (!match) {
      scrollToTop();
      return;
    }
    setFieldErrors((prev) => ({ ...prev, [match.field]: err }));
    focusField(match.field);
  };

  // Ref to track the newly added metadata field for smooth scrolling and autofocus
  const latestAddedIdRef = React.useRef<string | null>(null);

  // Metadata field handlers
  const handleAddField = () => {
    const newId = Math.random().toString(36).slice(2, 9);
    latestAddedIdRef.current = newId;
    setMetadataFields((prev) => [
      ...prev,
      { id: newId, key: "", value: "" },
    ]);
  };

  // Smooth scroll and focus newly added metadata row
  React.useEffect(() => {
    if (!latestAddedIdRef.current) return;
    const targetId = latestAddedIdRef.current;
    latestAddedIdRef.current = null;

    // Use requestAnimationFrame to ensure the newly added row is mounted in DOM
    requestAnimationFrame(() => {
      const rowEl = document.getElementById(`metadata-row-${targetId}`);
      if (rowEl) {
        rowEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        const keyInput = rowEl.querySelector<HTMLInputElement>("input");
        if (keyInput) {
          keyInput.focus();
        }
      }
    });
  }, [metadataFields]);

  const handleRemoveField = (id: string) => {
    setMetadataFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFieldChange = (id: string, prop: "key" | "value", val: string) => {
    setMetadataFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [prop]: val } : f))
    );
  };

  // Convert key-value entries to proper JSON object
  const buildMetadataPayload = (): Record<string, unknown> | undefined => {
    const result: Record<string, unknown> = {};
    for (const field of metadataFields) {
      const k = field.key.trim();
      if (!k) continue;

      const v = field.value.trim();
      // Coerce boolean
      if (v.toLowerCase() === "true") {
        result[k] = true;
      } else if (v.toLowerCase() === "false") {
        result[k] = false;
      } else if (v !== "" && !isNaN(Number(v)) && !v.startsWith("0x")) {
        // Coerce numeric
        result[k] = Number(v);
      } else if ((v.startsWith("{") && v.endsWith("}")) || (v.startsWith("[") && v.endsWith("]"))) {
        // Coerce nested JSON object or array
        try {
          result[k] = JSON.parse(v);
        } catch {
          result[k] = field.value;
        }
      } else {
        result[k] = field.value;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  };

  // Client-side local image reader with compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFieldErrors((prev) => ({ ...prev, image: "Please select a valid image file." }));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, image: "Image file exceeds maximum allowed size (8MB)." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize down to maximum 600x600 for optimal storage & speed
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zod schema validation using centralized userFormSchema
    const schema = userFormSchema(isEdit);
    const parseResult = schema.safeParse(formData);

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      let firstErrorKey: string | null = null;

      for (const issue of parseResult.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) {
          errors[key] = issue.message;
        }
        if (!firstErrorKey) {
          firstErrorKey = key;
        }
      }

      setFieldErrors(errors);

      if (firstErrorKey) {
        const targetId = firstErrorKey;
        requestAnimationFrame(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus({ preventScroll: true });
          } else {
            scrollToTop();
          }
        });
      } else {
        scrollToTop();
      }
      return;
    }

    setFieldErrors({});

    const metadataPayload = buildMetadataPayload();
    setIsSubmitting(true);

    if (isEdit && userId) {
      // Build partial update payload matching updateUserSchema
      const updatePayload: UpdateUserInput = {
        firstName: formData.firstName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        isActive: formData.isActive,
        isDeactivated: formData.isDeactivated,
        isEmailVerified: formData.isEmailVerified,
        isPhoneVerified: formData.isPhoneVerified,
      };

      if (formData.lastName.trim()) updatePayload.lastName = formData.lastName.trim();
      if (formData.username.trim()) updatePayload.username = formData.username.trim();
      if (formData.phone.trim()) updatePayload.phone = formData.phone.trim();
      if (formData.image.trim()) updatePayload.image = formData.image.trim();
      if (formData.gender.trim()) updatePayload.gender = formData.gender.trim();
      if (formData.dateOfBirth) updatePayload.dateOfBirth = formData.dateOfBirth;
      if (formData.locale.trim()) updatePayload.locale = formData.locale.trim();
      if (formData.timezone.trim()) updatePayload.timezone = formData.timezone.trim();
      if (formData.bio.trim()) updatePayload.bio = formData.bio.trim();
      if (formData.password.trim()) updatePayload.password = formData.password.trim();
      if (metadataPayload) updatePayload.metadata = metadataPayload;

      await userRepo.updateUser({
        id: userId,
        data: updatePayload,
        onSuccess: () => {
          setIsSubmitting(false);
          const msg = "User record successfully updated.";
          toastr.success(msg);
          setTimeout(() => {
            router.push("/users");
            router.refresh();
          }, 700);
        },
        onError: (err) => {
          setIsSubmitting(false);
          toastr.error(err);
          handleApiFieldError(err);
        },
      });
    } else {
      // Build creation payload matching createUserSchema
      const createPayload: CreateUserInput = {
        firstName: formData.firstName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        role: formData.role,
        provider: formData.provider,
        isActive: formData.isActive,
        isDeactivated: formData.isDeactivated,
      };

      if (formData.lastName.trim()) createPayload.lastName = formData.lastName.trim();
      if (formData.username.trim()) createPayload.username = formData.username.trim();
      if (formData.phone.trim()) createPayload.phone = formData.phone.trim();
      if (formData.image.trim()) createPayload.image = formData.image.trim();
      if (formData.gender.trim()) createPayload.gender = formData.gender.trim();
      if (formData.dateOfBirth) createPayload.dateOfBirth = formData.dateOfBirth;
      if (formData.locale.trim()) createPayload.locale = formData.locale.trim();
      if (formData.timezone.trim()) createPayload.timezone = formData.timezone.trim();
      if (formData.bio.trim()) createPayload.bio = formData.bio.trim();
      if (formData.providerId.trim()) createPayload.providerId = formData.providerId.trim();
      if (metadataPayload) createPayload.metadata = metadataPayload;

      await userRepo.createUser({
        data: createPayload,
        onSuccess: () => {
          setIsSubmitting(false);
          const msg = "New user account successfully created.";
          toastr.success(msg);
          setTimeout(() => {
            router.push("/users");
            router.refresh();
          }, 700);
        },
        onError: (err) => {
          setIsSubmitting(false);
          toastr.error(err);
          handleApiFieldError(err);
        },
      });
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-96 w-full max-w-7xl mx-auto flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-medium">Loading user record...</span>
      </div>
    );
  }

  const initials = formData.firstName
    ? `${formData.firstName[0]}${formData.lastName ? formData.lastName[0] : ""}`.toUpperCase()
    : "U";

  return (
    <div ref={topRef} className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {isEdit ? "Edit User Account" : "Create New User"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Update user profile, authentication credentials, permissions, and custom attributes."
                : "Register a new user account with role permissions and personal details."}
            </p>
          </div>
        </div>
      </div>



      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Card 1: Profile Photo & Avatar Management */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span>Profile Photo & Avatar</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Upload an image or provide a hosted URL. Images are displayed in headers, navigation, and user directories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar Preview */}
              <div className="relative group shrink-0 self-center sm:self-auto">
                <Avatar className="size-20 sm:size-24 rounded-full border-2 border-border/80 shadow-md overflow-hidden flex items-center justify-center bg-muted/40 transition-transform duration-300 group-hover:scale-105">
                  {formData.image ? (
                    <AvatarImage
                      src={formData.image}
                      alt={formData.firstName || "User avatar"}
                      className="object-cover size-full"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl sm:text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setIsImageViewOpen(true)}
                    title="View Full Photo"
                    className="absolute inset-0 bg-black/55 backdrop-blur-[2px] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="size-4.5 drop-shadow-sm" />
                    <span className="text-[9px] font-semibold tracking-wider uppercase drop-shadow-sm">View</span>
                  </button>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="image"
                    className={`text-xs ${fieldErrors.image ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
                  >
                    Image URL or Data URL
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      placeholder="https://images.unsplash.com/... or data:image/..."
                      value={formData.image}
                      onChange={(e) => handleChange("image", e.target.value)}
                      disabled={isSubmitting}
                      aria-invalid={!!fieldErrors.image}
                      className={`h-9 text-xs font-mono transition-colors shadow-none focus-visible:ring-0 ${
                        fieldErrors.image
                          ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                          : ""
                      }`}
                    />
                    {formData.image ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleChange("image", "")}
                        title="Remove image"
                        className="h-9 px-2.5 text-xs text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                      </Button>
                    ) : null}
                  </div>
                  {fieldErrors.image && (
                    <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                      <AlertCircle className="size-2.5 shrink-0" />
                      <span>{fieldErrors.image}</span>
                    </p>
                  )}
                </div>

                {/* File Upload & Presets Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="h-8 px-2.5 gap-1.5 text-xs text-foreground cursor-pointer"
                  >
                    <Upload className="size-3.5" />
                    <span>Upload Image</span>
                  </Button>

                  {formData.image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsImageViewOpen(true)}
                      className="h-8 px-2.5 gap-1.5 text-xs text-foreground cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>View Full Image</span>
                    </Button>
                  )}

                  {/* Preset Avatar Suggestions */}
                  <div className="flex items-center gap-1 ml-auto text-[11px] text-muted-foreground">
                    <Sparkles className="size-3 text-amber-500" />
                    <span className="hidden md:inline">Presets:</span>
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleChange("image", preset.url)}
                        className="px-1.5 py-0.5 rounded border border-border/80 text-[10px] hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Primary Account Credentials & Identity */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span>Identity & Primary Credentials</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Essential personal identity, username, and login credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="firstName"
                className={`text-xs ${fieldErrors.firstName ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
              >
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Jane"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.firstName}
                className={`h-9 text-xs transition-colors shadow-none focus-visible:ring-0 ${
                  fieldErrors.firstName
                    ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                    : ""
                }`}
              />
              {fieldErrors.firstName && (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.firstName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="lastName"
                className={`text-xs ${fieldErrors.lastName ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.lastName}
                className={`h-9 text-xs transition-colors shadow-none focus-visible:ring-0 ${
                  fieldErrors.lastName
                    ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                    : ""
                }`}
              />
              {fieldErrors.lastName && (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.lastName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className={`text-xs ${fieldErrors.username ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
              >
                Username
              </Label>
              <Input
                id="username"
                placeholder="janedoe"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.username}
                className={`h-9 text-xs transition-colors shadow-none focus-visible:ring-0 ${
                  fieldErrors.username
                    ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                    : ""
                }`}
              />
              {fieldErrors.username ? (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.username}</span>
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground">
                  Letters, numbers, dots, and underscores (min 3 chars).
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className={`text-xs ${fieldErrors.email ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
              >
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                    fieldErrors.email ? "text-red-500/70" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.email}
                  className={`h-9 pl-9 text-xs transition-colors shadow-none focus-visible:ring-0 ${
                    fieldErrors.email
                      ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                      : ""
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className={`text-xs ${fieldErrors.password ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
              >
                Password {isEdit ? "(Optional)" : <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <Lock
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                    fieldErrors.password ? "text-red-500/70" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isEdit ? "•••••••• (Leave blank to keep current)" : "At least 6 characters"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.password}
                  className={`h-9 pl-9 pr-9 text-xs transition-colors shadow-none focus-visible:ring-0 ${
                    fieldErrors.password
                      ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className={`text-xs ${fieldErrors.phone ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                    fieldErrors.phone ? "text-red-500/70" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.phone}
                  className={`h-9 pl-9 text-xs transition-colors shadow-none focus-visible:ring-0 ${
                    fieldErrors.phone
                      ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus-visible:border-red-500/80"
                      : ""
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Authorization, Roles & Provider (without custom roleId) */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Roles, Permissions & Authentication Provider</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Determine administrative access hierarchy and authentication provider settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Role Select */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="role" className="text-xs">
                    Assigned Role <span className="text-destructive">*</span>
                  </Label>
                  {isLoadingRoles && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      Loading roles...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    disabled={isSubmitting || isLoadingRoles}
                    className="h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer disabled:opacity-60"
                  >
                    {roles.length > 0 ? (
                      <>
                        {formData.role && !roles.some((r) => r.name === formData.role) && (
                          <option value={formData.role}>{formData.role}</option>
                        )}
                        {roles.map((r) => (
                          <option key={r.id || r.name} value={r.name}>
                            {r.displayName ? `${r.displayName} (${r.name})` : r.name}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value={formData.role || "USER"}>
                        {formData.role || "USER"}
                      </option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {(() => {
                  const currentRole = roles.find((r) => r.name === formData.role);
                  if (currentRole?.description) {
                    return (
                      <p className="text-[11px] text-muted-foreground">
                        {currentRole.description}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Provider Select */}
              <div className="space-y-1.5">
                <Label htmlFor="provider" className="text-xs">
                  Authentication Provider
                </Label>
                <div className="relative">
                  <select
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => handleChange("provider", e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    {AUTH_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Provider Subject / Account ID */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="providerId" className="text-xs">
                  Provider Subject / Account ID <span className="text-muted-foreground font-normal">(Optional, for OAuth accounts)</span>
                </Label>
                <Input
                  id="providerId"
                  placeholder="e.g. google-oauth2|1029384756 or github_uid"
                  value={formData.providerId}
                  onChange={(e) => handleChange("providerId", e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Lifecycle & Status Toggles */}
            <div className="pt-2">
              <Label className="text-xs font-semibold block mb-2">Account Lifecycle & Verification Flags</Label>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {/* Active Checkbox */}
                <div className="flex items-center space-x-2.5 rounded-lg border p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange("isActive", !!checked)}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label htmlFor="isActive" className="text-xs font-semibold cursor-pointer">
                      Active
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Enabled for login</p>
                  </div>
                </div>

                {/* Deactivated Checkbox */}
                <div className="flex items-center space-x-2.5 rounded-lg border p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="isDeactivated"
                    checked={formData.isDeactivated}
                    onCheckedChange={(checked) => handleChange("isDeactivated", !!checked)}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label htmlFor="isDeactivated" className="text-xs font-semibold cursor-pointer">
                      Deactivated
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Administrative hold</p>
                  </div>
                </div>

                {/* Email Verified */}
                <div className="flex items-center space-x-2.5 rounded-lg border p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="isEmailVerified"
                    checked={formData.isEmailVerified}
                    onCheckedChange={(checked) => handleChange("isEmailVerified", !!checked)}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label htmlFor="isEmailVerified" className="text-xs font-semibold cursor-pointer">
                      Email Verified
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Address confirmed</p>
                  </div>
                </div>

                {/* Phone Verified */}
                <div className="flex items-center space-x-2.5 rounded-lg border p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="isPhoneVerified"
                    checked={formData.isPhoneVerified}
                    onCheckedChange={(checked) => handleChange("isPhoneVerified", !!checked)}
                    disabled={isSubmitting}
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label htmlFor="isPhoneVerified" className="text-xs font-semibold cursor-pointer">
                      Phone Verified
                    </Label>
                    <p className="text-[10px] text-muted-foreground">SMS confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Localization, Demographics & Bio */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Demographics, Localization & Profile Bio</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Locale, timezone, gender, date of birth, and administrative remarks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs">
                Gender
              </Label>
              <div className="relative">
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="">Unspecified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="text-xs">
                Date of Birth
              </Label>
              <DatePicker
                value={formData.dateOfBirth}
                onChange={(val) => handleChange("dateOfBirth", val)}
                placeholder="Select date of birth"
                disabled={isSubmitting}
                disableFuture
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="locale" className="text-xs">
                Locale
              </Label>
              <Input
                id="locale"
                placeholder="en"
                value={formData.locale}
                onChange={(e) => handleChange("locale", e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs">
                Timezone
              </Label>
              <Input
                id="timezone"
                placeholder="UTC"
                value={formData.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="bio"
                  className={`text-xs ${fieldErrors.bio ? "text-red-600/90 dark:text-red-400/90 font-medium" : ""}`}
                >
                  Bio / Administrative Notes
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {formData.bio.length}/500
                </span>
              </div>
              <textarea
                id="bio"
                rows={3}
                maxLength={500}
                placeholder="Add optional administrative remarks or bio..."
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.bio}
                className={`w-full rounded-md border bg-background p-2.5 text-xs outline-none shadow-none resize-y transition-colors ${
                  fieldErrors.bio
                    ? "border-red-400/70 dark:border-red-500/60 bg-red-500/[0.02] focus:border-red-500/80"
                    : "border-input focus:border-ring focus:ring-1 focus:ring-ring"
                }`}
              />
              {fieldErrors.bio && (
                <p className="text-[10px] leading-tight text-red-600/90 dark:text-red-400/90 !mt-0 flex items-center gap-1 animate-in fade-in-50 duration-200">
                  <AlertCircle className="size-2.5 shrink-0" />
                  <span>{fieldErrors.bio}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Extensible Custom Metadata (Interactive Key-Value Builder) */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  <span>Extensible Custom Metadata</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Add dynamic key-value properties. These are automatically compiled into structured JSON for the backend.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddField}
                disabled={isSubmitting}
                className="h-8 px-2.5 gap-1.5 text-xs self-start sm:self-auto shrink-0 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Field</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metadataFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/20 text-center">
                <Code2 className="h-6 w-6 text-muted-foreground/50 mb-1.5" />
                <p className="text-xs font-medium text-foreground">No metadata fields added yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm">
                  Click &quot;Add Field&quot; to configure custom application attributes, notification preferences, or department tags.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddField}
                  disabled={isSubmitting}
                  className="mt-3 h-8 px-3 gap-1.5 text-xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Add First Field</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-muted-foreground px-0.5 pb-1">
                  <div className="col-span-5">Key / Property Name</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {metadataFields.map((field, idx) => (
                  <div
                    key={field.id}
                    id={`metadata-row-${field.id}`}
                    className="grid grid-cols-12 gap-2 items-center transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-2"
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder={`e.g. department, tier, tag_${idx + 1}`}
                        value={field.key}
                        onChange={(e) => handleFieldChange(field.id, "key", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8.5 text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder='e.g. Engineering, true, 42, ["alpha"]'
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8.5 text-xs"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveField(field.id)}
                        disabled={isSubmitting}
                        title="Remove field"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-2">
          <Link href="/users" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 text-xs cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-9 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isEdit ? "Saving Changes..." : "Creating Account..."}</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{isEdit ? "Update User" : "Create User"}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* High-Resolution Modern Aesthetic Avatar Lightbox */}
      <Dialog open={isImageViewOpen} onOpenChange={setIsImageViewOpen}>
        <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30">
            <div className="flex items-center gap-2.5 min-w-0 pr-8">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ImageIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Avatar Preview
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground">
                  High-resolution photo and source details
                </p>
              </div>
            </div>
          </div>

          {/* Main Visual Display Stage */}
          <div className="relative p-6 sm:p-8 flex items-center justify-center bg-radial from-muted/50 via-muted/15 to-background overflow-hidden min-h-[260px]">
            {/* Ambient Background Glow */}
            <div
              className="absolute inset-0 opacity-20 dark:opacity-30 blur-3xl pointer-events-none -z-0"
              style={{
                background: "radial-gradient(circle at center, var(--primary) 0%, transparent 70%)",
              }}
            />

            {formData.image ? (
              <div className="relative group max-w-full">
                {/* Photo frame with shadow & clean border */}
                <div className="relative rounded-2xl p-1 bg-background/80 backdrop-blur-md border border-border/70 shadow-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.image}
                    alt="Full avatar preview"
                    className="max-h-72 sm:max-h-80 w-auto max-w-full object-contain rounded-xl"
                  />
                </div>

                {/* Format pill badge */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/10">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{formData.image.startsWith("data:") ? "Uploaded File" : "Remote URL"}</span>
                </div>
              </div>
            ) : (
              <div className="size-44 rounded-full bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center text-4xl font-bold shadow-lg">
                {initials}
              </div>
            )}
          </div>

          {/* Source Info Section - Multi-line, no horizontal overflow */}
          <div className="p-4 sm:p-5 border-t bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Source Details</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
                  {formData.image.startsWith("data:") ? "Local File" : "Remote Web Link"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.image.startsWith("http") && (
                  <a
                    href={formData.image}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    <ExternalLink className="size-3" />
                    <span>Open Link</span>
                  </a>
                )}
                {formData.image.startsWith("data:") && (
                  <a
                    href={formData.image}
                    download="avatar-preview.png"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    <Download className="size-3" />
                    <span>Download</span>
                  </a>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-7 px-2.5 text-xs gap-1.5 shrink-0 cursor-pointer"
                  title="Copy full image source to clipboard"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* URL Display Box - wraps to new line on overflow with clean vertical scroll if extremely long */}
            <div className="rounded-lg border border-border/70 bg-background/90 p-2.5 max-h-24 overflow-y-auto">
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground break-all whitespace-pre-wrap select-all">
                {formData.image}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end px-5 py-3 border-t bg-muted/30">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImageViewOpen(false)}
              className="h-8 px-4 text-xs font-medium cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
