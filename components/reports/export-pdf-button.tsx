"use client"

import * as React from "react"
import { DownloadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { monthKey } from "@/utils/time"

export function ExportPdfButton() {
  const [downloading, setDownloading] = React.useState(false)

  async function download() {
    setDownloading(true)
    try {
      const month = monthKey()
      const res = await fetch(`/api/report/pdf?month=${month}`)
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `finsight-report-${month}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast.success("Report downloaded")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Export failed"
      toast.error(msg)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button variant="secondary" className="rounded-2xl" onClick={download} disabled={downloading}>
      <DownloadIcon className="mr-2 size-4" />
      {downloading ? "Exporting…" : "Export PDF"}
    </Button>
  )
}

