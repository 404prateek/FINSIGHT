/**
 * FinSight Decision Engine
 * Rules own the truth (amounts, ranking, impact). No external LLM.
 */

export type Effort = "now" | "this_week" | "this_month"
export type ActionKind = "debt" | "emergency" | "budget" | "invest" | "goal" | "risk"
export type Severity = "success" | "info" | "warning" | "danger"

export type DecisionAction = {
  id: string
  kind: ActionKind
  priority: number
  title: string
  action: string
  why: string
  impact: string
  tradeoff?: string
  effort: Effort
  severity: Severity
  scoreDelta: number
  amountInr?: number
  inputs: Record<string, string | number>
}

export type HealthDriver = {
  id: string
  label: string
  score: number
  weight: number
  contribution: number
  detail: string
}

export type HealthScorecard = {
  score: number
  label: string
  drivers: HealthDriver[]
  topMover: string
}

export type RiskItem = {
  id: string
  severity: Severity
  title: string
  message: string
  moneyAtStakeInr?: number
  recommendedActionId?: string
}

export type InvestOption = {
  id: string
  name: string
  horizon: string
  suitability: string
  illustrativeYield: string
  allocationPct: number
  amountInr: number
}

export type InvestSuggestion = {
  allowed: boolean
  blockReason?: string
  surplusInr: number
  emergencyGapInr: number
  highInterestDebtInr: number
  headline: string
  why: string
  options: InvestOption[]
  disclaimer: string
}

export type FinancialProfile = {
  month: string
  currency: string
  monthlyIncome: number
  monthlyExpenses: number
  totalBudget: number
  cashBalance: number
  investments: number
  creditLimit: number
  creditBalance: number
  /** Illustrative personal loan / EMI debt at high interest */
  highInterestDebt: number
  savingsYieldPct: number
  debtInterestPct: number
  liquidYieldPct: number
  equityIllustrativePct: number
  emergencyMonthsTarget: number
  goals: Array<{
    title: string
    targetAmount: number
    currentAmount: number
    deadline?: string | null
    status: string
  }>
  spendByCategory: Record<string, number>
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`
}

function monthsToDeadline(deadline?: string | null) {
  if (!deadline) return null
  const ms = new Date(deadline).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  return ms / (1000 * 60 * 60 * 24 * 30.44)
}

export function buildHealthScorecard(p: FinancialProfile): HealthScorecard {
  const savings = p.monthlyIncome - p.monthlyExpenses
  const savingsRate = p.monthlyIncome > 0 ? savings / p.monthlyIncome : 0
  const creditUtil = p.creditLimit > 0 ? p.creditBalance / p.creditLimit : 0
  const monthlyBurn = Math.max(p.monthlyExpenses, 1)
  const efMonths = p.cashBalance / monthlyBurn
  const efRatio = clamp(efMonths / p.emergencyMonthsTarget, 0, 1.2)

  const debtBurden =
    p.monthlyIncome > 0
      ? clamp((p.creditBalance + p.highInterestDebt) / (p.monthlyIncome * 6), 0, 1.5)
      : 0

  const activeGoals = p.goals.filter((g) => g.status === "active")
  const goalProgress =
    activeGoals.length === 0
      ? 0
      : activeGoals.reduce((s, g) => s + clamp(g.currentAmount / Math.max(g.targetAmount, 1), 0, 1), 0) /
        activeGoals.length

  const overspendRatio =
    p.totalBudget > 0 ? Math.max(0, (p.monthlyExpenses - p.totalBudget) / p.totalBudget) : 0
  const budgetDiscipline = clamp(1 - overspendRatio, 0, 1)

  const rawDrivers: Omit<HealthDriver, "contribution">[] = [
    {
      id: "savings",
      label: "Savings rate",
      score: clamp(Math.round(savingsRate * 100 + 40), 0, 100),
      weight: 0.25,
      detail: `Saving ${Math.round(savingsRate * 100)}% of income (${inr(savings)}/mo)`,
    },
    {
      id: "emergency",
      label: "Emergency fund",
      score: clamp(Math.round(efRatio * 85), 0, 100),
      weight: 0.2,
      detail: `${efMonths.toFixed(1)} months cash vs ${p.emergencyMonthsTarget} month target`,
    },
    {
      id: "credit",
      label: "Credit utilization",
      score: clamp(Math.round(100 - creditUtil * 120), 0, 100),
      weight: 0.2,
      detail: `${Math.round(creditUtil * 100)}% of ${inr(p.creditLimit)} limit used`,
    },
    {
      id: "debt",
      label: "Debt burden",
      score: clamp(Math.round(100 - debtBurden * 70), 0, 100),
      weight: 0.15,
      detail: `High-interest debt ${inr(p.highInterestDebt)} + card ${inr(p.creditBalance)}`,
    },
    {
      id: "goals",
      label: "Goal progress",
      score: clamp(Math.round(goalProgress * 100), 0, 100),
      weight: 0.1,
      detail:
        activeGoals.length === 0
          ? "No active goals yet"
          : `${activeGoals.length} goal(s) at ~${Math.round(goalProgress * 100)}% average`,
    },
    {
      id: "budget",
      label: "Budget discipline",
      score: clamp(Math.round(budgetDiscipline * 100), 0, 100),
      weight: 0.1,
      detail:
        overspendRatio > 0
          ? `Over budget by ${Math.round(overspendRatio * 100)}%`
          : `On track vs ${inr(p.totalBudget)} budget`,
    },
  ]

  const drivers: HealthDriver[] = rawDrivers.map((d) => ({
    ...d,
    contribution: Math.round(d.score * d.weight),
  }))

  const score = clamp(
    Math.round(drivers.reduce((s, d) => s + d.score * d.weight, 0)),
    0,
    100
  )

  const sorted = [...drivers].sort((a, b) => a.score - b.score)
  const worst = sorted[0]
  const topMover =
    worst.score < 70
      ? `Biggest drag: ${worst.label} (${worst.score}/100) — fixing this moves your score most.`
      : `Strongest area: ${[...drivers].sort((a, b) => b.score - a.score)[0].label}. Keep compounding.`

  const label = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 45 ? "Needs attention" : "At risk"

  return { score, label, drivers, topMover }
}

export function buildActions(p: FinancialProfile, health: HealthScorecard): DecisionAction[] {
  const actions: DecisionAction[] = []
  const savings = p.monthlyIncome - p.monthlyExpenses
  const savingsRate = p.monthlyIncome > 0 ? savings / p.monthlyIncome : 0
  const creditUtil = p.creditLimit > 0 ? p.creditBalance / p.creditLimit : 0
  const monthlyBurn = Math.max(p.monthlyExpenses, 1)
  const efTarget = monthlyBurn * p.emergencyMonthsTarget
  const emergencyGap = Math.max(0, efTarget - p.cashBalance)
  const surplusAboveEf = Math.max(0, p.cashBalance - efTarget)

  // 1) High-interest debt vs idle cash (core differentiator)
  if (p.highInterestDebt > 0 && p.debtInterestPct > p.savingsYieldPct) {
    const prepay = Math.min(p.highInterestDebt, Math.max(surplusAboveEf * 0.5, Math.min(40000, surplusAboveEf)))
    if (prepay >= 5000 || p.highInterestDebt > 0) {
      const amount = prepay > 0 ? prepay : Math.min(p.highInterestDebt, Math.round(savings * 0.4) || 10000)
      const annualDrag = Math.round(amount * ((p.debtInterestPct - p.savingsYieldPct) / 100))
      actions.push({
        id: "prepay-high-interest",
        kind: "debt",
        priority: 100,
        title: "Clear expensive debt before investing",
        action: `Use ${inr(amount)} toward your ~${p.debtInterestPct}% debt (keep emergency fund intact).`,
        why: `Debt costs ~${p.debtInterestPct}% while idle cash earns ~${p.savingsYieldPct}% — a ~${(
          p.debtInterestPct - p.savingsYieldPct
        ).toFixed(1)}% net drag.`,
        impact: `Est. ${inr(annualDrag)}/year better outcome vs leaving cash idle; health score +6–10.`,
        tradeoff: `Do not touch the ${p.emergencyMonthsTarget}-month emergency buffer.`,
        effort: "this_week",
        severity: "danger",
        scoreDelta: 8,
        amountInr: amount,
        inputs: {
          debtInterestPct: p.debtInterestPct,
          savingsYieldPct: p.savingsYieldPct,
          highInterestDebt: p.highInterestDebt,
          amount,
        },
      })
    }
  }

  // 2) Credit utilization
  if (creditUtil >= 0.3) {
    const targetBal = p.creditLimit * 0.3
    const payDown = Math.max(0, Math.round(p.creditBalance - targetBal))
    actions.push({
      id: "pay-down-credit",
      kind: "debt",
      priority: creditUtil >= 0.5 ? 95 : 80,
      title: creditUtil >= 0.5 ? "Cut high credit utilization" : "Bring utilization under 30%",
      action: `Pay down ${inr(payDown)} on your card this week.`,
      why: `Utilization is ${Math.round(creditUtil * 100)}%. Above 30% often hurts score and raises risk.`,
      impact: `Moves credit driver up; estimated health score +${creditUtil >= 0.5 ? 7 : 4}.`,
      effort: "this_week",
      severity: creditUtil >= 0.5 ? "danger" : "warning",
      scoreDelta: creditUtil >= 0.5 ? 7 : 4,
      amountInr: payDown,
      inputs: { creditUtilPct: Math.round(creditUtil * 100), payDown, creditBalance: p.creditBalance },
    })
  }

  // 3) Emergency fund gap
  if (emergencyGap > 0) {
    const monthlyAdd = Math.max(2000, Math.round(Math.min(emergencyGap / 4, savings * 0.5 || 5000)))
    actions.push({
      id: "build-emergency-fund",
      kind: "emergency",
      priority: 90,
      title: "Build your emergency buffer",
      action: `Park ${inr(monthlyAdd)} this month in a liquid / savings bucket toward ${inr(efTarget)}.`,
      why: `You have ~${(p.cashBalance / monthlyBurn).toFixed(1)} months of expenses; target is ${p.emergencyMonthsTarget}.`,
      impact: `Closes ${inr(emergencyGap)} gap over time; reduces shock risk; score +5–9.`,
      tradeoff: "Prefer liquid instruments — not equity — until the buffer is full.",
      effort: "this_month",
      severity: emergencyGap > monthlyBurn * 2 ? "danger" : "warning",
      scoreDelta: 6,
      amountInr: monthlyAdd,
      inputs: { emergencyGap, efTarget, cashBalance: p.cashBalance },
    })
  }

  // 4) Budget overspend
  if (p.monthlyExpenses > p.totalBudget) {
    const over = p.monthlyExpenses - p.totalBudget
    const topCat = Object.entries(p.spendByCategory).sort((a, b) => b[1] - a[1])[0]
    actions.push({
      id: "stop-overspend",
      kind: "budget",
      priority: 85,
      title: "Stop budget bleed",
      action: topCat
        ? `Cap ${topCat[0]} this week and freeze non-essentials until you’re back under ${inr(p.totalBudget)}.`
        : `Cut discretionary spend by ${inr(over)} to get back on budget.`,
      why: `You’re over budget by ${inr(over)} this month.`,
      impact: `Frees ${inr(over)} for goals/debt; budget driver recovers.`,
      effort: "now",
      severity: over > p.totalBudget * 0.15 ? "danger" : "warning",
      scoreDelta: 5,
      amountInr: over,
      inputs: { over, totalBudget: p.totalBudget, topCategory: topCat?.[0] ?? "Other" },
    })
  }

  // 5) Goal at risk
  for (const g of p.goals.filter((x) => x.status === "active").slice(0, 2)) {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount)
    const monthsLeft = monthsToDeadline(g.deadline)
    if (remaining <= 0) continue
    if (monthsLeft !== null && monthsLeft > 0) {
      const needed = remaining / monthsLeft
      if (needed > savings * 0.35 && monthsLeft < 18) {
        actions.push({
          id: `goal-risk-${g.title.toLowerCase().replace(/\s+/g, "-")}`,
          kind: "goal",
          priority: 70,
          title: `Goal at risk: ${g.title}`,
          action: `Auto-transfer ${inr(needed)}/month toward “${g.title}”.`,
          why: `${inr(remaining)} left with ~${monthsLeft.toFixed(1)} months — current surplus may not cover it.`,
          impact: `Gets you on pace for the deadline; goal driver +4–6.`,
          effort: "this_month",
          severity: "warning",
          scoreDelta: 4,
          amountInr: Math.round(needed),
          inputs: { remaining, monthsLeft: Number(monthsLeft.toFixed(1)), needed: Math.round(needed) },
        })
      }
    } else if (g.currentAmount / g.targetAmount < 0.4) {
      actions.push({
        id: `goal-boost-${g.title.toLowerCase().replace(/\s+/g, "-")}`,
        kind: "goal",
        priority: 55,
        title: `Boost: ${g.title}`,
        action: `Add ${inr(Math.min(5000, remaining * 0.1))} this week to “${g.title}”.`,
        why: `Only ${Math.round((g.currentAmount / g.targetAmount) * 100)}% funded.`,
        impact: "Builds momentum and improves goal progress score.",
        effort: "this_week",
        severity: "info",
        scoreDelta: 3,
        amountInr: Math.round(Math.min(5000, remaining * 0.1)),
        inputs: { progressPct: Math.round((g.currentAmount / g.targetAmount) * 100) },
      })
    }
  }

  // 6) Invest surplus — only if debt/EF OK
  const invest = buildInvestSuggestion(p)
  if (invest.allowed && invest.surplusInr >= 5000) {
    const top = invest.options[0]
    actions.push({
      id: "invest-surplus",
      kind: "invest",
      priority: 60,
      title: "Put surplus to better use",
      action: `Deploy ${inr(invest.surplusInr)} — start with ${top.name} (~${top.allocationPct}%).`,
      why: invest.why,
      impact: `Illustrative benefit vs idle cash (~${p.savingsYieldPct}%): higher long-run potential for long-horizon buckets.`,
      tradeoff: "Markets can fall; keep emergency cash liquid.",
      effort: "this_month",
      severity: "success",
      scoreDelta: 3,
      amountInr: invest.surplusInr,
      inputs: { surplusInr: invest.surplusInr, option: top.name },
    })
  } else if (!invest.allowed && invest.blockReason) {
    actions.push({
      id: "invest-blocked",
      kind: "invest",
      priority: 40,
      title: "Investing can wait",
      action: invest.headline,
      why: invest.blockReason,
      impact: "Avoid earning less than your debt cost — clearing drag first is the higher-benefit move.",
      effort: "this_week",
      severity: "info",
      scoreDelta: 0,
      inputs: { blocked: 1 },
    })
  }

  // 7) Low savings rate
  if (savingsRate >= 0 && savingsRate < 0.15 && p.monthlyIncome > 0) {
    actions.push({
      id: "raise-savings-rate",
      kind: "budget",
      priority: 50,
      title: "Lift your savings rate",
      action: "Cut one recurring expense and auto-save that amount on payday.",
      why: `You’re saving ~${Math.round(savingsRate * 100)}% — aim for 20%+ when possible.`,
      impact: "Faster goals + stronger health score (+3–5).",
      effort: "this_month",
      severity: "warning",
      scoreDelta: 4,
      inputs: { savingsRatePct: Math.round(savingsRate * 100) },
    })
  }

  // Always surface top mover from scorecard if thin list
  if (actions.length < 2) {
    actions.push({
      id: "maintain-momentum",
      kind: "risk",
      priority: 20,
      title: "Stay the course",
      action: health.topMover,
      why: `Health score is ${health.score}/100 (${health.label}).`,
      impact: "Small consistent moves compound.",
      effort: "this_month",
      severity: "success",
      scoreDelta: 1,
      inputs: { healthScore: health.score },
    })
  }

  return actions.sort((a, b) => b.priority - a.priority)
}

export function buildRisks(p: FinancialProfile, actions: DecisionAction[]): RiskItem[] {
  const risks: RiskItem[] = []
  const creditUtil = p.creditLimit > 0 ? p.creditBalance / p.creditLimit : 0
  const monthlyBurn = Math.max(p.monthlyExpenses, 1)
  const efMonths = p.cashBalance / monthlyBurn
  const efTarget = monthlyBurn * p.emergencyMonthsTarget
  const surplusAboveEf = Math.max(0, p.cashBalance - efTarget)

  if (p.highInterestDebt > 0 && surplusAboveEf > 10000 && p.debtInterestPct > p.savingsYieldPct) {
    const stake = Math.round(Math.min(surplusAboveEf, p.highInterestDebt) * ((p.debtInterestPct - p.savingsYieldPct) / 100))
    risks.push({
      id: "interest-arbitrage",
      severity: "danger",
      title: "Interest arbitrage leak",
      message: `Idle cash above your emergency fund is earning less than your ~${p.debtInterestPct}% debt.`,
      moneyAtStakeInr: stake,
      recommendedActionId: "prepay-high-interest",
    })
  }

  if (efMonths < p.emergencyMonthsTarget) {
    risks.push({
      id: "ef-shortfall",
      severity: efMonths < 2 ? "danger" : "warning",
      title: "Emergency fund shortfall",
      message: `Only ${efMonths.toFixed(1)} months of expenses in cash (target ${p.emergencyMonthsTarget}).`,
      moneyAtStakeInr: Math.max(0, efTarget - p.cashBalance),
      recommendedActionId: "build-emergency-fund",
    })
  }

  if (creditUtil >= 0.4) {
    risks.push({
      id: "credit-stress",
      severity: creditUtil >= 0.6 ? "danger" : "warning",
      title: "Elevated credit stress",
      message: `Card utilization at ${Math.round(creditUtil * 100)}% raises score and cashflow risk.`,
      moneyAtStakeInr: p.creditBalance,
      recommendedActionId: "pay-down-credit",
    })
  }

  if (p.monthlyExpenses > p.totalBudget) {
    risks.push({
      id: "budget-breach",
      severity: "warning",
      title: "Budget breach",
      message: `Expenses exceed budget by ${inr(p.monthlyExpenses - p.totalBudget)}.`,
      moneyAtStakeInr: p.monthlyExpenses - p.totalBudget,
      recommendedActionId: "stop-overspend",
    })
  }

  const food = p.spendByCategory["Food"] ?? p.spendByCategory["Food & Dining"] ?? 0
  if (food > 0 && p.monthlyIncome > 0 && food / p.monthlyIncome > 0.18) {
    risks.push({
      id: "food-burn",
      severity: "info",
      title: "High food / dining share",
      message: `Food spend is ~${Math.round((food / p.monthlyIncome) * 100)}% of income — a common leak.`,
      moneyAtStakeInr: Math.round(food * 0.2),
      recommendedActionId: actions.find((a) => a.id === "stop-overspend")?.id,
    })
  }

  return risks
}

export function buildInvestSuggestion(p: FinancialProfile): InvestSuggestion {
  const disclaimer =
    "Educational decision support only — not SEBI-registered investment advice. Yields are illustrative, not guaranteed."

  const monthlyBurn = Math.max(p.monthlyExpenses, 1)
  const efTarget = monthlyBurn * p.emergencyMonthsTarget
  const emergencyGap = Math.max(0, efTarget - p.cashBalance)
  const surplus = Math.max(0, p.cashBalance - efTarget)
  const highDebt = p.highInterestDebt + (p.creditLimit > 0 && p.creditBalance / p.creditLimit >= 0.4 ? p.creditBalance : 0)

  if (highDebt > 0 && p.debtInterestPct > p.liquidYieldPct) {
    return {
      allowed: false,
      blockReason: `You still have ~${inr(p.highInterestDebt || highDebt)} costing ~${p.debtInterestPct}%. Clearing that usually beats investing at ~${p.liquidYieldPct}–${p.equityIllustrativePct}% illustrative returns.`,
      surplusInr: surplus,
      emergencyGapInr: emergencyGap,
      highInterestDebtInr: p.highInterestDebt,
      headline: `Prepay debt first — investing can wait`,
      why: "Highest-benefit use of surplus is reducing interest drag, not chasing market returns.",
      options: [],
      disclaimer,
    }
  }

  if (emergencyGap > 0) {
    return {
      allowed: false,
      blockReason: `Emergency fund is short by ${inr(emergencyGap)}. Park new money in liquid savings until you hit ${p.emergencyMonthsTarget} months.`,
      surplusInr: surplus,
      emergencyGapInr: emergencyGap,
      highInterestDebtInr: p.highInterestDebt,
      headline: "Fill emergency fund before equity SIPs",
      why: "Liquidity first — equity is the wrong tool for near-term shocks.",
      options: [
        {
          id: "liquid-ef",
          name: "Liquid / savings bucket",
          horizon: "0–12 months",
          suitability: "Emergency buffer",
          illustrativeYield: `~${p.liquidYieldPct}% p.a. (illustrative)`,
          allocationPct: 100,
          amountInr: Math.min(emergencyGap, Math.max(surplus, Math.round(p.monthlyIncome * 0.2))),
        },
      ],
      disclaimer,
    }
  }

  if (surplus < 5000) {
    return {
      allowed: false,
      blockReason: "No meaningful surplus above your emergency fund yet.",
      surplusInr: surplus,
      emergencyGapInr: 0,
      highInterestDebtInr: p.highInterestDebt,
      headline: "Build surplus before deploying",
      why: "Keep stacking cashflow until you have investable surplus.",
      options: [],
      disclaimer,
    }
  }

  const nearGoal = p.goals.find((g) => {
    const m = monthsToDeadline(g.deadline)
    return g.status === "active" && m !== null && m < 36 && g.currentAmount < g.targetAmount
  })

  const options: InvestOption[] = nearGoal
    ? [
        {
          id: "debt-short",
          name: "Short-duration / debt-oriented",
          horizon: "< 3 years",
          suitability: `Goal: ${nearGoal.title}`,
          illustrativeYield: `~${p.liquidYieldPct}% p.a. (illustrative)`,
          allocationPct: 70,
          amountInr: Math.round(surplus * 0.7),
        },
        {
          id: "hybrid",
          name: "Hybrid / conservative mix",
          horizon: "3–5 years",
          suitability: "Balanced growth with lower equity shock",
          illustrativeYield: `~${((p.liquidYieldPct + p.equityIllustrativePct) / 2).toFixed(0)}% p.a. (illustrative)`,
          allocationPct: 30,
          amountInr: Math.round(surplus * 0.3),
        },
      ]
    : [
        {
          id: "equity-sip",
          name: "Diversified equity SIP",
          horizon: "7+ years",
          suitability: "Long-term wealth (higher volatility)",
          illustrativeYield: `~${p.equityIllustrativePct}% p.a. long-run (illustrative)`,
          allocationPct: 60,
          amountInr: Math.round(surplus * 0.6),
        },
        {
          id: "liquid-park",
          name: "Liquid fund / FD ladder",
          horizon: "0–2 years",
          suitability: "Near-term goals & buffer top-up",
          illustrativeYield: `~${p.liquidYieldPct}% p.a. (illustrative)`,
          allocationPct: 25,
          amountInr: Math.round(surplus * 0.25),
        },
        {
          id: "goal-sip",
          name: "Goal-linked SIP",
          horizon: "Matches your goals",
          suitability: "Auto-route to active goals",
          illustrativeYield: "Varies by horizon",
          allocationPct: 15,
          amountInr: Math.round(surplus * 0.15),
        },
      ]

  return {
    allowed: true,
    surplusInr: surplus,
    emergencyGapInr: 0,
    highInterestDebtInr: p.highInterestDebt,
    headline: `Deploy ${inr(surplus)} surplus for better benefit`,
    why: `Emergency fund is funded and high-interest drag is controlled. Idle cash above buffer earns ~${p.savingsYieldPct}% — allocate by horizon for better expected benefit.`,
    options,
    disclaimer,
  }
}

export type ScenarioInput = {
  cutExpenseInr?: number
  extraEmiInr?: number
  extraInvestInr?: number
}

export type ScenarioResult = {
  baselineScore: number
  projectedScore: number
  delta: number
  monthlyFreed: number
  notes: string[]
}

export function simulateScenario(p: FinancialProfile, input: ScenarioInput): ScenarioResult {
  const cut = Math.max(0, input.cutExpenseInr ?? 0)
  const extraEmi = Math.max(0, input.extraEmiInr ?? 0)
  const extraInvest = Math.max(0, input.extraInvestInr ?? 0)

  const next: FinancialProfile = {
    ...p,
    monthlyExpenses: Math.max(0, p.monthlyExpenses - cut),
    highInterestDebt: Math.max(0, p.highInterestDebt - extraEmi * 6),
    creditBalance: Math.max(0, p.creditBalance - Math.min(extraEmi, p.creditBalance) * 0.5),
    cashBalance: Math.max(0, p.cashBalance - extraEmi - extraInvest + cut),
    investments: p.investments + extraInvest,
  }

  const baseline = buildHealthScorecard(p)
  const projected = buildHealthScorecard(next)
  const notes: string[] = []
  if (cut > 0) notes.push(`Cutting ${inr(cut)}/mo expenses improves savings rate.`)
  if (extraEmi > 0) notes.push(`Extra ${inr(extraEmi)} toward debt reduces interest drag.`)
  if (extraInvest > 0) notes.push(`Moving ${inr(extraInvest)} into investments (after EF/debt checks in real life).`)
  if (!notes.length) notes.push("Move the sliders to see score impact.")

  return {
    baselineScore: baseline.score,
    projectedScore: projected.score,
    delta: projected.score - baseline.score,
    monthlyFreed: cut,
    notes,
  }
}

export type DecisionBundle = {
  profile: FinancialProfile
  health: HealthScorecard
  actions: DecisionAction[]
  todaysMoves: DecisionAction[]
  risks: RiskItem[]
  invest: InvestSuggestion
  disclaimer: string
  /** True when user has not added income/expenses/cash/goals yet */
  isEmpty?: boolean
}

/** No activity yet — do not invent emergency-fund math from zeros. */
export function isEmptyProfile(p: FinancialProfile): boolean {
  return (
    p.monthlyIncome <= 0 &&
    p.monthlyExpenses <= 0 &&
    p.cashBalance <= 0 &&
    p.investments <= 0 &&
    p.creditBalance <= 0 &&
    p.highInterestDebt <= 0 &&
    p.totalBudget <= 0 &&
    p.goals.length === 0 &&
    Object.keys(p.spendByCategory).length === 0
  )
}

function emptyOnboardingBundle(profile: FinancialProfile): DecisionBundle {
  const disclaimer =
    "FinSight provides educational decision support, not personalized investment advice from a SEBI-registered adviser."

  const health: HealthScorecard = {
    score: 0,
    label: "Add data to score",
    drivers: [
      {
        id: "savings",
        label: "Savings rate",
        score: 0,
        weight: 0.25,
        contribution: 0,
        detail: "Add income and expenses to calculate",
      },
      {
        id: "emergency",
        label: "Emergency fund",
        score: 0,
        weight: 0.2,
        contribution: 0,
        detail: "Needs monthly spend + cash balance",
      },
      {
        id: "credit",
        label: "Credit utilization",
        score: 0,
        weight: 0.2,
        contribution: 0,
        detail: "Add credit limit/balance when available",
      },
      {
        id: "debt",
        label: "Debt burden",
        score: 0,
        weight: 0.15,
        contribution: 0,
        detail: "No debt recorded yet",
      },
      {
        id: "goals",
        label: "Goal progress",
        score: 0,
        weight: 0.1,
        contribution: 0,
        detail: "Create a goal to track progress",
      },
      {
        id: "budget",
        label: "Budget discipline",
        score: 0,
        weight: 0.1,
        contribution: 0,
        detail: "Set a monthly budget to start",
      },
    ],
    topMover: "Your account is empty. Add transactions, a budget, or a goal to unlock personalized moves.",
  }

  const starterMove: DecisionAction = {
    id: "onboarding-add-data",
    kind: "budget",
    priority: 100,
    title: "Add your first money data",
    action: "Log income/expenses, set a budget, or create a savings goal — then we’ll rank real next steps.",
    why: "There’s nothing to analyze yet. Recommendations need your numbers, not placeholders.",
    impact: "Unlocks health score, risk radar, and invest guidance tailored to you.",
    effort: "now",
    severity: "info",
    scoreDelta: 0,
    inputs: { empty: 1 },
  }

  return {
    profile,
    health,
    actions: [starterMove],
    todaysMoves: [starterMove],
    risks: [],
    invest: {
      allowed: false,
      blockReason: "Add income, expenses, and balances first. Investing suggestions need a real surplus picture.",
      surplusInr: 0,
      emergencyGapInr: 0,
      highInterestDebtInr: 0,
      headline: "No invest guidance yet",
      why: "Start by adding transactions or a budget so FinSight can see cashflow.",
      options: [],
      disclaimer,
    },
    disclaimer,
    isEmpty: true,
  }
}

export function runDecisionEngine(profile: FinancialProfile): DecisionBundle {
  if (isEmptyProfile(profile)) {
    return emptyOnboardingBundle(profile)
  }

  const health = buildHealthScorecard(profile)
  const actions = buildActions(profile, health)
  const risks = buildRisks(profile, actions)
  const invest = buildInvestSuggestion(profile)
  return {
    profile,
    health,
    actions,
    todaysMoves: actions.slice(0, 3),
    risks,
    invest,
    disclaimer:
      "FinSight provides educational decision support, not personalized investment advice from a SEBI-registered adviser.",
    isEmpty: false,
  }
}

/** Demo-rich INR profile that triggers debt-vs-invest and EF logic for demos */
/** Empty / starter profile for real signup users (no fake demo numbers). */
export function starterFinancialProfile(
  month: string,
  partial?: Partial<FinancialProfile>
): FinancialProfile {
  return {
    month,
    currency: "INR",
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalBudget: 0,
    cashBalance: 0,
    investments: 0,
    creditLimit: 0,
    creditBalance: 0,
    highInterestDebt: 0,
    savingsYieldPct: 6.5,
    debtInterestPct: 9,
    liquidYieldPct: 6.8,
    equityIllustrativePct: 12,
    emergencyMonthsTarget: 6,
    goals: [],
    spendByCategory: {},
    ...partial,
  }
}

/** Rich demo profile — only for the seeded demo account. */
export function demoFinancialProfile(month: string): FinancialProfile {
  return {
    month,
    currency: "INR",
    monthlyIncome: 75000,
    monthlyExpenses: 48000,
    totalBudget: 50000,
    // Cash above 6-mo EF so interest-arbitrage + "don't invest yet" stories both fire
    cashBalance: 420000,
    investments: 358500,
    creditLimit: 300000,
    creditBalance: 105000,
    highInterestDebt: 120000,
    savingsYieldPct: 6.5,
    debtInterestPct: 9,
    liquidYieldPct: 6.8,
    equityIllustrativePct: 12,
    emergencyMonthsTarget: 6,
    goals: [
      {
        title: "Emergency Fund",
        targetAmount: 288000,
        currentAmount: 288000,
        status: "active",
      },
      {
        title: "Vacation",
        targetAmount: 80000,
        currentAmount: 22000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 300).toISOString(),
        status: "active",
      },
    ],
    spendByCategory: {
      "Food & Dining": 12500,
      Shopping: 9200,
      "Utilities & Rent": 15000,
      "Entertainment & Hobbies": 6800,
      Transport: 4500,
    },
  }
}
