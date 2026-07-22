import { NextResponse } from "next/server"

import { dbConnect } from "@/lib/db"
import { getAuthPayload } from "@/lib/request-auth"
import { User } from "@/models/User"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const payload = getAuthPayload(req)
  if (!payload) return NextResponse.json({ user: null }, { status: 200 })

  await dbConnect()
  const user = await User.findById(payload.sub).lean()
  if (!user) return NextResponse.json({ user: null }, { status: 200 })

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
      creditLimit: user.creditLimit,
      creditBalance: user.creditBalance,
    },
  })
}

