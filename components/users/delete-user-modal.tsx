"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user.types";
import { userRepo } from "@/repo/user.repo";
import { toastr } from "@/components/ui/toaster";

interface DeleteUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (deletedUserId: string) => void;
}

export function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onDeleted,
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!user) return null;

  const handleClose = () => {
    if (!isDeleting) {
      setErrorMessage(null);
      setIsDeleting(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    await userRepo.deleteUser({
      id: user.id,
      onSuccess: () => {
        setIsDeleting(false);
        toastr.success("User account deleted successfully");
        onDeleted(user.id);
        handleClose();
      },
      onError: (message) => {
        setIsDeleting(false);
        setErrorMessage(message);
        toastr.error(message || "Failed to delete user account");
      },
    });
  };

  const displayName = user.fullName || user.firstName;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="mx-auto sm:mx-0 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">
              Delete User Account
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground font-semibold">
                {displayName}
              </strong>{" "}
              ({user.email})? This action cannot be undone and will revoke all access privileges.
            </DialogDescription>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
