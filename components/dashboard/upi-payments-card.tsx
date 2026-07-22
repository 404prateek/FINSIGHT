"use client"

import { ArrowDownIcon, ArrowUpIcon, SmartphoneIcon } from "lucide-react"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"

type UPIPayment = {
  id: string
  type: "received" | "sent"
  amount: number
  from: string
  note?: string
  date: string
}

type UPIPaymentsData = {
  received: number
  sent: number
  recent: UPIPayment[]
}

export function UPIPaymentsCard({ data }: { data: UPIPaymentsData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="flex h-full flex-col rounded-2xl border-border bg-card p-4 shadow-premium transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">UPI & Payments</div>
          <div className="mt-1 text-sm font-medium">This month</div>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SmartphoneIcon className="size-6" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
        >
          <div className="flex items-center gap-2">
            <ArrowDownIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs text-muted-foreground">Received</div>
          </div>
          <div className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            +₹{data.received.toLocaleString('en-IN')}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
        >
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="size-4 text-rose-600 dark:text-rose-400" />
            <div className="text-xs text-muted-foreground">Sent</div>
          </div>
          <div className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-400">
            -₹{data.sent.toLocaleString('en-IN')}
          </div>
        </motion.div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Recent transactions</div>
        {data.recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
            No payments yet — add a transaction to see activity here.
          </div>
        ) : null}
        {data.recent.slice(0, 5).map((payment, idx) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-8 items-center justify-center rounded-xl ${
                  payment.type === "received"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {payment.type === "received" ? (
                  <ArrowDownIcon className="size-4" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{payment.from}</div>
                {payment.note && <div className="text-xs text-muted-foreground">{payment.note}</div>}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-semibold ${
                  payment.type === "received"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {payment.type === "received" ? "+" : "-"}₹{payment.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground">{payment.date}</div>
            </div>
          </motion.div>
        ))}
      </div>
      </Card>
    </motion.div>
  )
}
