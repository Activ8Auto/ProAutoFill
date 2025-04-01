// store/authStore.ts
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
}
interface TokenPayload {
  sub: string; // assuming the user id is stored in "sub"
  // any other claims...
}
export const useAuthStore = create<AuthState>((set) => {
  const storedToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
    setAuth: (token: string) => {
      let userId: string | null = null;
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        userId = decoded.sub;
      } catch (e) {
        console.error("Failed to decode token", e);
      }
      set({ token, userId });
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId ? userId : "");
    },
    clearAuth: () => {
      set({ token: null, userId: null });
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    },
  };
});
