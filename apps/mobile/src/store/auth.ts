import { create } from "zustand";

import { ApiUser, apiRequest } from "@/api/client";

type TokenPair = {
  access_token: string;
  refresh_token: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  me: ApiUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: { email: string; username: string; password: string; full_name: string }) => Promise<void>;
  loadProfile: () => Promise<void>;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  me: null,
  loading: false,
  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const tokens = await apiRequest<TokenPair>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      });
      await get().loadProfile();
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (payload) => {
    set({ loading: true });
    try {
      const tokens = await apiRequest<TokenPair>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      });
      await get().loadProfile();
    } finally {
      set({ loading: false });
    }
  },
  loadProfile: async () => {
    const accessToken = get().accessToken;
    if (!accessToken) {
      return;
    }
    const me = await apiRequest<ApiUser>("/users/me", {}, accessToken);
    set({ me });
  },
  signOut: () => set({ accessToken: null, refreshToken: null, me: null })
}));
