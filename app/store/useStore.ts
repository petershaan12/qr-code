import { create } from "zustand";

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  initDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: false,
  sidebarOpen: true,

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute(
          "data-theme",
          newMode ? "dark" : "light",
        );
      }
      localStorage.setItem("darkMode", String(newMode));
      return { darkMode: newMode };
    }),

  initDarkMode: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("darkMode") === "true";
    document.documentElement.setAttribute(
      "data-theme",
      saved ? "dark" : "light",
    );
    set({ darkMode: saved });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
