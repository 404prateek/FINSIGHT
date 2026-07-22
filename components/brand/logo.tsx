import Link from "next/link"

import { cn } from "@/lib/utils"

export function Logo({
  className,
  tone = "default",
}: {
  className?: string
  tone?: "default" | "onDark"
}) {
  const onDark = tone === "onDark"
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-xl text-sm font-semibold tracking-tight",
          onDark ? "bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30" : "bg-primary text-primary-foreground"
        )}
      >
        Fs
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "font-display text-xl tracking-tight",
            onDark ? "text-white" : "text-foreground"
          )}
        >
          FinSight
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em]",
            onDark ? "text-slate-300" : "text-muted-foreground"
          )}
        >
          Decision support
        </span>
      </span>
    </Link>
  )
}
