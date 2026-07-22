import { Schema, model, models, type InferSchemaType, Types } from "mongoose"

const GoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, required: true, min: 0, default: 0 },
    deadline: { type: Date },
    status: { type: String, required: true, enum: ["active", "completed", "paused"], default: "active" },
  },
  { timestamps: true }
)

GoalSchema.index({ userId: 1, status: 1 })

export type GoalDoc = InferSchemaType<typeof GoalSchema> & { _id: string; userId: Types.ObjectId }

export const Goal = models.Goal || model("Goal", GoalSchema)

