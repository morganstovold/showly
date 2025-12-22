import { getAuth } from "@showly/auth/server";
import { logger } from "hono/logger";
import { factory } from "./lib";
import { v1API } from "./v1/user";

const app = factory().createApp();

app.use(logger());

app.use("*", async (c, next) => {
	const auth = getAuth(c.env);
	c.set("auth", auth);
	await next();
});

app.get("/", (c) => c.json({ status: "ok", version: "1.0.0" }));
app.get("/health", (c) => c.json({ status: "healthy" }));

app.route("/v1", v1API);

app.notFound((c) =>
	c.json(
		{
			error: "Not Found",
			message: "The requested resource does not exist",
		},
		404
	)
);

app.onError((err, c) => {
	console.error(`Error: ${err.message}`, err);

	return c.json(
		{
			error: "Internal Server Error",
			message:
				process.env.NODE_ENV === "development"
					? err.message
					: "Something went wrong",
		},
		500
	);
});

export default app;
