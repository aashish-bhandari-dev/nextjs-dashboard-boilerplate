"use client";

import * as React from "react";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/role.types";
import { roleRepo } from "@/repo/role.repo";
import { toastr } from "@/components/ui/toaster";

interface DeleteRoleModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export function DeleteRoleModal({
  role,
  isOpen,
  onClose,
  onSuccess,
}: DeleteRoleModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!role) return null;

  const isSystemRole = role.isSystem;
  const hasAssignedUsers = (role.usersCount ?? 0) > 0;
  const isDeletable = !isSystemRole && !hasAssignedUsers;

  const handleDelete = async () => {
    if (!isDeletable || isDeleting) return;

    setIsDeleting(true);
    await roleRepo.deleteRole({
      id: role.id,
      onSuccess: () => {
        toastr.success("Role Deleted", {
          description: `Role '${role.displayName || role.name}' has been permanently deleted.`,
        });
        setIsDeleting(false);
        onSuccess(role.id);
        onClose();
      },
      onError: (message) => {
        toastr.error("Failed to Delete Role", { description: message });
        setIsDeleting(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-[460px] p-6">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                isDeletable
                  ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {isDeletable ? (
                <AlertTriangle className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {isDeletable ? "Delete Custom Role" : "Cannot Delete Role"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {role.displayName} ({role.name})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3 text-sm text-muted-foreground">
          {isSystemRole ? (
            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">System Role Protection</p>
              <p>
                This is a core system role required by the platform architecture. System roles
                cannot be deleted or renamed to ensure platform stability.
              </p>
            </div>
          ) : hasAssignedUsers ? (
            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">Users Currently Assigned</p>
              <p>
                This role currently has <strong>{role.usersCount}</strong> user(s) assigned to it.
                Please reassign these users to another role before attempting deletion.
              </p>
            </div>
          ) : (
            <p>
              Are you sure you want to permanently delete the custom role{" "}
              <strong className="text-foreground">{role.displayName}</strong>? This action
              cannot be undone.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeletable ? "Cancel" : "Close"}
          </Button>

          {isDeletable && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Role"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
