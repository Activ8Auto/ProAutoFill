"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Props = {
  runs: any[];
};

// Helper function to aggregate gender statistics from the run data.
const aggregateGenderStats = (runs: any[]) => {
  const total = runs.length;
  const counts: Record<string, number> = {};

  // Count each occurrence of selected_gender
  runs.forEach((run) => {
    const gender = run.selected_gender;
    if (gender) {
      counts[gender] = (counts[gender] || 0) + 1;
    }
  });

  // Convert the counts into an array of objects with label, total, and percent.
  return Object.keys(counts).map((genderKey) => {
    return {
      label: genderKey, // Optionally, map to a display name here if needed.
      total: counts[genderKey],
      percent: total ? Math.round((counts[genderKey] / total) * 100) : 0,
    };
  });
};

const GenderBreakdown = ({ runs }: Props) => {
  const genderStats = aggregateGenderStats(runs);

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
