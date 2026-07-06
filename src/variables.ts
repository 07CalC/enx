import { Hono } from "hono"
import { Bindings } from "."
import { getDB } from "./db"
import { projects, environments, variables } from "./db/schema"
import { requireAuth } from "./auth"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { and, eq } from "drizzle-orm"

export const variableRouter = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>()

variableRouter.use("*", requireAuth)

async function resolveEnvironment(c: any, projectName: string, environmentName: string): Promise<string | null> {
  try {
    const userId = c.get("userId") as string
    const db = getDB(c.env.DB as D1Database)

    const project = await db.query.projects.findFirst({
      where: (projects, { and, eq }) => and(eq(projects.name, projectName), eq(projects.userId, userId)),
    })
    if (!project) return null

    const env = await db.query.environments.findFirst({
      where: (environments, { and, eq }) => and(eq(environments.name, environmentName), eq(environments.projectId, project.id)),
    })
    return env ? env.id : null
  } catch {
    return null
  }
}

variableRouter.get("/", async (c) => {
  try {
    const { projectName, environmentName } = c.req.param() as { projectName: string; environmentName: string }
    const db = getDB(c.env.DB)

    const environmentId = await resolveEnvironment(c, projectName, environmentName)
    if (!environmentId) {
      return c.json({ data: null, error: { message: "Environment not found", statusCode: 404 } }, 404)
    }

    const vars = await db.query.variables.findMany({
      where: (variables, { eq }) => eq(variables.environmentId, environmentId),
    })

    return c.json({ data: { variables: vars }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

variableRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      key: z.string().min(1),
      value: z.string(),
    }),
    (result, c) => {
      if (!result.success) {
        return c.json({
          data: null,
          error: { message: result.error.message, statusCode: 400 },
        }, 400)
      }
    }
  ),
  async (c) => {
    try {
      const { projectName, environmentName } = c.req.param() as { projectName: string; environmentName: string }
      const { key, value } = c.req.valid("json")
      const db = getDB(c.env.DB)

      const environmentId = await resolveEnvironment(c, projectName, environmentName)
      if (!environmentId) {
        return c.json({ data: null, error: { message: "Environment not found", statusCode: 404 } }, 404)
      }

      const [variable] = await db.insert(variables).values({
        environmentId,
        key,
        value,
      }).returning()

      return c.json({ data: { variable }, error: null }, 201)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

variableRouter.get("/:id", async (c) => {
  try {
    const { projectName, environmentName, id } = c.req.param() as { projectName: string; environmentName: string; id: string }
    const db = getDB(c.env.DB)

    const environmentId = await resolveEnvironment(c, projectName, environmentName)
    if (!environmentId) {
      return c.json({ data: null, error: { message: "Environment not found", statusCode: 404 } }, 404)
    }

    const variable = await db.query.variables.findFirst({
      where: (variables, { and, eq }) => and(eq(variables.id, id), eq(variables.environmentId, environmentId)),
    })

    if (!variable) {
      return c.json({
        data: null,
        error: { message: "Variable not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { variable }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

variableRouter.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      key: z.string().min(1).optional(),
      value: z.string().optional(),
    }).refine(data => data.key !== undefined || data.value !== undefined, {
      message: "At least one of key or value must be provided",
    }),
    (result, c) => {
      if (!result.success) {
        return c.json({
          data: null,
          error: { message: result.error.message, statusCode: 400 },
        }, 400)
      }
    }
  ),
  async (c) => {
    try {
      const { projectName, environmentName, id } = c.req.param() as { projectName: string; environmentName: string; id: string }
      const updates = c.req.valid("json")
      const db = getDB(c.env.DB)

      const environmentId = await resolveEnvironment(c, projectName, environmentName)
      if (!environmentId) {
        return c.json({ data: null, error: { message: "Environment not found", statusCode: 404 } }, 404)
      }

      const [variable] = await db.update(variables).set(updates).where(
        and(eq(variables.id, id), eq(variables.environmentId, environmentId))
      ).returning()

      if (!variable) {
        return c.json({
          data: null,
          error: { message: "Variable not found", statusCode: 404 },
        }, 404)
      }

      return c.json({ data: { variable }, error: null }, 200)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

variableRouter.delete("/:id", async (c) => {
  try {
    const { projectName, environmentName, id } = c.req.param() as { projectName: string; environmentName: string; id: string }
    const db = getDB(c.env.DB)

    const environmentId = await resolveEnvironment(c, projectName, environmentName)
    if (!environmentId) {
      return c.json({ data: null, error: { message: "Environment not found", statusCode: 404 } }, 404)
    }

    const [variable] = await db.delete(variables).where(
      and(eq(variables.id, id), eq(variables.environmentId, environmentId))
    ).returning()

    if (!variable) {
      return c.json({
        data: null,
        error: { message: "Variable not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { variable }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})
