"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function IncomeExpenseBar({
  data,
}: {
  data: Array<{ day: string; income: number; expense: number }>
}) {
  const chartData = data.slice(-14)
  const hasActivity = chartData.some((d) => d.income > 0 || d.expense > 0)

  if (!hasActivity) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center text-sm text-muted-foreground">
        No income or expenses yet — add a transaction to see activity.
      </div>
    )
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 8, right: 8, top: 16 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
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
            formatter={(value: number | string | undefined, name: string | undefined) => [
              `₹${Math.round(Number(value ?? 0)).toLocaleString('en-IN')}`,
              name === "income" ? "Income" : "Expense",
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "12px" }}
            iconType="square"
            formatter={(value) => value === "income" ? "Income" : "Expenses"}
          />
          <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

