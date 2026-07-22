"use client"

import { ArrowDownIcon, ArrowUpIcon, HeartPulseIcon, WalletIcon } from "lucide-react"
import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function KpiCard({
  title,
  value,
  icon,
  hint,
  className,
  index,
}: {
  title: string
  value: string
  icon: ReactNode
  hint?: string
  className?: string
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full rounded-2xl border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-md",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-muted-foreground">{title}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
            {hint ? (
              <div className="mt-1 text-xs text-muted-foreground line-clamp-1">{hint}</div>
            ) : null}
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function KpiCards({
  healthScore,
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
}: {
  healthScore: number
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Financial Health"
        value={`${healthScore}/100`}
        hint={healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs attention"}
        icon={<HeartPulseIcon className="size-5" />}
        className="h-full"
        index={0}
      />
      <KpiCard
        title="Total Balance"
        value={`₹${totalBalance.toLocaleString("en-IN")}`}
        hint="Cash + net monthly flow"
        icon={<WalletIcon className="size-5" />}
        className="h-full"
        index={1}
      />
      <KpiCard
        title="Monthly Income"
        value={`₹${monthlyIncome.toLocaleString("en-IN")}`}
        hint="This month"
        icon={<ArrowUpIcon className="size-5" />}
        className="h-full"
        index={2}
      />
      <KpiCard
        title="Monthly Expenses"
        value={`₹${monthlyExpenses.toLocaleString("en-IN")}`}
        hint="This month"
        icon={<ArrowDownIcon className="size-5" />}
        className="h-full"
        index={3}
      />
    </div>
  )
}
