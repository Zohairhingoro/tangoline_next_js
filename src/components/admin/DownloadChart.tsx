"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DownloadChartPoint } from "@/services/admin-analytics-service";

/** Recharts equivalent of the original fixed 14-day cyan bar chart. */
export function DownloadChart({ data }: { data: DownloadChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          stroke="#a1a1aa"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
        />
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
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar
          dataKey="value"
          name="Downloads"
          fill="rgba(0, 210, 211, 0.6)"
          stroke="#00d2d3"
          strokeWidth={1}
          radius={[5, 5, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
