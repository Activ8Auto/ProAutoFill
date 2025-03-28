"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

// Dummy data
const genderStats = [
  { label: "Girls", percent: 55, total: 110 },
  { label: "Boys", percent: 30, total: 60 },
  { label: "Trans Women", percent: 10, total: 20 },
  { label: "Trans Men", percent: 5, total: 10 },
];

const GenderBreakdown = () => {
  return (
    <DashboardCard title="Gender Breakdown" subtitle="Across All Form Runs">
      <Stack spacing={2}>
        {genderStats.map((stat) => (
          <Box key={stat.label}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={500}>
                {stat.label}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stat.percent}% ({stat.total})
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={stat.percent}
              sx={{ height: 6, borderRadius: 4, mt: 0.5 }}
            />
          </Box>
        ))}
      </Stack>
    </DashboardCard>
  );
};

export default GenderBreakdown;
