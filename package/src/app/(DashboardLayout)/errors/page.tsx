"use client";
import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { getErrorLogs, clearErrorLogs } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const ErrorLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const fetchErrorLogs = async () => {
    if (!token) {
      setError("User is not authenticated.");
      return;
    }
    try {
      const data = await getErrorLogs(token);
      const failedLogs = data.filter((log: any) => log.status === "failed");
      setLogs(failedLogs);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, [token]);

  const handleClearErrors = async () => {
    if (!token) {
      setError("User is not authenticated.");
      return;
    }
    try {
      await clearErrorLogs(token);
      setLogs([]); // Clear the logs in the UI immediately
      setError(null);
      // Optionally refetch to confirm (uncomment if needed):
      // await fetchErrorLogs();
    } catch (err) {
      setError(`Failed to clear errors: ${(err as Error).message}`);
    }
  };

  return (
    <PageContainer
      title="Error Logs"
      description="Review your automation run errors"
    >
      <DashboardCard title="Error Logs">
        <Box>
          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}
          <Box mb={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClearErrors}
              disabled={logs.length === 0 || !token}
            >
              Clear Errors
            </Button>
          </Box>
          {logs.length > 0 ? (
            logs
              .map((log) => {
                const details = log.details || {};
                const isUserFixable = details.user_fixable === true;

                // Only display logs with user-fixable errors
                if (!isUserFixable) {
                  console.log(
                    `System error (hidden from user): ${details.error}`
                  );
                  return null; // Skip rendering system errors
                }

                return (
                  <Box
                    key={log.id}
                    mb={3}
                    p={2}
                    border={1}
                    borderRadius={2}
                    borderColor="grey.300"
                  >
                    <Typography variant="body1">
                      <strong>Time:</strong>{" "}
                      {new Date(log.start_time).toLocaleString()} -{" "}
                      {log.end_time
                        ? new Date(log.end_time).toLocaleString()
                        : "In Progress"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {log.status}
                    </Typography>
                    <Typography variant="body2" color="error">
                      <strong>Error:</strong>{" "}
                      {details.error || "No details available"}
                    </Typography>
                  </Box>
                );
              })
              .filter(Boolean) // Remove null entries from skipped system errors
          ) : (
            <Typography>No user-fixable error logs found.</Typography>
          )}
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default ErrorLogsPage;
