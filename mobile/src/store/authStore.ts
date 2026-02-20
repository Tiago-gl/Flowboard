import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "../lib/schemas";

type AuthStatus = "idle" | "ready";

type AuthState = {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  setHydrated: (hydrated: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: "idle",
      hydrated: false,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setStatus: (status) => set({ status }),
      setHydrated: (hydrated) => set({ hydrated }),
      login: (token, user) => set({ token, user, status: "ready" }),
      logout: () => set({ token: null, user: null, status: "idle" }),
    }),
    {
      name: "dashboard-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.token) {
          state?.setStatus("ready");
        }
      },
    }
  )
);
