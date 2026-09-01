/// <reference types="vite/client" />
/// <reference types="vinext/types" />

declare module "cloudflare:workers" {
  export const env: Record<string, any>;
}
