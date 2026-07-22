import { Schema, model, models, type InferSchemaType, Types } from "mongoose"

const BudgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    month: { type: String, required: true, index: true }, // YYYY-MM
    totalBudget: { type: Number, required: true, default: 0, min: 0 },
    categoryBudgets: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
)

BudgetSchema.index({ userId: 1, month: 1 }, { unique: true })

export type BudgetDoc = InferSchemaType<typeof BudgetSchema> & {
  _id: string
  userId: Types.ObjectId
}

export const Budget = models.Budget || model("Budget", BudgetSchema)

