import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const res = await c.env.enx.prepare("SELECT * FROM users").run();
  console.log(res);
  return c.text("Hello, Hono!");
});


export default app;
