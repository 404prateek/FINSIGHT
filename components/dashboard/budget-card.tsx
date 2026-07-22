"use client"

import * as React from "react"
import { PiggyBankIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function BudgetCard({
  month,
  totalBudget,
  remaining,
  onUpdated,
}: {
  month: string
  totalBudget: number
  remaining: number
  onUpdated: () => void
}) {
  const [value, setValue] = React.useState(String(totalBudget))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => setValue(String(totalBudget)), [totalBudget])

  async function save() {
    const next = Number(value)
    if (!Number.isFinite(next) || next < 0) {
      toast.error("Budget must be a valid number")
      return
    }
    setSaving(true)
    const res = await fetch("/api/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, totalBudget: next, categoryBudgets: {} }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || "Could not update budget")
      return
    }
    toast.success("Budget updated")
    onUpdated()
  }

  const pct = totalBudget > 0 ? Math.max(0, Math.min(100, ((totalBudget - remaining) / totalBudget) * 100)) : 0

  return (
    <Card className="flex h-full flex-col rounded-2xl border-border bg-card p-4 shadow-premium sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PiggyBankIcon className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Monthly Budget</div>
            <div className="text-xs text-muted-foreground">{month}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Remaining</div>
          <div className={remaining < 0 ? "text-sm font-semibold text-destructive" : "text-sm font-semibold"}>
            ₹{Math.round(remaining).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={remaining < 0 ? "h-full bg-destructive" : "h-full bg-primary"}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Spend: {Math.round(pct)}% of ₹{Math.round(totalBudget).toLocaleString('en-IN')}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          className="h-10 rounded-2xl"
        />
        <Button className="h-10 rounded-2xl" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Set"}
        </Button>
      </div>
    </Card>
  )
}

