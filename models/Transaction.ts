import { Schema, model, models, type InferSchemaType, Types } from "mongoose"

import { TransactionCategories, type TransactionCategory } from "@/utils/categories"

const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    type: { type: String, required: true, enum: ["income", "expense"] },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, default: "Other" },
    merchant: { type: String, default: "" },
    note: { type: String, default: "" },
    occurredAt: { type: Date, required: true, index: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
)

TransactionSchema.index({ userId: 1, occurredAt: -1 })
TransactionSchema.index({ userId: 1, type: 1, occurredAt: -1 })

export type TransactionDoc = InferSchemaType<typeof TransactionSchema> & {
  _id: string
  userId: Types.ObjectId
}

export const Transaction = models.Transaction || model("Transaction", TransactionSchema)

export { TransactionCategories, type TransactionCategory }

