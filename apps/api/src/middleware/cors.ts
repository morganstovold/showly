import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

const prRegex = /pr-(\d+)/;

export const createCorsMiddleware = (): MiddlewareHandler<{ Bindings: Env }> =>
	cors({
		origin: (origin, c) => {
			const webUrl = c.env.WEB_URL;

			// No origin = same-origin request (allow)
			if (!origin) {
				return webUrl;
			}

			// Parse URLs for comparison
			const originUrl = new URL(origin);
			const webHostname = new URL(webUrl).hostname;

			// Allow the app subdomain (app.showly.co or pr-123.app.showly.co)
			if (originUrl.hostname === webHostname) {
				return origin;
			}

			// Allow team subdomains in production (team1.showly.co, pr-123.team1.showly.co)
			if (isShowlySubdomain(originUrl.hostname, webUrl)) {
				return origin;
			}

			// Allow localhost for development
			if (originUrl.hostname === "localhost") {
				return origin;
			}

			return webUrl;
		},
		allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
		allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length", "X-Request-Id"],
		maxAge: 600,
		credentials: true, // Critical for cookies
	});

const isShowlySubdomain = (hostname: string, webUrl: string): boolean => {
	if (!hostname.endsWith(".showly.co")) {
		return false;
	}
	if (
		hostname.includes("app.showly.co") ||
		hostname.includes("api.showly.co")
	) {
		return false;
	}

	const prMatch = webUrl.match(prRegex);
	if (prMatch) {
		return hostname.startsWith(`pr-${prMatch[1]}.`);
	}

	return true;
};
