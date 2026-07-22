import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const AUTH_COOKIE_NAME = "finsight_token"

export type AuthTokenPayload = {
  sub: string
  email: string
  name?: string
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("Missing env var: JWT_SECRET")
  return secret
}

export async function hashPassword(password: string) {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}

export function authCookieOptions() {
  const isProd = process.env.NODE_ENV === "production"
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}

