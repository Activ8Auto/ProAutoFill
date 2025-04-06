"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthRegisterProps {
  subtext?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const AuthRegister = ({ subtext, subtitle }: AuthRegisterProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ New field
  const [error, setError] = useState("");
  const router = useRouter();
  
  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // ✅ Check if passwords match before sending request
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        console.log("failed1")
      }
      
      const data = await response.json();
   toast.success("Registration successful!");
   console.log("Success")
    sessionStorage.setItem("justRegistered", "true");

   
    setTimeout(() => {
      router.push("/authentication/login");
    }, 1500)
    } catch (error) {
      console.error("Failed to register:", error);
      setError("Something went wrong during registration.");
    }
  }

  return (
    <Box component="form" onSubmit={handleRegister}>
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
      <TextField
        label="Confirm Password"
        type="password"
        fullWidth
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.target.value)
        }
        sx={{ mb: 2 }}
      />
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" fullWidth>
        Register
      </Button>
      {subtitle}
    </Box>
  );
};

export default AuthRegister;
