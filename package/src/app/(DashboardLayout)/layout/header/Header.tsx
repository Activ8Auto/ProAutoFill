// src/app/(DashboardLayout)/components/Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
import Profile from "./Profile"; // Ensure this component is hydration-safe
import { IconBellRinging, IconMenu } from "@tabler/icons-react";
import { useAuthStore } from "@/store/authStore"; // Adjust path as needed

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const { token, clearAuth } = useAuthStore();
  const isLoggedIn = Boolean(token);

  // Ensure auth-dependent UI renders only on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  const handleLogout = () => {
    clearAuth();
    // Optional: Redirect to login page after logout
    window.location.href = "/authentication/login";
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{ display: { lg: "none", xs: "inline" } }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          aria-label="show notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          {mounted && (
            <>
              {isLoggedIn ? (
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  disableElevation
                  color="primary"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  href="/authentication/login"
                  disableElevation
                  color="primary"
                >
                  Login
                </Button>
              )}
            </>
          )}
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  toggleMobileSidebar: PropTypes.func.isRequired,
};

export default Header;