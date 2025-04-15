"use client";

import { Grid, Box, Typography } from "@mui/material";
import LoadingSpinner from "@/app/(DashboardLayout)/loading"
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useState, useEffect } from "react";
import TimeFrameSelector from "@/app/(DashboardLayout)/components/shared/TimeFrameSelector";
import RemainingRunsBanner from "@/app/(DashboardLayout)/components/dashboard/RemainingRunsBanner";
import SectionCard from "@/app/(DashboardLayout)/components/shared/SectionCard";
import TotalRuns from "@/app/(DashboardLayout)/components/dashboard/TotalRuns";
import TotalTime from "@/app/(DashboardLayout)/components/dashboard/TotalTime";
import GenderBreakdown from "@/app/(DashboardLayout)/components/dashboard/GenderBreakdown";
import RaceBreakdown from "@/app/(DashboardLayout)/components/dashboard/RaceBreakdown";
import AgeGroupBreakdown from "@/app/(DashboardLayout)/components/dashboard/AgeGroupBreakdown";
import DurationBreakdown from "@/app/(DashboardLayout)/components/dashboard/DurationBreakdown";
// import VisitTypeBreakdown from "@/app/(DashboardLayout)/components/dashboard/VisitTypeBreakdown";
import RecentRuns from "@/app/(DashboardLayout)/components/dashboard/RecentRuns";
import DiagnosisBreakdownChart from "@/app/(DashboardLayout)/components/dashboard/DiagnosisBreakdownChart";

import { useAuthStore } from "@/store/authStore";
import { getAutomationRuns } from "@/lib/api";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  const [remainingRuns, setRemainingRuns] = useState<number | null>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { token } = useAuthStore();
  
  useEffect(() => {
    // Redirect if no token
    if (!token) {
      router.push("/authentication/login");
    }
  }, [token, router]);

  useEffect(() => {
    // Fetch remaining runs if user is not paid
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
    // Fetch automation runs
    if (token) {
      getAutomationRuns(token)
        .then((data) => {
          setRuns(data.runs);
          setLoading(false);
        })
        .catch((err) => {
          if (err.status === 401) {
            // Token expired or invalid
            router.push("/authentication/login");
          } else {
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
  if (loading) return <LoadingSpinner />
  if (error) return <div>Error loading automation run data.</div>;

  return (
    <PageContainer
      title="Dashboard"
      description="Dashboard overview of automation runs"
    >
      <PageHeader
  title="Dashboard"
  subtitle="Overview of your automation performance"
  backgroundImage="https://source.unsplash.com/random/1600x900?abstract" // Optional
/>
      <Box>
        {/* Timeframe & Banner */}
        <TimeFrameSelector value={timeframe} onChange={setTimeframe} />
        {remainingRuns !== null && (
          <RemainingRunsBanner remainingRuns={remainingRuns} />
        )}

        {/* Overview Section */}
        <SectionCard title="Overview">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TotalRuns timeframe={timeframe} runs={runs} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TotalTime timeframe={timeframe} runs={runs} />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Breakdowns Section */}
        <SectionCard title="Key Metrics">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <GenderBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <DurationBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            
            {/* <Grid item xs={12} md={6} lg={4}>
              <VisitTypeBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            */}
            
          </Grid>
          </SectionCard>
          <SectionCard title="Key Charts">
          <Grid container spacing={6}>
          <Grid item xs={12} md={12} lg={6}>
              <AgeGroupBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            <Grid item xs={12} md={12} lg={6}>
              <RaceBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
            <DiagnosisBreakdownChart runs={runs} timeframe={timeframe} />
            </Grid>
            </Grid>
          </SectionCard>

        {/* Recent Runs Section */}
        <SectionCard title="Recent Runs">
          <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
              <RecentRuns runs={runs} />
            </Grid>
          </Grid>
          </SectionCard>

        
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
