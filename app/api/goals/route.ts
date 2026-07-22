import { NextResponse } from "next/server"
import { z } from "zod"

import { dbConnect } from "@/lib/db"
import { getAuthPayload } from "@/lib/request-auth"
import { Goal } from "@/models/Goal"

export const runtime = "nodejs"

const CreateGoalSchema = z.object({
  title: z.string().min(2).max(60),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative().optional().default(0),
  deadline: z.string().datetime().optional(),
})

export async function GET(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await dbConnect()
  const goals = await Goal.find({ userId: auth.sub }).sort({ createdAt: -1 }).limit(50).lean()

  return NextResponse.json({
    goals: goals.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline,
      status: g.status,
      createdAt: g.createdAt,
    })),
  })
}

export async function POST(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CreateGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid goal", issues: parsed.error.flatten() }, { status: 400 })
  }

  await dbConnect()
  const goal = await Goal.create({
    userId: auth.sub,
    title: parsed.data.title,
    targetAmount: parsed.data.targetAmount,
    currentAmount: parsed.data.currentAmount,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
  })

  return NextResponse.json({
    goal: {
      id: goal._id.toString(),
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      status: goal.status,
      createdAt: goal.createdAt,
    },
  })
}

