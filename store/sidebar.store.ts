import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface SidebarStore {
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const getInitialOpenState = (): boolean => {
  if (typeof window !== "undefined") {
    const cookieValue = Cookies.get(SIDEBAR_COOKIE_NAME);
    if (cookieValue !== undefined) {
      return cookieValue === "true";
    }
    const stored = localStorage.getItem("sidebar-storage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.state?.open === "boolean") {
          return parsed.state.open;
        }
      } catch {}
    }
  }
  return true;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      open: getInitialOpenState(),
      setOpen: (value) => {
        const next = typeof value === "function" ? value(get().open) : value;
        set({ open: next });
        if (typeof document !== "undefined") {
          Cookies.set(SIDEBAR_COOKIE_NAME, String(next), {
            path: "/",
            expires: 7,
          });
        }
      },
      toggleSidebar: () => {
        const next = !get().open;
        get().setOpen(next);
      },
    }),
    {
      name: "sidebar-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
