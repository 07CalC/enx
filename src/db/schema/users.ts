import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";
import { relations } from "drizzle-orm";


type AuthProvider = "google" | "github" | "email";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  authProvider: text("auth_provider").notNull().$type<AuthProvider>().default("google"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email)
])

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}))
