import type { getAuth, Session, User } from "@showly/auth/server";
import { createFactory } from "hono/factory";

export const factory = () =>
	createFactory<{
		Bindings: Env;
		Variables: {
			auth: ReturnType<typeof getAuth>;
			session: Session;
			user: User;
			userId: string;
		};
	}>();
