import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || ""

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var __mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null }
global.__mongooseCache = cached

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("Missing env var: MONGODB_URI")
  }
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "finsight",
      })
      .then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

