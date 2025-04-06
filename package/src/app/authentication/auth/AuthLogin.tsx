"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAuthStore } from "@/store/authStore"; // Import Zustand store
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface AuthLoginProps {
  subtext?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const AuthLogin = ({ subtext, subtitle }: AuthLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setAuth } = useAuthStore(); // Use setAuth from Zustand store
  const router = useRouter();

  const handleLogin = async () => {
    console.log("Login clicked");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${apiBase}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!res.ok) {
        const errorData = await res.text();  // Use text() first to debug raw response
        console.error("Raw error response:", errorData);
        throw new Error(`Login failed: ${errorData}`);
      }

      const data = await res.json();
      console.log("Login response:", data);

      const decoded = jwtDecode<{ sub: string }>(data.access_token);
      console.log("Decoded token:", decoded);

      setAuth(data.access_token, decoded.sub);
      console.log(
        "Token set in store, checking localStorage:",
        localStorage.getItem("token")
      );

      router.push("/"); // Redirect to home page
    } catch (err) {
      setError("Invalid email or password");
      console.error("Login error:", err);
    }
  };

  return (
    <Box>
      {subtext}
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
        sx={{ mb: 2 }}
      />
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Button variant="contained" fullWidth onClick={handleLogin}>
        Login
      </Button>
      {subtitle}
    </Box>
  );
};

export default AuthLogin;