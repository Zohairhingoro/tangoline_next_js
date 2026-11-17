"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/services/admin-analytics-service";

/** Recharts equivalent of the original mixed bar/line traffic chart. */
export function TrafficRangeChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 6, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          stroke="#a1a1aa"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
        />
        <YAxis
          yAxisId="left"
          stroke="#a1a1aa"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          allowDecimals={false}
          domain={[0, "auto"]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#00d2d3"
          tick={{ fill: "#00d2d3", fontSize: 11 }}
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
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
        <Bar
          yAxisId="left"
          dataKey="sessions"
          name="Unique Sessions"
          fill="rgba(229, 9, 20, 0.75)"
          stroke="#e50914"
          strokeWidth={1}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="pageviews"
          name="Total Pageviews"
          stroke="#00d2d3"
          strokeWidth={2}
          dot={{ r: 2, fill: "#00d2d3" }}
          fill="none"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
