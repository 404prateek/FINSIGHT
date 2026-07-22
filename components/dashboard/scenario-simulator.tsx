"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ScenarioResult = {
  baselineScore: number
  projectedScore: number
  delta: number
  monthlyFreed: number
  notes: string[]
}

export function ScenarioSimulator({ month }: { month: string }) {
  const [cutExpenseInr, setCut] = React.useState(3000)
  const [extraEmiInr, setEmi] = React.useState(5000)
  const [extraInvestInr, setInvest] = React.useState(0)
  const [result, setResult] = React.useState<ScenarioResult | null>(null)
  const [loading, setLoading] = React.useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/decisions?month=${month}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cutExpenseInr, extraEmiInr, extraInvestInr }),
      })
      if (!res.ok) throw new Error("Simulation failed")
      const data = (await res.json()) as ScenarioResult
      setResult(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Simulation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Simulate</p>
      <h2 className="mt-1 font-display text-xl tracking-tight">What-if impact</h2>
      <p className="mt-1 text-xs text-muted-foreground">Preview how moves change your health score before you act.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cut">Cut expenses (₹/mo)</Label>
          <Input
            id="cut"
            type="number"
            min={0}
            value={cutExpenseInr}
            onChange={(e) => setCut(Number(e.target.value) || 0)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emi">Extra debt pay (₹)</Label>
          <Input
            id="emi"
            type="number"
            min={0}
            value={extraEmiInr}
            onChange={(e) => setEmi(Number(e.target.value) || 0)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv">Extra invest (₹)</Label>
          <Input
            id="inv"
            type="number"
            min={0}
            value={extraInvestInr}
            onChange={(e) => setInvest(Number(e.target.value) || 0)}
            className="rounded-xl"
          />
        </div>
      </div>

      <Button className="mt-4 rounded-xl" onClick={() => void run()} disabled={loading}>
        {loading ? "Simulating…" : "Simulate impact"}
      </Button>

      {result ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-end gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Baseline</div>
              <div className="font-display text-3xl tabular-nums">{result.baselineScore}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected</div>
              <div className="font-display text-3xl tabular-nums">{result.projectedScore}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Delta</div>
              <div
                className={`font-display text-3xl tabular-nums ${result.delta >= 0 ? "text-primary" : "text-destructive"}`}
              >
                {result.delta >= 0 ? "+" : ""}
                {result.delta}
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {result.notes.map((n) => (
              <li key={n}>• {n}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
