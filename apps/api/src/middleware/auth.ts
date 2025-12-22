import { getAuth } from "@showly/auth/server";
import { factory } from "@/lib";

// Initialize auth instance and attach to context
export function createAuthMiddleware() {
	return factory().createMiddleware(async (c, next) => {
		const auth = getAuth(c.env);

		c.set("auth", auth);
		await next();
	});
}

// Require authentication
export const requireAuth = factory().createMiddleware(async (c, next) => {
	const auth = c.get("auth");

	// Get session from cookie
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json(
			{
				error: "Unauthorized",
				message: "You must be logged in to access this resource",
			},
			401
		);
	}

	// Attach to context
	c.set("session", session.session);
	c.set("user", session.user);
	c.set("userId", session.user.id);

	await next();
});

// Optional authentication (attach session if present, but don't require)
export const optionalAuth = factory().createMiddleware(async (c, next) => {
	const auth = c.get("auth");

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (session) {
		c.set("session", session.session);
		c.set("user", session.user);
		c.set("userId", session.user.id);
	}

	await next();
});
