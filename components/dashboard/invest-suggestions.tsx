"use client"

import type { InvestSuggestion } from "@/utils/decision-engine"
import { Badge } from "@/components/ui/badge"

export function InvestSuggestionsCard({ invest }: { invest: InvestSuggestion }) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Capital</p>
          <h2 className="mt-1 font-display text-xl tracking-tight">Put money to better use</h2>
          <p className="mt-1 text-xs text-muted-foreground">Invest only after debt & emergency checks.</p>
        </div>
        <Badge
          variant={invest.allowed ? "default" : "secondary"}
          className="rounded-lg"
        >
          {invest.allowed ? "Surplus ready" : "Hold investing"}
        </Badge>
      </div>

      <h3 className="mt-5 text-base font-semibold tracking-tight">{invest.headline}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{invest.why}</p>

      {invest.blockReason ? (
        <p className="mt-3 rounded-xl border bg-warning-soft px-3 py-2.5 text-xs leading-5 text-warning">
          {invest.blockReason}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        {[
          { label: "Surplus above EF", value: invest.surplusInr },
          { label: "EF gap", value: invest.emergencyGapInr },
          { label: "High-interest debt", value: invest.highInterestDebtInr },
        ].map((x) => (
          <div key={x.label} className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <div className="text-muted-foreground">{x.label}</div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              ₹{x.value.toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      {invest.options.length > 0 ? (
        <div className="mt-4 space-y-2">
          {invest.options.map((o) => (
            <div key={o.id} className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-3">
              <div>
                <div className="text-sm font-semibold">{o.name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.horizon} · {o.suitability}
                </div>
                <div className="mt-1 text-xs">{o.illustrativeYield}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{o.allocationPct}%</div>
                <div className="text-xs tabular-nums text-muted-foreground">
                  ₹{o.amountInr.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">{invest.disclaimer}</p>
    </section>
  )
}
