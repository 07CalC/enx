import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  prefix: text("prefix").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
}, (table) => [
  index("api_keys_key_hash_index").on(table.keyHash),
  index("api_keys_user_id_index").on(table.userId),
])

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}))
