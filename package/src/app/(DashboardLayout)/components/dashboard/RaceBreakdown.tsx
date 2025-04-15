"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Run = {
  id: string | number;
  start_time?: string;
  selected_race?: string;
};

type Props = {
  timeframe: "day" | "week" | "month";
  runs: Run[];
};

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
];

// Helper function to aggregate race counts from runs data.
const aggregateRaceData = (runs: Run[]) => {
  const counts: Record<string, number> = {};
  runs.forEach((run) => {
    const race = run.selected_race;
    if (race) {
      counts[race] = (counts[race] || 0) + 1;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const RaceBreakdown = ({ timeframe, runs }: Props) => {
  // 1. Determine cutoff date based on timeframe
  const now = new Date();
  let cutoff: Date;

  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // 2. Filter runs by start_time
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  // 3. Aggregate filtered data
  const data = aggregateRaceData(filteredRuns);

  return (
    <DashboardCard
      title="Race Breakdown"
      subtitle={`Showing data for ${timeframe}`}
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default RaceBreakdown;
