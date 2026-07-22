"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function InvestmentGrowthLine({
  data,
}: {
  data: Array<{ month: string; value: number }>
}) {
  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center text-sm text-muted-foreground">
        No investments yet — portfolio growth appears after you add holdings.
      </div>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 12 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
            domain={["dataMin - 10000", "dataMax + 10000"]}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 16,
              padding: "12px",
              color: "#ffffff",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number | string | undefined) => [
              `₹${Math.round(Number(value ?? 0)).toLocaleString('en-IN')}`,
              "Portfolio Value",
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

