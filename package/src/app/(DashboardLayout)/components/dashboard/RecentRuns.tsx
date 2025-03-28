"use client";

import React from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import {
  Stack,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const recentRuns = [
  { id: 1, date: "2025-03-28T10:45:00", duration: "1 hour" },
  { id: 2, date: "2025-03-27T16:30:00", duration: "30 minutes" },
  { id: 3, date: "2025-03-26T14:15:00", duration: "1 hour" },
  { id: 4, date: "2025-03-25T09:00:00", duration: "30 minutes" },
  { id: 5, date: "2025-03-24T18:10:00", duration: "1 hour" },
];

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const RecentRuns = () => {
  return (
    <DashboardCard title="Recent Runs" subtitle="Your last 5 automation runs">
      <List disablePadding>
        {recentRuns.map((run, index) => (
          <Box key={run.id}>
            <ListItem
              sx={{
                px: 0,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={600}>
                    Run {index + 1}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(run.date)}
                    </Typography>
                  </Stack>
                }
              />
              <Typography variant="body2" fontWeight={500}>
                {run.duration}
              </Typography>
            </ListItem>
            {index < recentRuns.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </DashboardCard>
  );
};

export default RecentRuns;
