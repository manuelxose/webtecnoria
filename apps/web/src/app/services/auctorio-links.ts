export type AuctorioWorkspaceSlug = "tecnoria" | "guiaprogramaciontv" | "talkaris";

const AUCTORIO_PUBLIC_LOGIN_URL = "https://auctorio.com/login";

export function buildAuctorioPublicLoginUrl(options?: {
  workspace?: AuctorioWorkspaceSlug;
  returnTo?: string;
}): string {
  const query = new URLSearchParams();

  if (options?.workspace) {
    query.set("workspace", options.workspace);
  }

  if (options?.returnTo) {
    query.set("returnTo", options.returnTo);
  }

  const queryString = query.toString();
  return queryString
    ? `${AUCTORIO_PUBLIC_LOGIN_URL}?${queryString}`
    : AUCTORIO_PUBLIC_LOGIN_URL;
}
