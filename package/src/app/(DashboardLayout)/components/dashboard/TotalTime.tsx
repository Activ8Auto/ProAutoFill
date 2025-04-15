"use client";
import React from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Typography, Stack } from "@mui/material";

type Props = {
  timeframe: "day" | "week" | "month";
  runs: any[]; // Each run has start_time and chosen_minutes
};

const TotalTime = ({ timeframe, runs }: Props) => {
  // 1. Determine cutoff
  const now = new Date();
  let cutoff: Date;

  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  }

  // 2. Filter runs by timeframe
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  // 3. Sum the chosen_minutes for filtered runs
  const totalMinutes = filteredRuns.reduce((acc, run) => {
    return acc + (run.chosen_minutes || 0);
  }, 0);

  // 4. Convert total minutes -> hours & minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // 5. Display in a readable format (e.g., "3h 45m")
  const displayString = `${hours}h ${minutes}m`;

  return (
    <DashboardCard title="Total Time Logged" subtitle={`Showing data for ${timeframe}`}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h3">
          {displayString}{" "}
          <Typography variant="caption" color="textSecondary" component="span">
            (across {filteredRuns.length} runs)
          </Typography>
        </Typography>
      </Stack>
    </DashboardCard>
  );
};

export default TotalTime;
