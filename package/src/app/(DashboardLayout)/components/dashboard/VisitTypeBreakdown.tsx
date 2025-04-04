"use client";
import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Props = {
  runs: any[];
};

const aggregateVisitTypeStats = (runs: any[]) => {
  // Initialize counts for both visit types
  const counts: Record<string, number> = {
    "Telepsychiatry": 0,
    "Face to Face": 0,
  };

  // Count occurrences for each visit type
  runs.forEach((run) => {
    const vt = run.selected_visit_type;
    if (vt === "Telepsychiatry" || vt === "Face to Face") {
      counts[vt] = (counts[vt] || 0) + 1;
    }
  });

  const total = counts["Telepsychiatry"] + counts["Face to Face"];
  console.log("Aggregate Visit Type Stats:", { counts, total });

  return {
    telehealth: {
      label: "Telehealth", // mapping Telepsychiatry to Telehealth display
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

const VisitTypeBreakdown = ({ runs }: Props) => {
  const { telehealth, faceToFace } = aggregateVisitTypeStats(runs);

  return (
    <DashboardCard title="Visit Type Breakdown" subtitle="Distribution of visit methods">
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
