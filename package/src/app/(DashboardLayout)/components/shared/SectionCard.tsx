// components/shared/SectionCard.tsx
"use client";
import React from "react";
import { Paper, Typography, Box } from "@mui/material";

type Props = {
  title: string;
  children: React.ReactNode;
};

const SectionCard = ({ title, children }: Props) => {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #f9f9f9, #ffffff)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid #e0e0e0",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
      >
        {title}
      </Typography>
      <Box>{children}</Box>
    </Paper>
  );
};

export default SectionCard;
