"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SignupSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
})

type SignupValues = z.infer<typeof SignupSchema>

const fieldClass =
  "h-11 border-white/25 bg-white/10 text-white placeholder:text-slate-400 focus-visible:border-teal-300/50 focus-visible:ring-teal-300/30"

export function SignupClient() {
  const router = useRouter()
  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: SignupValues) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || "Signup failed")
      return
    }

    toast.success("Account created")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <AuthShell title="Create your account" subtitle="Start with clear next steps for budgets, debt, and goals.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-100" htmlFor="name">
            Name
          </Label>
          <Input id="name" placeholder="Akshat" autoComplete="name" className={fieldClass} {...form.register("name")} />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-100" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={fieldClass}
            {...form.register("email")}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-100" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className={fieldClass}
            {...form.register("password")}
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-white text-[#0c1b2a] hover:bg-slate-100"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating…" : "Create account"}
        </Button>

        <div className="text-center text-sm text-slate-200">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-200 hover:text-teal-100 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
