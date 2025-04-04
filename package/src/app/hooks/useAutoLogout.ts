// hooks/useAutoLogout.tsx
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

interface TokenPayload {
  sub: string;
  exp: number;
}

export default function useAutoLogout() {
  const { token, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const expiryTime = decoded.exp * 1000; // Convert to milliseconds
        const timeout = expiryTime - Date.now();

        if (timeout > 0) {
          // Set a timeout to clear auth and redirect when token expires
          const timer = setTimeout(() => {
            clearAuth();
            router.push("/authentication/login");
          }, timeout);
          return () => clearTimeout(timer); // Cleanup on unmount or token change
        } else {
          // Token is already expired
          clearAuth();
          router.push("/authentication/login");
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        clearAuth();
        router.push("/authentication/login");
      }
    }
  }, [token, clearAuth, router]);
}