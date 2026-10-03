"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "default" | "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners = new Set<ToastListener>();

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  add(toast: Omit<ToastItem, "id"> & { id?: string }): string {
    const id = toast.id || Math.random().toString(36).slice(2, 9);
    const duration = toast.duration ?? (toast.type === "error" ? 5000 : 3500);

    const newToast: ToastItem = {
      ...toast,
      id,
      duration,
    };

    // Keep max 5 visible toasts
    this.toasts = [newToast, ...this.toasts.slice(0, 4)];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id?: string) {
    if (id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    } else {
      this.toasts = [];
    }
    this.notify();
  }
}

export const toastManager = new ToastManager();

interface ToastOptions {
  description?: string;
  duration?: number;
  id?: string;
}

export function toast(message: string, options?: ToastOptions) {
  return toastManager.add({
    title: message,
    description: options?.description,
    duration: options?.duration,
    id: options?.id,
    type: "default",
  });
}

toast.success = (message: string, options?: ToastOptions) =>
  toastManager.add({
    title: message,
    description: options?.description,
    duration: options?.duration,
    id: options?.id,
    type: "success",
  });

toast.error = (message: string, options?: ToastOptions) =>
  toastManager.add({
    title: message,
    description: options?.description,
    duration: options?.duration,
    id: options?.id,
    type: "error",
  });

toast.info = (message: string, options?: ToastOptions) =>
  toastManager.add({
    title: message,
    description: options?.description,
    duration: options?.duration,
    id: options?.id,
    type: "info",
  });

toast.warning = (message: string, options?: ToastOptions) =>
  toastManager.add({
    title: message,
    description: options?.description,
    duration: options?.duration,
    id: options?.id,
    type: "warning",
  });

toast.dismiss = (id?: string) => toastManager.dismiss(id);

// Convenient alias for "toastr"
export const toastr = toast;

export function Toaster({ className }: { className?: string }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      data-slot="toaster"
      aria-live="polite"
      className={cn(
        "fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none sm:top-6 sm:right-6",
        className
      )}
    >
      {toasts.map((item) => {
        const isSuccess = item.type === "success";
        const isError = item.type === "error";
        const isWarning = item.type === "warning";
        const isInfo = item.type === "info";

        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-top-3",
              "bg-popover text-popover-foreground border-border/80",
              isSuccess && "border-emerald-500/30 bg-card text-foreground",
              isError && "border-destructive/40 bg-card text-foreground",
              isWarning && "border-amber-500/40 bg-card text-foreground"
            )}
          >
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && (
                <div className="size-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="size-3.5" />
                </div>
              )}
              {isError && (
                <div className="size-5 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
                  <AlertCircle className="size-3.5" />
                </div>
              )}
              {isWarning && (
                <div className="size-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="size-3.5" />
                </div>
              )}
              {isInfo && (
                <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <Info className="size-3.5" />
                </div>
              )}
              {!isSuccess && !isError && !isWarning && !isInfo && (
                <div className="size-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Info className="size-3.5" />
                </div>
              )}
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-semibold leading-snug break-words">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed break-words">
                  {item.description}
                </p>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => toastManager.dismiss(item.id)}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
