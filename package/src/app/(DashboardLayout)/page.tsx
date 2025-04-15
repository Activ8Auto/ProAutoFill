"use client";

import { Grid, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useState, useEffect } from "react";
import RaceBreakdown from "@/app/(DashboardLayout)/components/dashboard/RaceBreakdown";
import RecentRuns from "@/app/(DashboardLayout)/components/dashboard/RecentRuns";
import AgeGroupBreakdown from "@/app/(DashboardLayout)/components/dashboard/AgeGroupBreakdown";
import DurationBreakdown from "./components/dashboard/DurationBreakdown";
import GenderBreakdown from "./components/dashboard/GenderBreakdown";
import OverviewWidgets from "./components/dashboard/TotalRuns";
import DiagnosisBreakdownChart from "@/app/(DashboardLayout)/components/dashboard/DiagnosisBreakdownChart";
import TimeFrameSelector from "@/app/(DashboardLayout)/components/shared/TimeFrameSelector";
import RemainingRunsBanner from "@/app/(DashboardLayout)/components/dashboard/RemainingRunsBanner";
import { useAuthStore } from "@/store/authStore";
import { getAutomationRuns } from "@/lib/api";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  const [remainingRuns, setRemainingRuns] = useState<number | null>(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) router.push("/authentication/login");
  }, [token, router]);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/runs/remaining`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.is_paid_user && data.remaining_runs !== null) {
            setRemainingRuns(data.remaining_runs);
          }
        })
        .catch((err) => console.error("Error fetching remaining runs", err));
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getAutomationRuns(token)
        .then((data) => {
          setRuns(data.runs);
          setLoading(false);
        })
        .catch((err) => {
          if (err.status === 401) router.push("/authentication/login");
          else {
            console.error("Error fetching automation runs:", err);
            setError(err);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
  }, [token, router]);

  if (!token) return null;
  if (loading) return <div>Loading automation run data...</div>;
  if (error) return <div>Error loading automation run data.</div>;

  return (
    <PageContainer
      title="Dashboard"
      description="Dashboard overview of automation runs"
    >
      <Box>
        <TimeFrameSelector value={timeframe} onChange={setTimeframe} />
        {remainingRuns !== null && (
          <RemainingRunsBanner remainingRuns={remainingRuns} />
        )}
        <Grid container spacing={3}>
          {/* Top Row */}
          <Grid item xs={12} lg={8}>
            <OverviewWidgets timeframe={timeframe} runs={runs} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <DurationBreakdown runs={runs} />
          </Grid>

          {/* Middle Row */}
          <Grid item xs={12} lg={4}>
            <RecentRuns runs={runs} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <GenderBreakdown runs={runs} />
          </Grid>

          {/* Next Row */}
          <Grid item xs={12} lg={6}>
            <AgeGroupBreakdown runs={runs} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <RaceBreakdown runs={runs} />
          </Grid>

          {/* Bottom Row Full Width */}
          <Grid item xs={12}>
            <DiagnosisBreakdownChart runs={runs} />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
