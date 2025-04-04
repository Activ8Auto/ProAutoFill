"use client";
import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

type Run = {
  id: string | number;
  selected_age_range?: string;
};

type Props = {
  runs: Run[];
};

const AgeGroupBreakdown = ({ runs }: Props) => {
  // Aggregate runs by age group.
  const ageGroupCounts: Record<string, number> = {};
  runs.forEach((run) => {
    if (run.selected_age_range) {
      const group = run.selected_age_range;
      ageGroupCounts[group] = (ageGroupCounts[group] || 0) + 1;
    }
  });

  // Convert the aggregated data into an array for Recharts.
  const data = Object.entries(ageGroupCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Define colors for each slice.
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF6699", "#22C55E"];

  return (
    <DashboardCard title="Age Group Breakdown" subtitle="Based on recent runs">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
