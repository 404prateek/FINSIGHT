import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { LogoutButton } from "@/components/auth/logout-button"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExportPdfButton } from "@/components/reports/export-pdf-button"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <Logo />
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden rounded-xl text-foreground md:inline-flex">
              <Link href="/goals">Goals</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden rounded-xl text-foreground md:inline-flex">
              <Link href="/settings">Settings</Link>
            </Button>
            <div className="hidden sm:block">
              <ExportPdfButton />
            </div>
            <ThemeToggle />
            <div className="hidden sm:block">
              <LogoutButton />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl md:hidden">
                  <MenuIcon className="size-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem asChild>
                  <Link href="/goals">Goals</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Landing</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <DashboardClient />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6">
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[11px] leading-5 text-muted-foreground">
            FinSight is educational decision support — not SEBI-registered investment advice. Figures may be
            illustrative. Always verify before acting.
          </p>
          <div className="flex shrink-0 gap-2 sm:hidden">
            <ExportPdfButton />
            <LogoutButton />
          </div>
        </div>
      </footer>
    </div>
  )
}
