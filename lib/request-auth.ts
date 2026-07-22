import { AUTH_COOKIE_NAME, type AuthTokenPayload, verifyAuthToken } from "@/lib/auth"

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

export function getAuthPayload(req: Request): AuthTokenPayload | null {
  const cookie = req.headers.get("cookie") || ""
  const token = getCookieValue(cookie, AUTH_COOKIE_NAME)
  if (!token) return null
  try {
    return verifyAuthToken(decodeURIComponent(token))
  } catch {
    return null
  }
}

