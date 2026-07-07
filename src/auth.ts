import { Hono } from "hono";
import { Bindings } from ".";
import { getDB } from "./db";
import { users, apiKeys } from "./db/schema";
import { hashPassword, signJWT, verifyJWT, verifyPassword, hashApiKey } from "./utils";
import { getCookie, setCookie } from "hono/cookie"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { eq } from "drizzle-orm"

type GoogleTokenResponse = {
  access_token: string
  expires_in: number
}

type GoogleUserInfo = {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  picture: string
}


export const authRouter = new Hono<{ Bindings: Bindings }>()


authRouter.get("/google", async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET || !c.env.GOOGLE_CLIENT_REDIRECT_URL) {
    return c.json({ data: null, error: { message: "Google OAuth is disabled, add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CLIENT_REDIRECT_URL to enable", statusCode: 500 } }, 500);
  }
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.search = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: c.env.GOOGLE_CLIENT_REDIRECT_URL,
    response_type: 'code',
    scope: 'openid email profile',
  }).toString()

  return c.redirect(googleAuthUrl.toString())
})

authRouter.get("/google/callback", async (c) => {
  const code = c.req.query("code")
  if (!code) {
    return c.json({ error: "Missing code" }, 400)
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_CLIENT_REDIRECT_URL,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData: GoogleTokenResponse = await tokenResponse.json()

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  })
  const userInfo: GoogleUserInfo = await userInfoResponse.json()

  if (!userInfo.email || !userInfo.name) {
    return c.json({
      data: null,
      error: {
        message: "Failed to retrieve user info from Google",
        statusCode: 500,
      },
    }, 500)
  }
  const db = getDB(c.env.DB)
  const [user] = await db.insert(users).values({
    email: userInfo.email,
    name: userInfo.name,
    authProvider: "google",
  }).returning().onConflictDoUpdate({
    target: users.email,
    set: {
      name: userInfo.name,
      authProvider: "google",
    },
  })

  const jwt = await signJWT(user.id, c.env.JWT_SECRET)
  setCookie(c, "enx-token", jwt, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return c.json({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
      token: jwt,
    },
    error: null,
  }, 200)
})


authRouter.post(
  "/email/signup",
  zValidator(
    "json",
    z.object({
      email: z.email(),
      name: z.string().min(1),
      password: z.string().min(6),
    }),
    (result, c) => {
      if (!result.success) {
        return c.json(
          {
            data: null,
            error: {
              message: result.error.issues[0].message,
              statusCode: 400,
            },
          },
          400
        );
      }
    }
  ),
  async (c) => {
    const { email, name, password } = c.req.valid("json");
    const db = getDB(c.env.DB);

    const existingUser = await db.query.users.findFirst({
      columns: {
        id: true,
        passwordHash: true,
        authProvider: true,
      },
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      if (existingUser.authProvider !== "email") {
        return c.json(
          {
            data: null,
            error: {
              message:
                "This account was created using another sign-in method.",
              statusCode: 400,
            },
          },
          400
        );
      }

      return c.json(
        {
          data: null,
          error: {
            message: "An account with this email already exists.",
            statusCode: 409,
          },
        },
        409
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        authProvider: "email",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    const jwt = await signJWT(
      user.id,
      c.env.JWT_SECRET
    );

    setCookie(c, "enx-token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    return c.json(
      {
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token: jwt,
        },
        error: null,
      },
      201
    );
  }
);


authRouter.post(
  "/email/login",
  zValidator(
    "json",
    z.object({
      email: z.email(),
      password: z.string().min(6),
    }),
    (result, c) => {
      if (!result.success) {
        return c.json(
          {
            data: null,
            error: {
              message: result.error.issues[0].message,
              statusCode: 400,
            },
          },
          400
        );
      }
    }
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const db = getDB(c.env.DB);

    const existingUser = await db.query.users.findFirst({
      columns: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        authProvider: true,
      },
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!existingUser) {
      return c.json(
        {
          data: null,
          error: {
            message: "Invalid email or password",
            statusCode: 401,
          },
        },
        401
      );
    }

    if (!existingUser.passwordHash || existingUser.authProvider !== "email") {
      return c.json(
        {
          data: null,
          error: {
            message:
              "This account was created using another sign-in method.",
            statusCode: 400,
          },
        },
        400
      );
    }

    const valid = await verifyPassword(
      password,
      existingUser.passwordHash
    );

    if (!valid) {
      return c.json(
        {
          data: null,
          error: {
            message: "Invalid email or password",
            statusCode: 401,
          },
        },
        401
      );
    }

    const jwt = await signJWT(
      existingUser.id,
      c.env.JWT_SECRET
    );

    setCookie(c, "enx-token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    return c.json(
      {
        data: {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          },
          token: jwt,
        },
        error: null,
      },
      200
    );
  }
);

authRouter.get("/me", async (c) => {
  const token = getCookie(c, "enx-token");
  if (!token) {
    return c.json(
      {
        data: null,
        error: {
          message: "Not authenticated",
          statusCode: 401,
        },
      },
      401
    );
  }

  const userId = await verifyJWT(token, c.env.JWT_SECRET);
  if (!userId) {
    return c.json(
      {
        data: null,
        error: {
          message: "Invalid token",
          statusCode: 401,
        },
      },
      401
    );
  }
  const db = getDB(c.env.DB);
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      email: true,
      name: true,
    },
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user) {
    return c.json(
      {
        data: null,
        error: {
          message: "User not found",
          statusCode: 404,
        },
      },
      404
    );
  }

  return c.json(
    {
      data: {
        user,
      },
      error: null,
    },
    200
  );
})

export async function requireAuth(c: any, next: any) {
  const apiKeyHeader =
    c.req.header("x-api-key") ||
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  const token = getCookie(c, "enx-token");
  const db = getDB(c.env.DB);

  if (apiKeyHeader) {
    const keyHash = await hashApiKey(apiKeyHeader);

    const key = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq }) => eq(apiKeys.keyHash, keyHash),
    });

    if (key) {
      c.set("userId", key.userId);

      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, key.id));

      await next();
      return;
    }
  }

  if (token) {
    const userId = await verifyJWT(token, c.env.JWT_SECRET);

    if (userId) {
      const user = await db.query.users.findFirst({
        columns: {
          id: true,
        },
        where: (users, { eq }) => eq(users.id, userId),
      });

      if (user) {
        c.set("userId", userId);
        await next();
        return;
      }
    }
  }

  return c.json(
    {
      data: null,
      error: {
        message: "Not authenticated",
        statusCode: 401,
      },
    },
    401
  );
}
