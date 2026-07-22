"use client"

import type { RiskItem } from "@/utils/decision-engine"
import { Badge } from "@/components/ui/badge"

function sevVariant(sev: RiskItem["severity"]): "default" | "secondary" | "destructive" | "outline" {
  if (sev === "danger") return "destructive"
  if (sev === "warning") return "secondary"
  if (sev === "success") return "default"
  return "outline"
}

export function RiskRadar({ risks }: { risks: RiskItem[] }) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Risks</p>
      <h2 className="mt-1 font-display text-xl tracking-tight">Hidden inefficiencies</h2>
      <p className="mt-1 text-xs text-muted-foreground">Surface leaks before they compound.</p>

      <div className="mt-5 space-y-3">
        {risks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No major hidden risks detected right now.</p>
        ) : (
          risks.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{r.title}</span>
                    <Badge variant={sevVariant(r.severity)} className="rounded-md capitalize">
                      {r.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{r.message}</p>
                </div>
                {typeof r.moneyAtStakeInr === "number" ? (
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">At stake</div>
                    <div className="text-sm font-semibold tabular-nums">
                      ₹{Math.round(r.moneyAtStakeInr).toLocaleString("en-IN")}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
