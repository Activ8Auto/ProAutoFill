"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface AuthRegisterProps {
  subtext?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const AuthRegister = ({ subtext, subtitle }: AuthRegisterProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Only send email and password
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Registration successful:", data);
    } catch (error) {
      console.error("TypeError: Failed to fetch", error);
    }
  }

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
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <Button variant="contained" fullWidth onClick={handleRegister}>
        Register
      </Button>
      {subtitle}
    </Box>
  );
};

export default AuthRegister;
