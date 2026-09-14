export const STANDALONE_PATHS = ["/", "/intake", "/404"] as const;

export const WORKSPACE_PATHS = [
  "/dashboard",
  "/borrow",
  "/applications",
  "/credit-file",
  "/evidence",
  "/readability",
  "/transaction-proving",
  "/attestor-settings",
  "/governance",
  "/demo",
  "/ai-mock",
  "/decisions",
  "/offers",
  "/activity",
  "/docs",
  "/support",
  "/settings",
] as const;

export type StandalonePath = (typeof STANDALONE_PATHS)[number];
export type WorkspacePagePath = (typeof WORKSPACE_PATHS)[number];
export type AppPath = StandalonePath | WorkspacePagePath;

export const KEYBOARD_SHORTCUTS = {
  d: "/dashboard",
  b: "/borrow",
  a: "/applications",
  c: "/credit-file",
  e: "/evidence",
  r: "/readability",
  p: "/transaction-proving",
  k: "/attestor-settings",
  v: "/governance",
  m: "/demo",
  i: "/ai-mock",
  o: "/offers",
  s: "/settings",
  h: "/support",
} as const satisfies Record<string, WorkspacePagePath>;

export const SAFE_ROUTES = new Set<string>([
  ...STANDALONE_PATHS,
  ...WORKSPACE_PATHS,
]);

export function isWorkspacePagePath(path: string): path is WorkspacePagePath {
  return (WORKSPACE_PATHS as readonly string[]).includes(path);
}
