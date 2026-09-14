import { SAFE_ROUTES } from "@/navigation/catalog";

export { SAFE_ROUTES };

export function isKnownRootRoute(path: string) {
  const root = `/${path.split("/").filter(Boolean)[0] ?? ""}`;
  return SAFE_ROUTES.has(path) || SAFE_ROUTES.has(root);
}
