"use client";
import React from "react";
import { Alert, Box, Typography } from "@mui/material";

type Props = {
  remainingRuns: number;
};

const RemainingRunsBanner = ({ remainingRuns }: Props) => {
  return (
    <Box mb={2}>
      <Alert severity="warning">
        <Typography variant="body1">
          Free Tier: You have <strong>{remainingRuns}</strong> automation runs
          remaining.
        </Typography>
      </Alert>
    </Box>
  );
};

export default RemainingRunsBanner;
