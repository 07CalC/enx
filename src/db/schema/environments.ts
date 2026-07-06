import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";
import { relations } from "drizzle-orm";




export const environments = sqliteTable("environments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("environments_name_index").on(table.name),
  uniqueIndex("environments_project_id_name_unique").on(table.projectId, table.name)
])

export const environmentsRelations = relations(environments, ({ one }) => ({
  project: one(projects, {
    fields: [environments.projectId],
    references: [projects.id],
  }),
}))
