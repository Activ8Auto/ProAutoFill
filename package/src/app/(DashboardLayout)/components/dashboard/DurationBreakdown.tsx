"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Props = {
  runs: any[];
};

const aggregateDurationStats = (runs: any[]) => {
  const counts: Record<string, number> = {
    "30 Minutes": 0,
    "1 Hour": 0,
  };

  runs.forEach((run) => {
    // Check the chosen_minutes property (assumed to be a number: 30 or 60)
    if (run.chosen_minutes === 30) {
      counts["30 Minutes"] += 1;
    } else if (run.chosen_minutes === 60) {
      counts["1 Hour"] += 1;
    }
  });

  const total = counts["30 Minutes"] + counts["1 Hour"];
  return [
    {
      label: "30 Minutes",
      total: counts["30 Minutes"],
      percent: total > 0 ? Math.round((counts["30 Minutes"] / total) * 100) : 0,
    },
    {
      label: "1 Hour",
      total: counts["1 Hour"],
      percent: total > 0 ? Math.round((counts["1 Hour"] / total) * 100) : 0,
    },
  ];
};

const DurationBreakdown = ({ runs }: Props) => {
  const durationStats = aggregateDurationStats(runs);

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
