import type { auth } from "@showly/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
});
