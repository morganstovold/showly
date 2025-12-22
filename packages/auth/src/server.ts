import { getDB } from "@showly/db/client";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";

type EnvWithBindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
	WEB_URL: string;
	API_URL: string;
	BETTER_AUTH_SECRET: string;
};

const PR_NUMBER_REGEX = /pr-\d+/;

export const getAuth = (env: EnvWithBindings) => {
	const db = getDB(env.HYPERDRIVE);

	const isLocal = env.WEB_URL.includes("localhost");
	const isPR =
		env.WEB_URL.includes(".app.showly.co") &&
		!env.WEB_URL.startsWith("https://app.showly.co");
	const isProd = env.WEB_URL === "https://app.showly.co";

	return betterAuth({
		secret: env.BETTER_AUTH_SECRET,
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
		baseURL: env.WEB_URL,

		advanced: {
			cookiePrefix: "showly",
			useSecureCookies: !isLocal, // HTTPS in prod & PR previews

			crossSubDomainCookies: {
				enabled: isProd || isPR, // Enable for all .showly.co subdomains
				domain: ".showly.co", // Works for app.showly.co, api.showly.co, pr-123.app.showly.co, team.showly.co
			},
		},

		trustedOrigins: [
			env.WEB_URL,
			env.API_URL,
			...(isProd
				? [
						"https://showly.co", // Marketing site
						"https://*.showly.co", // All subdomains (teams, etc)
					]
				: []),
			...(isPR
				? [
						// Extract PR number and allow those preview subdomains
						`https://${env.WEB_URL.match(PR_NUMBER_REGEX)?.[0]}.showly.co`,
					]
				: []),
			...(isLocal
				? [
						"http://localhost:3000", // showly.co (marketing)
						"http://localhost:3001", // app.showly.co
						"http://localhost:3002", // api.showly.co
					]
				: []),
		],
	});
};

export type Session = ReturnType<
	typeof getAuth
>["$Infer"]["Session"]["session"];
export type User = ReturnType<typeof getAuth>["$Infer"]["Session"]["user"];
