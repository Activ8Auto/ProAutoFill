"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Props = {
  timeframe: "day" | "week" | "month";
  runs: any[];
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

const DiagnosisBreakdown = ({ timeframe, runs }: Props) => {
  // 1. Calculate timeframe cutoff
  const now = new Date();
  let cutoff: Date;

  if (timeframe === "day") {
    cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeframe === "week") {
    cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // 2. Filter runs based on start_time
  const filteredRuns = runs.filter((run) => {
    if (!run.start_time) return false;
    return new Date(run.start_time) >= cutoff;
  });

  // 3. Aggregate diagnosis usage across filtered runs
  const aggregateDiagnosisData = (runs: any[]) => {
    const diagnosisMap: Record<string, number> = {};
    runs.forEach((run) => {
      if (Array.isArray(run.selected_diagnoses)) {
        run.selected_diagnoses.forEach((diag: { name: string }) => {
          const key = diag.name;
          diagnosisMap[key] = (diagnosisMap[key] || 0) + 1;
        });
      }
    });
    return Object.entries(diagnosisMap).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const data = aggregateDiagnosisData(filteredRuns);

  return (
    <DashboardCard
      title="Diagnosis Breakdown"
      subtitle={`Showing data for ${timeframe}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default DiagnosisBreakdown;
