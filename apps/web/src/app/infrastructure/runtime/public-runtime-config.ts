export type PublicRuntimeConfig = {
  googleClientId?: string;
};

declare global {
  interface Window {
    __TECNORIA_RUNTIME__?: PublicRuntimeConfig;
  }
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  if (typeof window === "undefined") {
    return {};
  }

  return window.__TECNORIA_RUNTIME__ ?? {};
}
