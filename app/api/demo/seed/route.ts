import { NextResponse } from "next/server"
import type { Types } from "mongoose"

import { dbConnect } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { Budget } from "@/models/Budget"
import { Goal } from "@/models/Goal"
import { Transaction } from "@/models/Transaction"
import { User } from "@/models/User"
import { monthKey } from "@/utils/time"
import { TransactionCategories } from "@/utils/categories"

export const runtime = "nodejs"

type SeedUser = { _id: Types.ObjectId; name: string; email: string }

function demoCreds() {
  return {
    email: process.env.DEMO_EMAIL || "demo@finsight.app",
    password: process.env.DEMO_PASSWORD || "demo12345",
    name: "Demo Founder",
  }
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const reset = url.searchParams.get("reset") === "1"

  await dbConnect()

  const { email, password, name } = demoCreds()
  let user = (await User.findOne({ email }).select({ _id: 1, name: 1, email: 1 }).lean()) as unknown as SeedUser | null

  if (!user) {
    const passwordHash = await hashPassword(password)
    const created = await User.create({
      name,
      email,
      passwordHash,
      currency: "INR",
      cashBalance: 14500,
      creditLimit: 7000,
      creditBalance: 2100,
    })
    user = { _id: created._id, name: created.name, email: created.email }
  }

  if (reset) {
    await Promise.all([
      Transaction.deleteMany({ userId: user._id }),
      Budget.deleteMany({ userId: user._id }),
      Goal.deleteMany({ userId: user._id }),
    ])
  }

  const now = new Date()
  const month = monthKey(now)

  const existingTxnCount = await Transaction.countDocuments({ userId: user._id })
  if (existingTxnCount === 0) {
    // Budget
    await Budget.findOneAndUpdate(
      { userId: user._id, month },
      { totalBudget: 3200, categoryBudgets: { Food: 520, Transport: 240, Shopping: 400 } },
      { upsert: true, new: true }
    )

    // Goals
    await Goal.insertMany([
      { userId: user._id, title: "Emergency Fund", targetAmount: 5000, currentAmount: 3100, status: "active" },
      { userId: user._id, title: "Vacation", targetAmount: 2000, currentAmount: 640, status: "active" },
      { userId: user._id, title: "Investing Challenge", targetAmount: 3000, currentAmount: 1700, status: "active" },
    ])

    // Transactions (current month + last month)
    const txns: Array<{
      userId: Types.ObjectId
      type: "income" | "expense"
      amount: number
      category: string
      merchant: string
      occurredAt: Date
      note?: string
    }> = []

    // Salary income
    txns.push({
      userId: user._id,
      type: "income",
      amount: 5200,
      category: "Other",
      merchant: "Payroll",
      occurredAt: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0),
      note: "Monthly salary",
    })

    // Side income
    txns.push({
      userId: user._id,
      type: "income",
      amount: 650,
      category: "Other",
      merchant: "Freelance",
      occurredAt: new Date(now.getFullYear(), now.getMonth(), 12, 14, 0, 0),
      note: "Contract payment",
    })

    const merchants = ["Starbucks", "Uber", "Amazon", "Netflix", "Apple", "Whole Foods", "Target", "Shell", "Gym"]

    for (let i = 0; i < 42; i++) {
      const dayOffset = Math.floor(rand(0, 55))
      const date = new Date(now)
      date.setDate(now.getDate() - dayOffset)
      date.setHours(Math.floor(rand(8, 21)), Math.floor(rand(0, 59)), 0, 0)

      const category = pick(TransactionCategories)
      const isInvest = category === "Investments"
      const amount = isInvest ? rand(80, 260) : rand(12, category === "Bills" ? 240 : 160)

      txns.push({
        userId: user._id,
        type: "expense",
        amount: Math.round(amount),
        category,
        merchant: pick(merchants),
        occurredAt: date,
        note: i % 9 === 0 ? "Recurring" : "",
      })
    }

    // One suspicious spend for fraud simulation.
    txns.push({
      userId: user._id,
      type: "expense",
      amount: 920,
      category: "Shopping",
      merchant: "Unknown Merchant",
      occurredAt: new Date(now.getFullYear(), now.getMonth(), Math.max(2, now.getDate() - 2), 20, 15, 0),
      note: "Flagged by simulation",
    })

    await Transaction.insertMany(txns)
  }

  return NextResponse.json({
    ok: true,
    demo: {
      email,
      password: "********",
    },
  })
}

