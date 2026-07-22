"use client"

import { CircleAlertIcon } from "lucide-react"
import { motion } from "framer-motion"

import type { DecisionAction } from "@/utils/decision-engine"
import { Badge } from "@/components/ui/badge"

function sevVariant(sev: DecisionAction["severity"]): "default" | "secondary" | "destructive" | "outline" {
  if (sev === "danger") return "destructive"
  if (sev === "warning") return "secondary"
  if (sev === "success") return "default"
  return "outline"
}

export function TodaysMoves({ moves, disclaimer }: { moves: DecisionAction[]; disclaimer?: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
      <div className="border-b border-border bg-trust-surface px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Priority</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">
              {moves.length === 1 && moves[0]?.id === "onboarding-add-data"
                ? "Get started"
                : "Today's 3 moves"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {moves.length === 1 && moves[0]?.id === "onboarding-add-data"
                ? "Add real money data first — we won’t invent recommendations from zeros."
                : "What you should do now — with the why attached."}
            </p>
          </div>
          <Badge variant="outline" className="rounded-lg border-primary/30 text-primary">
            Decision layer
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-border">
        {moves.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.35 }}
            className="flex gap-4 px-5 py-5 sm:px-7"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0c1b2a] font-display text-lg text-white dark:bg-primary dark:text-primary-foreground">
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight">{m.title}</h3>
                <Badge variant={sevVariant(m.severity)} className="rounded-md capitalize">
                  {m.kind}
                </Badge>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.effort.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/90">{m.action}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/70">Why · </span>
                {m.why}
              </p>
              <p className="mt-1.5 text-sm text-primary">
                <span className="font-medium">Impact · </span>
                {m.impact}
              </p>
              {m.tradeoff ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-warning">
                  <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                  {m.tradeoff}
                </p>
              ) : null}
            </div>
            {m.scoreDelta > 0 ? (
              <div className="hidden shrink-0 text-right sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
                <div className="font-display text-xl text-primary">+{m.scoreDelta}</div>
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>

      {disclaimer ? (
        <p className="border-t border-border px-5 py-3 text-[11px] leading-5 text-muted-foreground sm:px-7">
          {disclaimer}
        </p>
      ) : null}
    </section>
  )
}
