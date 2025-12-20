import { env } from "cloudflare:workers";
import { getAuth } from "@showly/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const auth = getAuth(env);
		const session = await auth.api.getSession({
			headers: getRequestHeaders(),
		});

		if (!session?.user) {
			return null;
		}

		return {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
		};
	}
);
