// src/app/(DashboardLayout)/layout.tsx
"use client";

import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import Sidebar from "@/app/(DashboardLayout)/layout/sidebar/Sidebar";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AuthProvider } from "@/lib/auth-context";
import useAutoLogout from "@/app/hooks/useAutoLogout";
import { Toaster } from "react-hot-toast"; // Import Toaster

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLogout();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = (event: React.MouseEvent<HTMLElement>) => {
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <ThemeProvider theme={baselightTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <MainWrapper className="mainwrapper">
            {/* Sidebar */}
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              isMobileSidebarOpen={isMobileSidebarOpen}
              onSidebarClose={() => setMobileSidebarOpen(false)}
            />
            {/* Main Content */}
            <PageWrapper className="page-wrapper">
              {/* Header */}
              <Header toggleMobileSidebar={toggleMobileSidebar} />
              {/* Page Content */}
              <Container
                sx={{
                  paddingTop: "20px",
                  maxWidth: "1200px",
                  flexGrow: 1,
                }}
              >
                <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
              </Container>
            </PageWrapper>
            {/* Add Toaster here */}
            <Toaster
  position="top-right"
  containerStyle={{ zIndex: 9999 }}
  reverseOrder={false}
  toastOptions={{
    duration: 2000, // Default duration
    style: {
      background: "#363636",
      color: "#fff",
    },
    success: {
      duration: 3000, // 3 seconds for success messages
      iconTheme: {
        primary: "green",
        secondary: "black",
      },
    },
  }}
/>
          </MainWrapper>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}