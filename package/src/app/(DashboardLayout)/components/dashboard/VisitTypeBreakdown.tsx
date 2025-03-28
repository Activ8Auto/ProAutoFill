// src/app/(DashboardLayout)/components/dashboard/VisitTypeBreakdown.tsx

import React from "react";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

const VisitTypeBreakdown = () => {
  // Dummy data
  const totalVisits = 120;
  const telehealth = 75;
  const faceToFace = 45;

  const telehealthPercent = (telehealth / totalVisits) * 100;
  const faceToFacePercent = (faceToFace / totalVisits) * 100;

  return (
    <DashboardCard title="Visit Type Breakdown" subtitle="Distribution of visit methods">
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Telehealth: {telehealth} ({telehealthPercent.toFixed(1)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={telehealthPercent}
            sx={{ height: 10, borderRadius: 5 }}
            color="primary"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Face-to-Face: {faceToFace} ({faceToFacePercent.toFixed(1)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={faceToFacePercent}
            sx={{ height: 10, borderRadius: 5 }}
            color="secondary"
          />
        </Box>
      </Stack>
    </DashboardCard>
  );
};

export default VisitTypeBreakdown;
