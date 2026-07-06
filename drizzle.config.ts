import { defineConfig } from 'drizzle-kit';



export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  out: "./migrations",
  schema: "./src/db/schema",
  dbCredentials: {
    accountId: process.env.CF_ACCOUNT_ID!,
    databaseId: process.env.CF_DATABASE_ID!,
    token: process.env.CF_AUTH_TOKEN!,
  }
})
