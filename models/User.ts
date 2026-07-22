import { Schema, model, models, type InferSchemaType } from "mongoose"

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },

    currency: { type: String, default: "INR" },
    cashBalance: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 },
    creditBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string }

export const User = models.User || model("User", UserSchema)

