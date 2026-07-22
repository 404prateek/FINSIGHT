import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { dbConnect } from "@/lib/db"
import { getAuthPayload } from "@/lib/request-auth"
import { Budget } from "@/models/Budget"
import { Transaction } from "@/models/Transaction"
import { User } from "@/models/User"
import { endOfMonth, monthKey, startOfMonth } from "@/utils/time"
import { generateInsights } from "@/utils/insights"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const auth = getAuthPayload(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const month = url.searchParams.get("month") ?? monthKey()
  const [yearStr, monthStr] = month.split("-")
  const monthDate = new Date(Number(yearStr), Number(monthStr) - 1, 1)
  const from = startOfMonth(monthDate)
  const to = endOfMonth(monthDate)

  await dbConnect()
  const [user, budget, txns] = await Promise.all([
    User.findById(auth.sub).lean(),
    Budget.findOne({ userId: auth.sub, month }).lean(),
    Transaction.find({ userId: auth.sub, occurredAt: { $gte: from, $lte: to } })
      .sort({ occurredAt: -1 })
      .limit(12)
      .lean(),
  ])

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const incomeTotal = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const expensesTotal = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  const spendByCategory: Record<string, number> = {}
  for (const t of txns) {
    if (t.type !== "expense") continue
    spendByCategory[t.category] = (spendByCategory[t.category] ?? 0) + t.amount
  }

  const budgetTotal = budget?.totalBudget ?? 0
  const insights =
    incomeTotal > 0 || expensesTotal > 0 || budgetTotal > 0
      ? generateInsights({
          month,
          budgetTotal,
          incomeTotal,
          expensesTotal,
          creditLimit: user.creditLimit ?? 0,
          creditBalance: user.creditBalance ?? 0,
          spendByCategory,
        }).slice(0, 4)
      : []

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = 800
  const left = 48
  const right = 548

  const title = "FinSight — Financial Report"
  page.drawText(title, { x: left, y, size: 20, font: bold, color: rgb(0.1, 0.1, 0.12) })
  y -= 26
  page.drawText(`Month: ${month}   •   User: ${user.name} (${user.email})`, {
    x: left,
    y,
    size: 11,
    font,
    color: rgb(0.25, 0.25, 0.3),
  })
  y -= 22

  // KPI strip
  const creditUtilPct =
    (user.creditLimit ?? 0) > 0
      ? Math.round(((user.creditBalance ?? 0) / (user.creditLimit ?? 1)) * 100)
      : 0
  const kpi = [
    ["Income", `₹${Math.round(incomeTotal).toLocaleString("en-IN")}`],
    ["Expenses", `₹${Math.round(expensesTotal).toLocaleString("en-IN")}`],
    ["Budget", `₹${Math.round(budgetTotal).toLocaleString("en-IN")}`],
    ["Credit Util.", `${creditUtilPct}%`],
  ]

  const boxW = (right - left) / 2 - 10
  const boxH = 54
  for (let i = 0; i < kpi.length; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = left + col * (boxW + 20)
    const yy = y - row * (boxH + 12)

    page.drawRectangle({ x, y: yy - boxH, width: boxW, height: boxH, borderWidth: 1, borderColor: rgb(0.9, 0.9, 0.92) })
    page.drawText(kpi[i][0], { x: x + 12, y: yy - 20, size: 10, font, color: rgb(0.35, 0.35, 0.4) })
    page.drawText(kpi[i][1], { x: x + 12, y: yy - 40, size: 16, font: bold, color: rgb(0.1, 0.1, 0.12) })
  }
  y -= 2 * (boxH + 12) + 20

  page.drawText("Smart Insights", { x: left, y, size: 13, font: bold, color: rgb(0.1, 0.1, 0.12) })
  y -= 18
  for (const i of insights) {
    page.drawText(`• ${i.title}: ${i.summary}`, { x: left, y, size: 10.5, font, color: rgb(0.2, 0.2, 0.25) })
    y -= 14
  }
  y -= 10

  page.drawText("Recent Transactions", { x: left, y, size: 13, font: bold, color: rgb(0.1, 0.1, 0.12) })
  y -= 18

  const headers = ["Date", "Category", "Merchant", "Type", "Amount"]
  const colX = [left, left + 90, left + 220, left + 380, left + 460]
  headers.forEach((h, idx) => {
    page.drawText(h, { x: colX[idx], y, size: 10, font: bold, color: rgb(0.3, 0.3, 0.35) })
  })
  y -= 12
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1, color: rgb(0.9, 0.9, 0.92) })
  y -= 14

  for (const t of txns) {
    const date = new Date(t.occurredAt).toISOString().slice(0, 10)
    const amt = `${t.type === "expense" ? "-" : "+"}₹${Math.round(t.amount).toLocaleString("en-IN")}`
    const row = [date, String(t.category), String(t.merchant || "—"), String(t.type), amt]
    row.forEach((cell, idx) => {
      page.drawText(cell.slice(0, 26), { x: colX[idx], y, size: 10, font, color: rgb(0.18, 0.18, 0.22) })
    })
    y -= 14
    if (y < 72) break
  }

  const bytes = await pdf.save()
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finsight-report-${month}.pdf"`,
    },
  })
}

