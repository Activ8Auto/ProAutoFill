"use client";
import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Run = {
  id: string;
  start_time?: string;          // for timeframe filtering
  selected_age_range?: string;  // for chart grouping
};

type Props = {
  timeframe: "day" | "week" | "month";
  runs: Run[];
};

const AgeGroupBreakdown = ({ timeframe, runs }: Props) => {
  // 1. Calculate cutoff for the chosen timeframe
  const now = new Date();
  let cutoff: Date;

  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days (roughly)
  }

  // 2. Filter runs within the timeframe
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  // 3. Aggregate runs by age group
  const ageGroupCounts: Record<string, number> = {};
  filteredRuns.forEach((run) => {
    if (run.selected_age_range) {
      const group = run.selected_age_range;
      ageGroupCounts[group] = (ageGroupCounts[group] || 0) + 1;
    }
  });

  // 4. Convert the aggregated data into an array for Recharts
  const data = Object.entries(ageGroupCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 5. Define colors for each slice
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF6699",
    "#22C55E",
  ];

  return (
    <DashboardCard
      title="Age Group Breakdown"
      subtitle={`Showing data for ${timeframe}`}
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default AgeGroupBreakdown;
