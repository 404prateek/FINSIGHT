"use client"

import { Building2Icon, CreditCardIcon, WalletIcon } from "lucide-react"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AssetsLiabilitiesData = {
  totalAssets: number
  cashBalance: number
  investments: number
  creditLimit: number
  creditBalance: number
  netWorth: number
}

export function AssetsLiabilitiesCard({ data }: { data: AssetsLiabilitiesData }) {
  const creditUtil = data.creditLimit > 0 ? (data.creditBalance / data.creditLimit) * 100 : 0
  const debt = data.creditBalance

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="flex h-full flex-col rounded-2xl border-border bg-card p-4 shadow-premium transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Total Assets & Liabilities</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            ₹{data.totalAssets.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2Icon className="size-6" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Assets */}
        <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2">
            <WalletIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs font-medium text-muted-foreground">Assets</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Cash</div>
              <div className="text-sm font-semibold">₹{data.cashBalance.toLocaleString('en-IN')}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Investments</div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{data.investments.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="size-4 text-rose-600 dark:text-rose-400" />
            <div className="text-xs font-medium text-muted-foreground">Liabilities</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Credit Used</div>
              <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                ₹{debt.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Utilization</div>
              <div
                className={cn(
                  "text-sm font-semibold",
                  creditUtil >= 70 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                )}
              >
                {creditUtil.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
        <div className="text-xs font-medium text-muted-foreground">Net Worth</div>
        <div
          className={cn(
            "text-lg font-semibold",
            data.netWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}
        >
          ₹{data.netWorth.toLocaleString('en-IN')}
        </div>
      </div>
      </Card>
    </motion.div>
  )
}
