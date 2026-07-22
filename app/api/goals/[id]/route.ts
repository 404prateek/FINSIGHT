import { NextResponse } from "next/server"
import { z } from "zod"

import { dbConnect } from "@/lib/db"
import { getAuthPayload } from "@/lib/request-auth"
import { Goal } from "@/models/Goal"

export const runtime = "nodejs"

const UpdateSchema = z.object({
  title: z.string().min(2).max(60).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().nonnegative().optional(),
  deadline: z.string().datetime().nullable().optional(),
  status: z.enum(["active", "completed", "paused"]).optional(),
})

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.flatten() }, { status: 400 })
  }

  await dbConnect()
  const $set: Record<string, unknown> = { ...parsed.data }
  const $unset: Record<string, unknown> = {}

  if ("deadline" in parsed.data) {
    if (parsed.data.deadline === null) {
      delete $set.deadline
      $unset.deadline = 1
    } else if (typeof parsed.data.deadline === "string") {
      $set.deadline = new Date(parsed.data.deadline)
    }
  }

  const updated = await Goal.findOneAndUpdate(
    { _id: id, userId: auth.sub },
    { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) },
    { new: true }
  ).lean()

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    goal: {
      id: updated._id.toString(),
      title: updated.title,
      targetAmount: updated.targetAmount,
      currentAmount: updated.currentAmount,
      deadline: updated.deadline,
      status: updated.status,
      createdAt: updated.createdAt,
    },
  })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(_req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  await dbConnect()
  const deleted = await Goal.findOneAndDelete({ _id: id, userId: auth.sub }).lean()
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}

