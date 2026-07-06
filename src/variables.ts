import { Hono } from "hono"
import { Bindings } from "."
import { getDB } from "./db"
import { environments, projects, variables } from "./db/schema"
import { requireAuth } from "./auth"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { and, eq, sql } from "drizzle-orm"

export const variableRouter = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>()

variableRouter.use("*", requireAuth)


variableRouter.get("/",
  zValidator("param", z.object({
    projectName: z.string().min(1),
    environmentName: z.string().min(1)
  }), (result, c) => {
    if (!result.success) {
      return c.json({
        data: null,
        error: { message: result.error.message, statusCode: 400 },
      }, 400)
    }
  }),
  async (c) => {
    const { projectName, environmentName } = c.req.valid("param")
    const userId = c.get("userId")
    const db = getDB(c.env.DB)
    try {
      const variableRecords = await db.select().from(variables)
        .leftJoin(environments, eq(variables.environmentId, environments.id))
        .leftJoin(projects, eq(environments.projectId, projects.id))
        .where(and(eq(projects.name, projectName), eq(environments.name, environmentName), eq(projects.userId, userId)))
      return c.json({ data: { variables: variableRecords }, error: null }, 200)
    } catch (error) {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)


variableRouter.post("/",
  zValidator("param", z.object({
    projectName: z.string().min(1),
    environmentName: z.string().min(1)
  }), (result, c) => {
    if (!result.success) {
      return c.json({
        data: null,
        error: { message: result.error.message, statusCode: 400 },
      }, 400)
    }
  }),
  zValidator("json", z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1)
  })), (result, c) => {
    if (!result.success) {
      return c.json({
        data: null,
        error: { message: result.error.message, statusCode: 400 },
      }, 400)
    }
  }),
  async (c) => {
    const { projectName, environmentName } = c.req.valid("param")
    const variablesData = c.req.valid("json")
    const userId = c.get("userId")
    const db = getDB(c.env.DB)
    try {
      const environmentRecord = await db.select().from(environments)
        .leftJoin(projects, eq(environments.projectId, projects.id))
        .where(and(eq(projects.name, projectName), eq(environments.name, environmentName), eq(projects.userId, userId)))
        .get()
      if (!environmentRecord) {
        return c.json({ data: null, error: { message: "Environment not found", statusCode: 404 } }, 404)
      }
      const environmentId = environmentRecord.environments.id
      const insertedVariables = await db.insert(variables).values(
        variablesData.map(variable => ({
          environmentId,
          key: variable.key,
          value: variable.value
        }))
      ).returning().onConflictDoUpdate({
        target: [variables.environmentId, variables.key],
        set: {
          value: sql`EXCLUDED.value`
        }
      })
      return c.json({ data: { variables: insertedVariables }, error: null }, 201)
    } catch (error) {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

