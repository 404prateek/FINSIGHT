import { NextResponse } from "next/server"
import { z } from "zod"

import { getDecisionBundle } from "@/lib/financial-context"
import { getAuthPayload } from "@/lib/request-auth"
import { simulateScenario } from "@/utils/decision-engine"
import { monthKey } from "@/utils/time"

export const runtime = "nodejs"

const ScenarioSchema = z.object({
  cutExpenseInr: z.number().min(0).max(500000).optional(),
  extraEmiInr: z.number().min(0).max(500000).optional(),
  extraInvestInr: z.number().min(0).max(500000).optional(),
})

export async function GET(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const month = url.searchParams.get("month") ?? monthKey()

  const bundle = await getDecisionBundle(auth.sub, month)
  return NextResponse.json(bundle)
}

/** What-if simulator using the same profile + rules */
export async function POST(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const month = url.searchParams.get("month") ?? monthKey()
  const body = await req.json().catch(() => null)
  const parsed = ScenarioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scenario" }, { status: 400 })
  }

  const bundle = await getDecisionBundle(auth.sub, month)
  const result = simulateScenario(bundle.profile, parsed.data)
  return NextResponse.json({ ...result, disclaimer: bundle.disclaimer })
}
