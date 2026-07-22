"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Schema = z.object({
  email: z.string().email(),
})

type Values = z.infer<typeof Schema>

export default function ForgotPasswordPage() {
  const form = useForm<Values>({ resolver: zodResolver(Schema), defaultValues: { email: "" } })

  async function onSubmit() {
    // UI-only for hackathon: show a polished flow without needing an email provider.
    toast.success("If this email exists, you'll receive a reset link shortly.")
  }

  return (
    <AuthShell title="Reset your password" subtitle="We’ll email you a secure reset link (demo UI).">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/80" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="bg-white/5 text-white placeholder:text-white/40"
            {...form.register("email")}
          />
        </div>

        <Button type="submit" className="h-11 w-full rounded-2xl bg-white text-black hover:bg-white/90">
          Send reset link
        </Button>

        <div className="text-center text-sm text-white/70">
          <Link href="/login" className="font-semibold text-white hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}

