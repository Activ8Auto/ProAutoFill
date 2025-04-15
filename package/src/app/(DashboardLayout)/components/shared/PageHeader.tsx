"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";

type Props = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
};

const PageHeader = ({ title, subtitle, backgroundImage }: Props) => {
  return (
    <Box
      sx={{
        background: backgroundImage
          ? `url(${backgroundImage}) center/cover no-repeat`
          : "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
        color: "black",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        position: "relative",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, textShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)" }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="h6" component="p" sx={{ textShadow: "0px 3px 4px rgba(0,0,0,0.3)" }}>
            {subtitle}
          </Typography>
        )}
      </Container>
      {/* Decorative underline */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "4px",
          background: "rgba(255, 255, 255, 0.7)",
          borderRadius: "2px",
        }}
      />
    </Box>
  );
};

export default PageHeader;
