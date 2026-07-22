import { NextResponse } from "next/server"
import { z } from "zod"

import { AUTH_COOKIE_NAME, authCookieOptions, hashPassword, signAuthToken } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"

export const runtime = "nodejs"

const SignupSchema = z.object({
  name: z.string().min(2).max(64),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json().catch(() => null)
    const parsed = SignupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup data", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase()
    
    // Check if email already exists in database
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const passwordHash = await hashPassword(parsed.data.password)
    
    // Create new user in database
    // Fresh accounts start empty — demo numbers only appear via "Try demo"
    const newUser = await User.create({
      name: parsed.data.name,
      email,
      passwordHash,
      currency: "INR",
      cashBalance: 0,
      creditLimit: 0,
      creditBalance: 0,
    })

    const token = signAuthToken({ sub: newUser._id.toString(), email: newUser.email, name: newUser.name })
    const res = NextResponse.json({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        currency: newUser.currency,
      },
    })
    res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions())
    return res
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}



