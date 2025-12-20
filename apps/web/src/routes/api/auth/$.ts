import { env } from "cloudflare:workers";
import { getAuth } from "@showly/auth/server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => {
				const auth = getAuth(env);
				return auth.handler(request);
			},
			POST: ({ request }) => {
				const auth = getAuth(env);
				return auth.handler(request);
			},
		},
	},
});
