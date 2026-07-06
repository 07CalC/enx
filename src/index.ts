import { Hono } from "hono";


export type Bindings = {
	DB: D1Database;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_CLIENT_REDIRECT_URL: string;
	JWT_SECRET: string;
}


const app = new Hono<{ Bindings: Bindings }>();


export default app;
