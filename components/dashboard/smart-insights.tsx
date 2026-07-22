"use client"

import { BrainCircuitIcon } from "lucide-react"

import type { Insight } from "@/utils/insights"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

function sevToBadge(sev: Insight["severity"]): "default" | "secondary" | "destructive" | "outline" {
  switch (sev) {
    case "danger":
      return "destructive"
    case "warning":
      return "secondary"
    case "success":
      return "default"
    default:
      return "outline"
  }
}

export function SmartInsights({ insights }: { insights: Insight[] }) {
  return (
    <Card className="flex h-full flex-col rounded-2xl border-border bg-card p-4 shadow-premium sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BrainCircuitIcon className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Smart Insights</div>
            <div className="text-xs text-muted-foreground">AI-powered (rule-based) recommendations</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {insights.slice(0, 6).map((i) => (
          <div key={i.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold">{i.title}</div>
                  <Badge variant={sevToBadge(i.severity)} className="rounded-full">
                    {i.severity}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{i.summary}</div>
                <div className="mt-2 text-sm">{i.recommendation}</div>
              </div>
              {i.metric ? (
                <div className="shrink-0 text-right">
                  <div className="text-xs text-muted-foreground">{i.metric.label}</div>
                  <div className="text-sm font-semibold">{i.metric.value}</div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

