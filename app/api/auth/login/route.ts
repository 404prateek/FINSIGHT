import { NextResponse } from "next/server"
import { z } from "zod"

import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken, verifyPassword } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"

export const runtime = "nodejs"

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
})

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json().catch(() => null)
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid login data" }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    
    // Fetch user from database
    const user = await User.findOne({ email })
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signAuthToken({ sub: user._id.toString(), email: user.email, name: user.name })
    const res = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    })
    res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions())
    return res
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}


