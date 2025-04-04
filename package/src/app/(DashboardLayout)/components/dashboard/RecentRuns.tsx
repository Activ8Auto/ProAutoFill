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

type Run = {
  id: string | number;
  start_time: string;      // ISO string representing when the run started
  chosen_minutes: number;  // e.g., 30 or 60
};

type Props = {
  runs: Run[];
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const getDurationString = (minutes: number) => {
  if (minutes === 60) return "1 hour";
  if (minutes === 30) return "30 minutes";
  return `${minutes} minutes`;
};

const RecentRuns = ({ runs }: Props) => {
  // Assume runs are already sorted by start_time descending; if not, sort them:
  const sortedRuns = [...runs].sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
  // Take the 5 most recent runs
  const recentRuns = sortedRuns.slice(0, 5);

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
                  <Typography variant="subtitle1" fontWeight={600} component="div">
                    Run {index + 1}
                  </Typography>
                }
                secondary={
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    component="div"
                  >
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary" component="span">
                      {formatDate(run.start_time)}
                    </Typography>
                  </Stack>
                }
                primaryTypographyProps={{ component: "div" }}
                secondaryTypographyProps={{ component: "div" }}
              />
              <Typography variant="body2" fontWeight={500} component="div">
                {getDurationString(run.chosen_minutes)}
              </Typography>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </DashboardCard>
  );
};

export default RecentRuns;
