import { Hono } from "hono"
import { Bindings } from "."
import { getDB } from "./db"
import { projects, environments } from "./db/schema"
import { requireAuth } from "./auth"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { and, eq } from "drizzle-orm"

export const environmentRouter = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>()

environmentRouter.use("*", requireAuth)

environmentRouter.get("/", async (c) => {
  try {
    const { projectName } = c.req.param() as { projectName: string }
    const userId = c.get("userId")
    const db = getDB(c.env.DB)

    const project = await db.query.projects.findFirst({
      where: (projects, { and, eq }) => and(eq(projects.name, projectName), eq(projects.userId, userId)),
    })

    if (!project) {
      return c.json({ data: null, error: { message: "Project not found", statusCode: 404 } }, 404)
    }

    const envs = await db.query.environments.findMany({
      where: (environments, { eq }) => eq(environments.projectId, project.id),
    })

    return c.json({ data: { environments: envs }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

environmentRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
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
      const { projectName } = c.req.param() as { projectName: string }
      const { name } = c.req.valid("json")
      const userId = c.get("userId")
      const db = getDB(c.env.DB)

      const project = await db.query.projects.findFirst({
        where: (projects, { and, eq }) => and(eq(projects.name, projectName), eq(projects.userId, userId)),
      })

      if (!project) {
        return c.json({ data: null, error: { message: "Project not found", statusCode: 404 } }, 404)
      }

      const [environment] = await db.insert(environments).values({
        projectId: project.id,
        name,
      }).returning()

      return c.json({ data: { environment }, error: null }, 201)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

environmentRouter.get("/:environmentName", async (c) => {
  try {
    const { projectName, environmentName } = c.req.param() as { projectName: string; environmentName: string }
    const userId = c.get("userId")
    const db = getDB(c.env.DB)

    const project = await db.query.projects.findFirst({
      where: (projects, { and, eq }) => and(eq(projects.name, projectName), eq(projects.userId, userId)),
    })

    if (!project) {
      return c.json({ data: null, error: { message: "Project not found", statusCode: 404 } }, 404)
    }

    const environment = await db.query.environments.findFirst({
      where: (environments, { and, eq }) => and(eq(environments.name, environmentName), eq(environments.projectId, project.id)),
    })

    if (!environment) {
      return c.json({
        data: null,
        error: { message: "Environment not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { environment }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

environmentRouter.patch(
  "/:environmentName",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
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
      const { name: newName } = c.req.valid("json")
      const userId = c.get("userId")
      const db = getDB(c.env.DB)

      const project = await db.query.projects.findFirst({
        where: (projects, { and, eq }) => and(eq(projects.name, projectName), eq(projects.userId, userId)),
      })

      if (!project) {
        return c.json({ data: null, error: { message: "Project not found", statusCode: 404 } }, 404)
      }

      const [environment] = await db.update(environments).set({ name: newName }).where(
        and(eq(environments.name, environmentName), eq(environments.projectId, project.id))
      ).returning()

      if (!environment) {
        return c.json({
          data: null,
          error: { message: "Environment not found", statusCode: 404 },
        }, 404)
      }

      return c.json({ data: { environment }, error: null }, 200)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

environmentRouter.delete("/:environmentName", async (c) => {
  try {
    const { projectName, environmentName } = c.req.param() as { projectName: string; environmentName: string }
    const userId = c.get("userId")
    const db = getDB(c.env.DB)

    const project = await db.query.projects.findFirst({
      where: (projects, { and, eq }) => and(eq(projects.name, projectName), eq(projects.userId, userId)),
    })

    if (!project) {
      return c.json({ data: null, error: { message: "Project not found", statusCode: 404 } }, 404)
    }

    const [environment] = await db.delete(environments).where(
      and(eq(environments.name, environmentName), eq(environments.projectId, project.id))
    ).returning()

    if (!environment) {
      return c.json({
        data: null,
        error: { message: "Environment not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { environment }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})
