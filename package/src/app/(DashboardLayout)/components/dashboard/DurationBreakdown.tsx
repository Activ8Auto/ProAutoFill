// DurationBreakdown.tsx
"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

const durationStats = [
  { label: "30 Minutes", percent: 65, total: 130 },
  { label: "1 Hour", percent: 35, total: 70 },
];

const DurationBreakdown = () => {
  return (
    <DashboardCard title="Duration Breakdown" subtitle="Selected Timeframes">
      <Stack spacing={2}>
        {durationStats.map((stat) => (
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

export default DurationBreakdown;