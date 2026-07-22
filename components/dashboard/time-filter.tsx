"use client"

import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TimeFilter = "7d" | "30d" | "90d" | "1y" | "all"

export function TimeFilter({
  value,
  onChange,
}: {
  value: TimeFilter
  onChange: (filter: TimeFilter) => void
}) {
  const labels: Record<TimeFilter, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "1y": "Last year",
    all: "All time",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-2xl" size="sm">
          <CalendarIcon className="mr-2 size-4" />
          {labels[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl">
        {(Object.keys(labels) as TimeFilter[]).map((filter) => (
          <DropdownMenuItem
            key={filter}
            onClick={() => onChange(filter)}
            className="rounded-xl"
          >
            {labels[filter]}
            {value === filter && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
