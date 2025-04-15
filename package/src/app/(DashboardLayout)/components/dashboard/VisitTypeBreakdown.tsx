"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Props = {
  timeframe: "day" | "week" | "month";
  runs: any[];
};

const aggregateVisitTypeStats = (runs: any[]) => {
  const counts: Record<string, number> = {
    "Telepsychiatry": 0,
    "Face to Face": 0,
  };

  runs.forEach((run) => {
    const vt = run.selected_visit_type;
    if (vt === "Telepsychiatry" || vt === "Face to Face") {
      counts[vt]++;
    }
  });

  const total = counts["Telepsychiatry"] + counts["Face to Face"];

  return {
    telehealth: {
      label: "Telehealth",
      total: counts["Telepsychiatry"],
      percent: total > 0 ? (counts["Telepsychiatry"] / total) * 100 : 0,
    },
    faceToFace: {
      label: "Face-to-Face",
      total: counts["Face to Face"],
      percent: total > 0 ? (counts["Face to Face"] / total) * 100 : 0,
    },
  };
};

const VisitTypeBreakdown = ({ timeframe, runs }: Props) => {
  // 1. Calculate timeframe cutoff
  const now = new Date();
  let cutoff: Date;

  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // 2. Filter runs based on start_time
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  // 3. Aggregate stats
  const { telehealth, faceToFace } = aggregateVisitTypeStats(filteredRuns);

  return (
    <DashboardCard
      title="Visit Type Breakdown"
      subtitle={`Showing data for ${timeframe}`}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {telehealth.label}: {telehealth.total} ({telehealth.percent.toFixed(1)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={telehealth.percent}
            sx={{ height: 10, borderRadius: 5 }}
            color="primary"
          />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {faceToFace.label}: {faceToFace.total} ({faceToFace.percent.toFixed(1)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={faceToFace.percent}
            sx={{ height: 10, borderRadius: 5 }}
            color="secondary"
          />
        </Box>
      </Stack>
    </DashboardCard>
  );
};

export default VisitTypeBreakdown;
