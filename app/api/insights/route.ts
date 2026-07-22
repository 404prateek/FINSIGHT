import { NextResponse } from "next/server"

import { getDecisionBundle } from "@/lib/financial-context"
import { getAuthPayload } from "@/lib/request-auth"
import type { Insight } from "@/utils/insights"
import { monthKey } from "@/utils/time"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const month = url.searchParams.get("month") ?? monthKey()
  const bundle = await getDecisionBundle(auth.sub, month)

  const insights: Insight[] = bundle.actions.slice(0, 8).map((a) => ({
    id: a.id,
    severity: a.severity,
    title: a.title,
    summary: a.why,
    recommendation: a.action,
    metric: a.amountInr
      ? { label: "Amount", value: `₹${Math.round(a.amountInr).toLocaleString("en-IN")}` }
      : { label: "Score impact", value: `+${a.scoreDelta}` },
  }))

  return NextResponse.json({
    month,
    prevMonth: month,
    insights,
    health: bundle.health,
    todaysMoves: bundle.todaysMoves,
    risks: bundle.risks,
    invest: bundle.invest,
    disclaimer: bundle.disclaimer,
  })
}
