import type { server } from "../../alchemy.run";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

export type CloudflareEnv = typeof server.Env;

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  // biome-ignore lint/style/noNamespace: n/a
  namespace Cloudflare {
    // biome-ignore lint/nursery/noShadow: n/a
    export interface Env extends CloudflareEnv {}
  }
}
