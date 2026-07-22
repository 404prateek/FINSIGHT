"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  async function onLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    if (!res.ok) {
      toast.error("Logout failed")
      return
    }
    toast.success("Logged out")
    router.push("/login")
    router.refresh()
  }

  return (
    <Button variant="secondary" className="rounded-2xl" onClick={onLogout}>
      <LogOutIcon className="mr-2 size-4" />
      Logout
    </Button>
  )
}

