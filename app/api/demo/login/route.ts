import { NextResponse } from "next/server"

import { dbConnect } from "@/lib/db"
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from "@/lib/auth"
import { User } from "@/models/User"

export const runtime = "nodejs"

function demoEmail() {
  return process.env.DEMO_EMAIL || "demo@finsight.app"
}

export async function POST() {
  await dbConnect()
  const user = await User.findOne({ email: demoEmail() })
  if (!user) {
    return NextResponse.json(
      { error: "Demo user not seeded yet. Call /api/demo/seed first." },
      { status: 404 }
    )
  }

  const token = signAuthToken({ sub: user._id.toString(), email: user.email, name: user.name })
  const res = NextResponse.json({
    user: { id: user._id.toString(), name: user.name, email: user.email, currency: user.currency },
    demo: true,
  })
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions())
  return res
}

