"use client"

import { BellIcon, ShieldAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export type NotificationDto = {
  id: string
  severity: "info" | "success" | "warning" | "danger"
  title: string
  message: string
  createdAt: string | Date
}

function sevBadge(sev: NotificationDto["severity"]): "default" | "secondary" | "destructive" | "outline" {
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

export function NotificationsPanel({ notifications }: { notifications: NotificationDto[] }) {
  return (
    <Card className="flex h-full flex-col rounded-2xl border-border bg-card p-4 shadow-premium sm:p-5">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BellIcon className="size-5" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">Smart Alerts</div>
          <div className="text-xs text-muted-foreground">Budget, risk, and fraud simulation</div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {notifications.slice(0, 6).map((n) => (
          <div key={n.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {n.severity === "danger" ? <ShieldAlertIcon className="size-4 text-destructive" /> : null}
                  <div className="truncate text-sm font-semibold">{n.title}</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>
              </div>
              <Badge variant={sevBadge(n.severity)} className="shrink-0 rounded-full">
                {n.severity}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

