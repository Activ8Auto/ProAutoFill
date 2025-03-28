"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

// Dummy data
const diagnosisData = [
  { diagnosis: "MDD", Female: 12, Male: 8, Trans: 2 },
  { diagnosis: "Anxiety", Female: 15, Male: 10, Trans: 1 },
  { diagnosis: "Schizophrenia", Female: 4, Male: 6, Trans: 1 },
  { diagnosis: "ADHD", Female: 9, Male: 14, Trans: 0 },
  { diagnosis: "PTSD", Female: 13, Male: 7, Trans: 3 },
];

const DiagnosisBreakdown = () => {
  return (
    <DashboardCard title="Diagnosis Breakdown" subtitle="Stacked by Gender">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={diagnosisData}
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis dataKey="diagnosis" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Female" stackId="a" fill="#8884d8" />
          <Bar dataKey="Male" stackId="a" fill="#82ca9d" />
          <Bar dataKey="Trans" stackId="a" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default DiagnosisBreakdown;
