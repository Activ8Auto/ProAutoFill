// store/authStore.ts
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
// store/authStore.ts
interface AuthState {
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void; // Update signature
  clearAuth: () => void;
}

interface TokenPayload {
  sub: string;
  exp?: number;
}

export const useAuthStore = create<AuthState>((set) => {
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
    setAuth: (token: string, userId: string) => {
      console.log("Setting auth - Token:", token, "UserId:", userId); // Debug
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