import type {
  DecisionAction,
  HealthScorecard,
  InvestSuggestion,
  RiskItem,
} from "@/utils/decision-engine"
import type { Insight } from "@/utils/insights"

export type DashboardSummary = {
  month: string
  kpis: {
    healthScore: number
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
  }
  risk: { riskScore: number; creditUtilization: number }
  charts: {
    expenseBreakdown: Array<{ category: string; amount: number }>
    incomeVsExpenses: Array<{ day: string; income: number; expense: number }>
    investmentGrowth: Array<{ month: string; value: number }>
  }
  budget: {
    totalBudget: number
    remaining: number
  }
  assets: {
    totalAssets: number
    cashBalance: number
    investments: number
    creditLimit: number
    creditBalance: number
    netWorth: number
  }
  portfolio: {
    equity: number
    mutualFunds: number
    crypto: number
    bonds: number
    other: number
  }
  upi: {
    received: number
    sent: number
    recent: Array<{
      id: string
      type: "received" | "sent"
      amount: number
      from: string
      note?: string
      date: string
    }>
  }
  isEmpty?: boolean
}

export type InsightsResponse = {
  month: string
  prevMonth: string
  insights: Insight[]
  health?: HealthScorecard
  todaysMoves?: DecisionAction[]
  risks?: RiskItem[]
  invest?: InvestSuggestion
  disclaimer?: string
}

export type DecisionsResponse = {
  health: HealthScorecard
  actions: DecisionAction[]
  todaysMoves: DecisionAction[]
  risks: RiskItem[]
  invest: InvestSuggestion
  disclaimer: string
  isEmpty?: boolean
}

export type TransactionDto = {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  merchant?: string
  note?: string
  occurredAt: string | Date
}

