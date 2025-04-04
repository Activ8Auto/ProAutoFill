// store/authStore.ts
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  isTokenExpired: () => boolean;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let storedUserId: string | null = null;
  if (storedToken) {
    try {
      const decoded = jwtDecode<TokenPayload>(storedToken);
      storedUserId = decoded.sub;
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }

  return {
    token: storedToken,
    userId: storedUserId,
    isTokenExpired: () => {
      const token = get().token;
      if (!token) return true;
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000; // Current time in seconds
        return decoded.exp < currentTime;
      } catch (e) {
        console.error("Failed to decode token", e);
        return true; // Treat as expired if decoding fails
      }
    },
    setAuth: (token: string, userId: string) => {
      set({ token, userId });
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
    },
    clearAuth: () => {
      set({ token: null, userId: null });
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    },
  };
});