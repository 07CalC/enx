import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


type AuthProvider = "google" | "github" | "email";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  authProvider: text("auth_provider").notNull().$type<AuthProvider>().default("google"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
