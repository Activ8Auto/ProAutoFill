"use client";
import React from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Typography, Stack } from "@mui/material";

type Props = {
  timeframe: "day" | "week" | "month";
  runs: any[];
};

const TotalRuns = ({ timeframe, runs }: Props) => {
  const now = new Date();
  let cutoff: Date;

  // Determine the cutoff date based on the selected timeframe
  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Roughly last 30 days (1 month)
  }

  // Filter runs that have a start_time within the selected timeframe
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  const totalRunsCount = filteredRuns.length;

  return (
    <DashboardCard
      title="Total Runs"
      subtitle={`Showing data for ${timeframe}`}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h3">
          {totalRunsCount}{" "}
          <Typography variant="caption" color="textSecondary" component="span">
            {timeframe}
          </Typography>
        </Typography>
      </Stack>
    </DashboardCard>
  );
};

export default TotalRuns;
