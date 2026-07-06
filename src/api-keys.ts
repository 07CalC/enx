import { Hono } from "hono"
import { Bindings } from "."
import { getDB } from "./db"
import { apiKeys } from "./db/schema"
import { requireAuth } from "./auth"
import { generateApiKey } from "./utils"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { and, eq } from "drizzle-orm"

export const apiKeyRouter = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>()

apiKeyRouter.use("*", requireAuth)

apiKeyRouter.get("/", async (c) => {
  try {
    const userId = c.get("userId")
    const db = getDB(c.env.DB)

    const keys = await db.query.apiKeys.findMany({
      columns: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
      where: (apiKeys, { eq }) => eq(apiKeys.userId, userId),
    })

    return c.json({ data: { apiKeys: keys }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})

apiKeyRouter.post(
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

      const { key, hash, prefix } = await generateApiKey()

      await db.insert(apiKeys).values({
        userId,
        name,
        keyHash: hash,
        prefix,
      }).run()

      return c.json({ data: { apiKey: { name, prefix, key } }, error: null }, 201)
    } catch {
      return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
    }
  }
)

apiKeyRouter.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId")
    const { id } = c.req.param()
    const db = getDB(c.env.DB)

    const [key] = await db.delete(apiKeys).where(
      and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
    ).returning({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
    })

    if (!key) {
      return c.json({
        data: null,
        error: { message: "API key not found", statusCode: 404 },
      }, 404)
    }

    return c.json({ data: { apiKey: key }, error: null }, 200)
  } catch {
    return c.json({ data: null, error: { message: "Internal server error", statusCode: 500 } }, 500)
  }
})
