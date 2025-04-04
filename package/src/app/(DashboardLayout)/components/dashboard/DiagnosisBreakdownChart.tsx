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
  runs: any[];
};

const DiagnosisBreakdown = ({ runs }: Props) => {
  // Aggregate diagnosis usage across all runs.
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
    // Convert to array for Recharts.
    return Object.entries(diagnosisMap).map(([name, count]) => ({
      name,
      value: count,
    }));
  };

  const data = aggregateDiagnosisData(runs);

  // Colors for the pie slices.
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#8dd1e1"];

  return (
    <DashboardCard title="Diagnosis Breakdown" subtitle="Overall Diagnosis Usage">
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
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default DiagnosisBreakdown;
