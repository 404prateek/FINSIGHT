import { Schema, model, models, type InferSchemaType, Types } from "mongoose"

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    severity: { type: String, required: true, enum: ["info", "success", "warning", "danger"], default: "info" },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    kind: { type: String, required: true, default: "system" },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
)

NotificationSchema.index({ userId: 1, createdAt: -1 })

export type NotificationDoc = InferSchemaType<typeof NotificationSchema> & {
  _id: string
  userId: Types.ObjectId
}

export const Notification = models.Notification || model("Notification", NotificationSchema)

