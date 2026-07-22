import { NextResponse } from "next/server"
import { z } from "zod"

import { dbConnect } from "@/lib/db"
import { getAuthPayload } from "@/lib/request-auth"
import { Budget } from "@/models/Budget"
import { monthKey } from "@/utils/time"

export const runtime = "nodejs"

function mapishToObject(value: unknown): Record<string, number> {
  if (!value) return {}
  if (value instanceof Map) return Object.fromEntries(value.entries())
  if (typeof value === "object") return value as Record<string, number>
  return {}
}

const UpsertBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  totalBudget: z.number().nonnegative(),
  categoryBudgets: z.record(z.string(), z.number().nonnegative()).optional().default({}),
})

export async function GET(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const month = url.searchParams.get("month") ?? monthKey()

  await dbConnect()
  const budget = await Budget.findOne({ userId: auth.sub, month }).lean()

  if (!budget) {
    return NextResponse.json({
      budget: {
        id: null,
        month,
        totalBudget: 0,
        categoryBudgets: {},
        updatedAt: null,
      },
    })
  }

  return NextResponse.json({
    budget: {
      id: budget._id.toString(),
      month: budget.month,
      totalBudget: budget.totalBudget,
      categoryBudgets: mapishToObject((budget as { categoryBudgets?: unknown }).categoryBudgets),
      updatedAt: budget.updatedAt,
    },
  })
}

export async function PUT(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = UpsertBudgetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid budget", issues: parsed.error.flatten() }, { status: 400 })
  }

  const month = parsed.data.month ?? monthKey()

  await dbConnect()
  const updated = await Budget.findOneAndUpdate(
    { userId: auth.sub, month },
    { totalBudget: parsed.data.totalBudget, categoryBudgets: parsed.data.categoryBudgets },
    { new: true, upsert: true }
  ).lean()

  return NextResponse.json({
    budget: {
      id: updated!._id.toString(),
      month: updated!.month,
      totalBudget: updated!.totalBudget,
      categoryBudgets: mapishToObject((updated as { categoryBudgets?: unknown }).categoryBudgets),
      updatedAt: updated!.updatedAt,
    },
  })
}

