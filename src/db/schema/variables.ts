import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { environments } from "./environments";
import { relations } from "drizzle-orm";




export const variables = sqliteTable("variables", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  environmentId: text("environment_id").notNull().references(() => environments.id, {
    onDelete: "cascade",
  }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("variables_key_index").on(table.key),
  index("variables_environment_id_index").on(table.environmentId),
  uniqueIndex("variables_environment_id_key_unique").on(table.environmentId, table.key)
])


export const variablesRelations = relations(variables, ({ one }) => ({
  environment: one(environments, {
    fields: [variables.environmentId],
    references: [environments.id],
  }),
}))
