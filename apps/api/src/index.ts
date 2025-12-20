import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin, context) => {
			const trustedFrontend = context.env.WEB_URL;
			const apiKey = context.req.header("x-api-key");

			if (origin === trustedFrontend) {
				return origin;
			}

			if (apiKey) {
				return origin;
			}

			return trustedFrontend;
		},
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	})
);

app.get("/", (c) => c.text("OKkkkk"));

export default app;
