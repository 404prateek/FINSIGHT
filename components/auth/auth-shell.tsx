import type { ReactNode } from "react"
import { ShieldCheckIcon } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

export function AuthShell({
  children,
  className,
  title,
  subtitle,
}: {
  children: ReactNode
  className?: string
  title: string
  subtitle: string
}) {
  return (
    <div className="min-h-screen bg-finsight">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className={cn("w-full max-w-md", className)}>
          <div className="flex justify-center">
            <Logo tone="onDark" />
          </div>
          <div className="mt-8 rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-glow backdrop-blur-xl md:p-8">
            <div className="text-center">
              <h1 className="font-display text-3xl tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-200">{subtitle}</p>
            </div>
            <div className="mt-6">{children}</div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 px-2 text-center text-xs leading-5 text-slate-300">
            <ShieldCheckIcon className="size-3.5 shrink-0 text-teal-300" />
            Encrypted session · Educational guidance only · Team focus_4
          </div>
        </div>
      </div>
    </div>
  )
}
