import { getDB } from "@showly/db/client";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";

type EnvWithBindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
};

export const getAuth = (env: EnvWithBindings) => {
	if (!env.HYPERDRIVE) {
		throw new Error(
			"HYPERDRIVE binding is required but not found in environment"
		);
	}
	if (!env.KV) {
		throw new Error("KV binding is required but not found in environment");
	}

	const db = getDB(env.HYPERDRIVE);

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
		}),
		emailAndPassword: {
			enabled: true,
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60,
			},
		},
		secondaryStorage: {
			get: async (key) => await env.KV.get(key),
			set: async (key, value, ttl) => {
				if (ttl) {
					await env.KV.put(key, value, { expirationTtl: ttl });
				} else {
					await env.KV.put(key, value);
				}
			},
			delete: async (key) => {
				await env.KV.delete(key);
			},
		},
	});
};
