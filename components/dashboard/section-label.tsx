"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function SectionLabel({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h2 className="font-display text-xl leading-tight tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
      </div>
    </motion.div>
  )
}

export function MotionPanel({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Equal-height grid cell wrapper */
export function GridCell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-full min-w-0 flex-col [&>*]:h-full", className)}>{children}</div>
}
