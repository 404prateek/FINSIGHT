"use client"

import type { HealthScorecard } from "@/utils/decision-engine"
import { Progress } from "@/components/ui/progress"

export function HealthScorecardCard({ health }: { health: HealthScorecard }) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Health</p>
      <h2 className="mt-1 font-display text-xl tracking-tight">Explainable score</h2>
      <p className="mt-1 text-xs text-muted-foreground">Drivers behind the number — inspect, don&apos;t guess.</p>

      <div className="mt-5 flex items-end gap-3">
        <div className="font-display text-5xl tracking-tight tabular-nums">{health.score}</div>
        <div className="mb-1.5 text-sm text-muted-foreground">
          /100
          <div className="font-medium text-foreground">{health.label}</div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">{health.topMover}</p>

      <div className="mt-5 space-y-3.5">
        {health.drivers.map((d) => (
          <div key={d.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{d.label}</span>
              <span className="tabular-nums text-muted-foreground">{d.score}</span>
            </div>
            <Progress value={d.score} className="h-1.5" />
            <div className="mt-1 text-[11px] text-muted-foreground">{d.detail}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
