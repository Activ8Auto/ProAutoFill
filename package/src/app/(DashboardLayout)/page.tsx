"use client";

import { Grid, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import LoadingSpinner from "@/app/(DashboardLayout)/loading";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
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
import AutomationJobs from "@/app/(DashboardLayout)/components/dashboard/AutomationJobs";

import { useAuthStore } from "@/store/authStore";
import { getAutomationRuns, getAutomationJobs } from "@/lib/api";

interface Run {
  id: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  chosen_minutes: number;
  selected_duration: string | null;
  selected_visit_type: string | null;
  details: any;
}

interface Job {
  job_id: string;
  profile_name: string;
  target_minutes: number;
  total_minutes: number;
  status: string;
  runs: Run[];
}

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  const [remainingRuns, setRemainingRuns] = useState<number | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push("/authentication/login");
    }
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
          if (err.status === 401) {
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

  const fetchJobs = async () => {
    try {
      const data = await getAutomationJobs(token);
      setJobs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching automation jobs:", err);
      setError("Failed to load automation jobs");
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs();
      const interval = setInterval(fetchJobs, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [token]);

  if (!token) return null;
  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading automation run data.</div>;

  return (
    <PageContainer title="Dashboard" description="Dashboard overview of automation runs">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your automation performance"
        backgroundImage="https://source.unsplash.com/random/1600x900?abstract"
      />

      <Box>
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

        {/* Automation Jobs Section */}
        <SectionCard title="Current Automation Jobs">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AutomationJobs jobs={jobs} />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Key Metrics */}
        <SectionCard title="Key Metrics">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <GenderBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            <Grid item xs={12} md={6}>
              <DurationBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <VisitTypeBreakdown runs={runs} timeframe={timeframe} />
            </Grid> */}
          </Grid>
        </SectionCard>

        {/* Charts */}
        <SectionCard title="Key Charts">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <AgeGroupBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RaceBreakdown runs={runs} timeframe={timeframe} />
            </Grid>
            <Grid item xs={12}>
              <DiagnosisBreakdownChart runs={runs} timeframe={timeframe} />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Recent Runs */}
        <SectionCard title="Recent Runs">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RecentRuns runs={runs} />
            </Grid>
          </Grid>
        </SectionCard>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
