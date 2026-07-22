import { dbConnect } from "@/lib/db"
import { Budget } from "@/models/Budget"
import { Goal } from "@/models/Goal"
import { Transaction } from "@/models/Transaction"
import { User } from "@/models/User"
import {
  demoFinancialProfile,
  starterFinancialProfile,
  type FinancialProfile,
  runDecisionEngine,
  type DecisionBundle,
} from "@/utils/decision-engine"
import { endOfMonth, monthKey } from "@/utils/time"

function parseMonth(month: string) {
  const [y, m] = month.split("-").map(Number)
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0)
  const end = endOfMonth(start)
  return { start, end }
}

function demoEmail() {
  return (process.env.DEMO_EMAIL || "demo@finsight.app").toLowerCase()
}

function isDemoUser(email?: string | null) {
  return !!email && email.toLowerCase() === demoEmail()
}

/**
 * Build a FinancialProfile from the user's real MongoDB data.
 * Rich demo numbers are ONLY used for the seeded demo account.
 */
export async function loadFinancialProfile(userId: string, month = monthKey()): Promise<FinancialProfile> {
  try {
    await dbConnect()
    const user = await User.findById(userId).lean()
    if (!user) {
      return starterFinancialProfile(month)
    }

    const demo = isDemoUser(user.email)
    const { start, end } = parseMonth(month)
    const [budget, goals, txns] = await Promise.all([
      Budget.findOne({ userId, month }).lean(),
      Goal.find({ userId }).limit(20).lean(),
      Transaction.find({
        userId,
        occurredAt: { $gte: start, $lte: end },
      })
        .limit(500)
        .lean(),
    ])

    let monthlyIncome = 0
    let monthlyExpenses = 0
    const spendByCategory: Record<string, number> = {}

    for (const t of txns) {
      if (t.type === "income") monthlyIncome += t.amount
      else {
        monthlyExpenses += t.amount
        const cat = t.category || "Other"
        spendByCategory[cat] = (spendByCategory[cat] ?? 0) + t.amount
      }
    }

    const mappedGoals = goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
      status: g.status,
    }))

    // Demo account: if seed data is thin/missing, fall back to rich demo story
    if (demo && txns.length < 3) {
      return {
        ...demoFinancialProfile(month),
        currency: user.currency || "INR",
        cashBalance: user.cashBalance ?? demoFinancialProfile(month).cashBalance,
        creditLimit: user.creditLimit ?? demoFinancialProfile(month).creditLimit,
        creditBalance: user.creditBalance ?? demoFinancialProfile(month).creditBalance,
        goals: mappedGoals.length > 0 ? mappedGoals : demoFinancialProfile(month).goals,
      }
    }

    // Real signup users: only their actual data (zeros / empties until they add activity)
    if (!demo) {
      return starterFinancialProfile(month, {
        currency: user.currency || "INR",
        monthlyIncome,
        monthlyExpenses,
        totalBudget: budget?.totalBudget ?? 0,
        cashBalance: user.cashBalance ?? 0,
        investments: 0,
        creditLimit: user.creditLimit ?? 0,
        creditBalance: user.creditBalance ?? 0,
        highInterestDebt: 0,
        goals: mappedGoals,
        spendByCategory,
      })
    }

    // Demo with enough transactions: prefer live seeded numbers, fill gaps from demo profile
    const fallback = demoFinancialProfile(month)
    return {
      month,
      currency: user.currency || "INR",
      monthlyIncome: monthlyIncome || fallback.monthlyIncome,
      monthlyExpenses: monthlyExpenses || fallback.monthlyExpenses,
      totalBudget: budget?.totalBudget ?? fallback.totalBudget,
      cashBalance: user.cashBalance ?? fallback.cashBalance,
      investments: fallback.investments,
      creditLimit: user.creditLimit ?? fallback.creditLimit,
      creditBalance: user.creditBalance ?? fallback.creditBalance,
      highInterestDebt: fallback.highInterestDebt,
      savingsYieldPct: fallback.savingsYieldPct,
      debtInterestPct: fallback.debtInterestPct,
      liquidYieldPct: fallback.liquidYieldPct,
      equityIllustrativePct: fallback.equityIllustrativePct,
      emergencyMonthsTarget: fallback.emergencyMonthsTarget,
      goals: mappedGoals.length > 0 ? mappedGoals : fallback.goals,
      spendByCategory: Object.keys(spendByCategory).length ? spendByCategory : fallback.spendByCategory,
    }
  } catch {
    return starterFinancialProfile(month)
  }
}

export async function getDecisionBundle(userId: string, month = monthKey()): Promise<DecisionBundle> {
  const profile = await loadFinancialProfile(userId, month)
  return runDecisionEngine(profile)
}
