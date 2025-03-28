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

// Dummy data
const data = [
  { name: "White", value: 40 },
  { name: "Black or African American", value: 20 },
  { name: "Asian", value: 15 },
  { name: "Hispanic or Latino", value: 10 },
  { name: "Native American", value: 5 },
  { name: "Pacific Islander", value: 3 },
  { name: "Other", value: 7 },
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
];

const RaceBreakdown = () => {
  return (
    <DashboardCard title="Race Breakdown" subtitle="Percentage of Races Selected">
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
