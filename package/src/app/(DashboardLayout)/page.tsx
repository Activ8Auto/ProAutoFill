'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState } from "react";
import RaceBreakdown from '@/app/(DashboardLayout)/components/dashboard/RaceBreakdown';
import RecentRuns from "@/app/(DashboardLayout)/components/dashboard/RecentRuns";
import AgeGroupBreakdown from "@/app/(DashboardLayout)/components/dashboard/AgeGroupBreakdown";

import DurationBreakdown from "./components/dashboard/DurationBreakdown";
import VisitTypeBreakdown from "./components/dashboard/VisitTypeBreakdown";
import GenderBreakdown from "./components/dashboard/GenderBreakdown";
import OverviewWidgets from "./components/dashboard/TotalRuns";
import DiagnosisBreakdownChart from '@/app/(DashboardLayout)/components/dashboard/DiagnosisBreakdownChart';
import RecentTransactions from '@/app/(DashboardLayout)/components/dashboard/RecentTransactions';
import ProductPerformance from '@/app/(DashboardLayout)/components/dashboard/ProductPerformance';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';
import MonthlyEarnings from '@/app/(DashboardLayout)/components/dashboard/MonthlyEarnings';
import TimeFrameSelector from "@/app/(DashboardLayout)/components/shared/TimeFrameSelector";

const Dashboard = () => {

    const [timeframe, setTimeframe] = useState("week");
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
      <TimeFrameSelector value={timeframe} onChange={setTimeframe} />
        <Grid container spacing={3}>
        
          <Grid item xs={12} lg={8}>
            <OverviewWidgets timeframe={timeframe}/>
            <GenderBreakdown />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DurationBreakdown />
                <VisitTypeBreakdown />
              </Grid>
              {/* <Grid item xs={12}>
                <AgeGroupBreakdown />
              </Grid> */}
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
            <RecentRuns />
          </Grid>
          <Grid item xs={12} lg={8}>
            <AgeGroupBreakdown /> 
            <RaceBreakdown />
          </Grid>
          <Grid item xs={12}>
          <DiagnosisBreakdownChart />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
