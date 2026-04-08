"use client";

import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { year: "2016", customer: 1200, acquisition: 1800 },
  { year: "2017", customer: 1700, acquisition: 2100 },
  { year: "2018", customer: 2200, acquisition: 2800 },
  { year: "2019", customer: 2700, acquisition: 2400 },
  { year: "2020", customer: 1800, acquisition: 3700 },
  { year: "2021", customer: 2100, acquisition: 1800 },
  { year: "2022", customer: 900, acquisition: 3100 },
  { year: "2023", customer: 2700, acquisition: 4300 },
  { year: "2024", customer: 1800, acquisition: 2600 },
  { year: "2025", customer: 3200, acquisition: 2800 },
];

export function RevenueChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" />
          <Tooltip />

          <Bar dataKey="customer" fill="#fb923c" radius={[6, 6, 0, 0]} />

          <Bar dataKey="acquisition" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
