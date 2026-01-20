import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../lib/schemas";

type AuthStatus = "idle" | "loading" | "ready";

type AuthState = {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: "idle",
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setStatus: (status) => set({ status }),
      login: (token, user) => set({ token, user, status: "ready" }),
      logout: () => set({ token: null, user: null, status: "idle" }),
    }),
    {
      name: "dashboard-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
