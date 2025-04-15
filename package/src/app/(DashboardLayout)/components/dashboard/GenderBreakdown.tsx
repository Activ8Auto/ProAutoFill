"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Props = {
  timeframe: "day" | "week" | "month";
  runs: any[];
};

// Helper function to aggregate gender statistics from the run data
const aggregateGenderStats = (runs: any[]) => {
  const total = runs.length;
  const counts: Record<string, number> = {};

  runs.forEach((run) => {
    const gender = run.selected_gender;
    if (gender) {
      counts[gender] = (counts[gender] || 0) + 1;
    }
  });

  return Object.keys(counts).map((genderKey) => ({
    label: genderKey,
    total: counts[genderKey],
    percent: total ? Math.round((counts[genderKey] / total) * 100) : 0,
  }));
};

const GenderBreakdown = ({ timeframe, runs }: Props) => {
  // Calculate cutoff date
  const now = new Date();
  let cutoff: Date;

  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter runs based on start_time
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  const genderStats = aggregateGenderStats(filteredRuns);

  return (
    <DashboardCard title="Gender Breakdown" subtitle={`Showing data for ${timeframe}`}>
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
