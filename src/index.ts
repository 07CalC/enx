import { Hono } from "hono";
import { authRouter } from "./auth";
import { projectRouter } from "./projects";
import { environmentRouter } from "./environments";
import { variableRouter } from "./variables";

export type Bindings = {
	DB: D1Database;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_CLIENT_REDIRECT_URL: string;
	JWT_SECRET: string;
}

export type Variables = {
	userId: string;
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.route("/auth", authRouter);
app.route("/projects", projectRouter);
app.route("/projects/:projectName/environments", environmentRouter);
app.route("/projects/:projectName/environments/:environmentName/variables", variableRouter);

export default app;