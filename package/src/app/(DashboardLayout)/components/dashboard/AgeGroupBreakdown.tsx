"use client";
import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

// Dummy data
const data = [
  { name: "18–25", value: 8 },
  { name: "26–35", value: 22 },
  { name: "36–45", value: 15 },
  { name: "46–55", value: 12 },
  { name: "56–65", value: 18 },
  { name: "66–75", value: 10 },
  { name: "76+", value: 5 },
];

// Optional: Define some colors for slices
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF6699", "#22C55E"];

const AgeGroupBreakdown = () => {
  return (
    <DashboardCard title="Age Group Breakdown" subtitle="Based on recent runs">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
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
