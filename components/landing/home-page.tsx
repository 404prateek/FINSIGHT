"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import {
  ArrowRightIcon,
  EyeIcon,
  LockIcon,
  MenuIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ListOrderedIcon,
  HeartPulseIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const TRUST_PILLARS = [
  {
    icon: ScaleIcon,
    title: "Rules before AI",
    body: "Amounts, rankings, and invest-vs-debt logic come from a transparent rule engine — not a black box.",
  },
  {
    icon: EyeIcon,
    title: "Every “why” is visible",
    body: "See the inputs behind each recommendation: rates, utilization, emergency buffer, and goals.",
  },
  {
    icon: LockIcon,
    title: "Local-first & private by design",
    body: "JWT in HttpOnly cookies, your data in your MongoDB. Rules own every amount and ranking.",
  },
]

const STEPS = [
  {
    step: "01",
    title: "See your picture",
    body: "Income, spend, cash, credit, and goals in one calm view.",
    icon: HeartPulseIcon,
  },
  {
    step: "02",
    title: "Get ranked moves",
    body: "Today’s 3 actions — with impact, tradeoffs, and effort.",
    icon: ListOrderedIcon,
  },
  {
    step: "03",
    title: "Act with confidence",
    body: "Simulate first. Invest only after debt and emergency checks.",
    icon: TrendingUpIcon,
  },
]

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function HomePageClient() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative overflow-hidden bg-finsight text-white">
        <div className="pointer-events-none absolute -left-20 top-20 size-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 size-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8">
          <header className="flex items-center justify-between gap-3">
            <Logo tone="onDark" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <a
                href="#trust"
                className="hidden rounded-lg px-2 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white md:inline"
              >
                Trust
              </a>
              <a
                href="#how"
                className="hidden rounded-lg px-2 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white md:inline"
              >
                How it works
              </a>
              <ThemeToggle onDark />
              <Link
                href="/login"
                className="hidden rounded-xl px-3 py-2 text-sm font-medium text-white/90 hover:text-white sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-xl bg-teal-300 px-3.5 py-2 text-sm font-semibold text-[#042f2e] transition hover:bg-teal-200 sm:inline"
              >
                Get started
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:hidden"
                  >
                    <MenuIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem asChild>
                    <a href="#trust">Trust</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="#how">How it works</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign in</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Get started</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="mt-14 max-w-2xl sm:mt-20 md:mt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200">
              <SparklesIcon className="size-3.5" />
              Decision support — not another chart wall
            </div>
            <p className="mt-5 font-display text-4xl tracking-tight text-white sm:text-5xl md:text-6xl">
              FinSight
            </p>
            <h1 className="mt-4 max-w-xl font-display text-2xl leading-snug tracking-tight text-white sm:text-3xl md:text-4xl">
              Know what to do with your money — not just what you have.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 sm:text-base md:text-lg">
              Ranked next steps. Explainable scores. Invest only after debt and emergency fund checks.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:max-w-md sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0c1b2a] transition hover:bg-slate-100"
              >
                Create account
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Try demo on login
              </Link>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-300">
              <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-teal-300" />
              Educational decision support · Not SEBI advice · Team focus_4
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:mt-16 sm:grid-cols-3">
            {[
              { k: "Decision-first", v: "Actions before charts" },
              { k: "Explainable", v: "Every recommendation shows why" },
              { k: "Debt-aware investing", v: "May tell you not to invest" },
            ].map((item) => (
              <div key={item.k} className="bg-[#0a1520]/95 px-4 py-4 sm:px-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-300">{item.k}</div>
                <div className="mt-1 text-sm font-medium text-slate-100">{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="trust" className="relative bg-background text-foreground">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-[0.35]",
            isDark
              ? "[background-image:radial-gradient(circle_at_20%_20%,rgb(45_212_191/12%),transparent_40%)]"
              : "[background-image:radial-gradient(circle_at_80%_0%,rgb(15_118_110/10%),transparent_45%)]"
          )}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <FadeIn>
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <ScaleIcon className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Why trust FinSight</p>
                <h2 className="font-display text-2xl tracking-tight sm:text-3xl md:text-4xl">
                  Built to earn confidence — not hype.
                </h2>
              </div>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
            {TRUST_PILLARS.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <p.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg text-card-foreground sm:text-xl">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <FadeIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">How it works</p>
            <h2 className="mt-3 font-display text-2xl tracking-tight sm:text-3xl md:text-4xl">
              Three steps. One clear answer.
            </h2>
          </FadeIn>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-5",
                    activeStep === i
                      ? "border-primary/40 bg-primary/10 shadow-premium"
                      : "border-border bg-background hover:border-primary/25"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      activeStep === i ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    <s.icon className="size-5" />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-semibold text-primary">{s.step}</div>
                    <h3 className="mt-1 font-display text-lg text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.body}</p>
                  </div>
                </button>
              ))}
            </div>

            <FadeIn delay={0.1}>
              <div
                className={cn(
                  "relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-border p-6 shadow-premium",
                  isDark ? "bg-ink text-white" : "bg-[#0c1b2a] text-white"
                )}
              >
                <Image
                  src="/brand/icon-compass.svg"
                  alt=""
                  width={120}
                  height={120}
                  className="absolute -right-2 -top-2 opacity-20"
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-300">Active step</p>
                  <h3 className="mt-2 font-display text-2xl">{STEPS[activeStep].title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{STEPS[activeStep].body}</p>
                </div>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex items-center gap-2 self-start rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-semibold text-[#042f2e] transition hover:bg-teal-200"
                >
                  Start with step {STEPS[activeStep].step}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn className="mt-10 sm:mt-14">
            <div className="flex flex-col gap-5 rounded-2xl bg-ink px-5 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-10">
              <div>
                <h3 className="font-display text-xl sm:text-2xl">Ready to see today’s moves?</h3>
                <p className="mt-2 max-w-md text-sm text-slate-300">
                  Sign up or use demo login for an instant decision dashboard.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-[#042f2e] hover:bg-teal-200"
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#071018] px-4 py-8 text-slate-400 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Logo tone="onDark" />
          <p className="max-w-md text-xs leading-5">
            FinSight provides educational decision support. Not SEBI-registered advice. © {new Date().getFullYear()}{" "}
            Team focus_4.
          </p>
        </div>
      </footer>
    </div>
  )
}
