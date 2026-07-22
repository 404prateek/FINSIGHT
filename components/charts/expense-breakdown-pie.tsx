"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"

const COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
]

export function ExpenseBreakdownPie({
  data,
}: {
  data: Array<{ category: string; amount: number }>
}) {
  const chartData = React.useMemo(() => data.filter((d) => d.amount > 0).slice(0, 8), [data])
  const total = chartData.reduce((sum, d) => sum + d.amount, 0)

  if (!chartData.length) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center text-sm text-muted-foreground">
        No spending categories yet — log expenses to see the breakdown.
      </div>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 16,
              padding: "12px",
              color: "#ffffff",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number | string | undefined) => {
              const amount = Math.round(Number(value ?? 0))
              const percent = Math.round((amount / total) * 100)
              return [`₹${amount.toLocaleString('en-IN')} (${percent}%)`, "Amount"]
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value) => value}
            wrapperStyle={{ paddingTop: "12px" }}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            label={false}
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

