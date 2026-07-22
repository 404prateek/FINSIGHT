export const TransactionCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Travel",
  "Education",
  "Investments",
  "Fees",
  "Other",
] as const

export type TransactionCategory = (typeof TransactionCategories)[number]

