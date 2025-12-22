import { factory } from "@/lib";
import { createAuthMiddleware, requireAuth } from "@/middleware/auth";
import { createCorsMiddleware } from "@/middleware/cors";

export const v1API = factory().createApp();

v1API.use("/*", createCorsMiddleware());
v1API.use("/*", createAuthMiddleware());
v1API.use("/*", requireAuth);

v1API.get("/me", (c) => {
	const user = c.get("user");

	console.log(user);

	if (!user) {
		return c.json({ code: "Unauthorized" }, 401);
	}

	return c.json({ user });
});
