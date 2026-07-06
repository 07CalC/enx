import { Hono } from "hono"
import { Bindings } from "."
import { getDB } from "./db"
import { projects } from "./db/schema"
import { requireAuth } from "./auth"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { and, eq } from "drizzle-orm"

export const projectRouter = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>()

projectRouter.use("*", requireAuth)

projectRouter.get("/", async (c) => {
  try {
    const userId = c.get("userId")
    const db = getDB(c.env.DB)

    const userProjects = await db.query.projects.findMany({
      where: (projects, { eq }) => eq(projects.userId, userId),
    })

    return c.json({ data: { projects: userProjects }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

projectRouter.post(
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
      const userId = c.get("userId")
      const { name } = c.req.valid("json")
      const db = getDB(c.env.DB)

      const [project] = await db.insert(projects).values({
        userId,
        name,
      }).returning()

      return c.json({ data: { project }, error: null }, 201)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

projectRouter.get("/:name", async (c) => {
  try {
    const userId = c.get("userId")
    const { name } = c.req.param()
    const db = getDB(c.env.DB)

    const project = await db.query.projects.findFirst({
      where: (projects, { and, eq }) => and(eq(projects.name, name), eq(projects.userId, userId)),
    })

    if (!project) {
      return c.json({
        data: null,
        error: { message: "Project not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { project }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

projectRouter.patch(
  "/:name",
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
      const userId = c.get("userId")
      const { name } = c.req.param()
      const { name: newName } = c.req.valid("json")
      const db = getDB(c.env.DB)

      const [project] = await db.update(projects).set({ name: newName }).where(
        and(eq(projects.name, name), eq(projects.userId, userId))
      ).returning()

      if (!project) {
        return c.json({
          data: null,
          error: { message: "Project not found", statusCode: 404 },
        }, 404)
      }

      return c.json({ data: { project }, error: null }, 200)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

projectRouter.delete("/:name", async (c) => {
  try {
    const userId = c.get("userId")
    const { name } = c.req.param()
    const db = getDB(c.env.DB)

    const [project] = await db.delete(projects).where(
      and(eq(projects.name, name), eq(projects.userId, userId))
    ).returning()

    if (!project) {
      return c.json({
        data: null,
        error: { message: "Project not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { project }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})
