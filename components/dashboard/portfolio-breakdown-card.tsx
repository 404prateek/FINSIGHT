"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"
import { TrendingUpIcon } from "lucide-react"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"

const COLORS = [
  "#3b82f6", // blue - Equity
  "#10b981", // green - Mutual Funds
  "#f59e0b", // amber - Crypto
  "#8b5cf6", // violet - Bonds
  "#ec4899", // pink - Other
]

type PortfolioData = {
  equity: number
  mutualFunds: number
  crypto: number
  bonds: number
  other: number
}

export function PortfolioBreakdownCard({ data }: { data: PortfolioData }) {
  const total = data.equity + data.mutualFunds + data.crypto + data.bonds + data.other

  const chartData = [
    { name: "Equity", value: data.equity, color: COLORS[0] },
    { name: "Mutual Funds", value: data.mutualFunds, color: COLORS[1] },
    { name: "Crypto", value: data.crypto, color: COLORS[2] },
    { name: "Bonds", value: data.bonds, color: COLORS[3] },
    { name: "Other", value: data.other, color: COLORS[4] },
  ].filter((d) => d.value > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="flex h-full flex-col rounded-2xl border-border bg-card p-4 shadow-premium transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Portfolio Distribution</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">₹{total.toLocaleString('en-IN')}</div>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TrendingUpIcon className="size-6" />
        </div>
      </div>

      {total <= 0 ? (
        <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
          No portfolio holdings yet.
        </div>
      ) : (
        <>
          <div className="h-[280px] w-full">
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
                    const pct = ((amount / total) * 100).toFixed(1)
                    return [`₹${amount.toLocaleString("en-IN")} (${pct}%)`, "Amount"]
                  }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => {
                    const item = chartData.find((d) => d.name === value)
                    const pct = item ? ((item.value / total) * 100).toFixed(1) : "0"
                    return `${value} (${pct}%)`
                  }}
                  wrapperStyle={{ paddingTop: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.slice(0, 4).map((item) => {
              const pct = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={item.name} className="rounded-xl border border-border/60 bg-background/40 p-2">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </div>
                  <div className="mt-1 text-sm font-semibold">₹{item.value.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground">{pct}%</div>
                </div>
              )
            })}
          </div>
        </>
      )}
      </Card>
    </motion.div>
  )
}
