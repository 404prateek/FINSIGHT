"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function RiskGauge({
  value,
  className,
  empty = false,
}: {
  value: number // 0-100, higher = riskier
  className?: string
  empty?: boolean
}) {
  const v = empty ? 0 : Math.max(0, Math.min(100, value))
  const size = 220
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const half = c / 2
  const progress = half * (v / 100)
  const dashArray = `${progress} ${c}`

  const label = empty
    ? "No data yet"
    : v >= 75
      ? "High Risk"
      : v >= 45
        ? "Medium Risk"
        : v >= 20
          ? "Low Risk"
          : "Very Low"
  
  // Determine color based on risk level
  let fillColor = empty ? "hsl(var(--muted-foreground))" : "#10b981" // Green - Low risk
  if (!empty) {
    if (v >= 75) fillColor = "#ef4444" // Red - High risk
    else if (v >= 45) fillColor = "#f59e0b" // Amber - Medium risk
    else if (v >= 20) fillColor = "#06b6d4" // Cyan - Low risk
  }

  return (
    <div className={cn("relative h-[220px] w-full", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <g transform={`rotate(180 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
            strokeDasharray={`${half} ${c}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={fillColor}
            strokeWidth={stroke}
            strokeDasharray={dashArray}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-8">
        <div className="text-xs text-muted-foreground font-semibold">RISK SCORE</div>
        <div className="mt-2 text-4xl font-bold tracking-tight" style={{ color: fillColor }}>{v}</div>
        <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

