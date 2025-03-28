import React from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Typography, Stack } from "@mui/material";

type Props = {
  timeframe: "day" | "week" | "month";
};

const TotalRuns = ({ timeframe }: Props) => {
  // Example dummy data
  const runCounts = {
    day: 5,
    week: 42,
    month: 172,
  };

  return (
    <DashboardCard
      title="Total Runs"
      subtitle={`Showing data for ${timeframe}`}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h3">
          {runCounts[timeframe]}{" "}
          <Typography variant="caption" color="textSecondary">
            {timeframe}
          </Typography>
        </Typography>
      </Stack>
    </DashboardCard>
  );
};

export default TotalRuns;
