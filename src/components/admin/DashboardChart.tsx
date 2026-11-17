"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = { label: string; value: number };

/** Recharts equivalent of the original Chart.js "Unique Daily Visitors" line chart. */
export function DashboardChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e50914" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#e50914" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
        <YAxis
          stroke="#a1a1aa"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          allowDecimals={false}
          domain={[0, "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 8,
            color: "#fff",
          }}
          labelStyle={{ color: "#fff" }}
          cursor={{ stroke: "#3f3f46" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Unique Daily Visitors"
          stroke="#e50914"
          strokeWidth={2}
          fill="url(#visitorFill)"
          dot={{ fill: "#e50914", r: 4 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
