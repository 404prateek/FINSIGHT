import { NextResponse } from "next/server"

import { getDecisionBundle } from "@/lib/financial-context"
import { getAuthPayload } from "@/lib/request-auth"
import { monthKey } from "@/utils/time"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const month = url.searchParams.get("month") ?? monthKey()

  const bundle = await getDecisionBundle(auth.sub, month)

  if (bundle.isEmpty) {
    return NextResponse.json({ month, notifications: [] })
  }

  // Derived from this user's risks/actions only — no canned demo copy
  const fromRisks = bundle.risks.map((r) => ({
    id: `risk-${r.id}`,
    type: r.severity === "danger" ? ("budget_alert" as const) : ("milestone" as const),
    title: r.title,
    message: r.message,
    read: false,
    createdAt: new Date(),
  }))

  const fromMoves = bundle.todaysMoves.slice(0, 2).map((m) => ({
    id: `move-${m.id}`,
    type: "investment" as const,
    title: m.title,
    message: m.action,
    read: false,
    createdAt: new Date(),
  }))

  return NextResponse.json({
    month,
    notifications: [...fromRisks, ...fromMoves].slice(0, 8),
  })
}
