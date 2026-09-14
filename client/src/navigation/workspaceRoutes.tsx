import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import { WORKSPACE_PATHS, type WorkspacePagePath } from "./catalog";

type PageModule = { default: ComponentType };

export const workspacePageLoaders = {
  "/dashboard": () => import("@/pages/Dashboard"),
  "/borrow": () => import("@/pages/Borrow"),
  "/applications": () => import("@/pages/Applications"),
  "/credit-file": () => import("@/pages/CreditFile"),
  "/evidence": () => import("@/pages/Evidence"),
  "/readability": () => import("@/pages/Readability"),
  "/transaction-proving": () => import("@/pages/TransactionProving"),
  "/attestor-settings": () => import("@/pages/AttestorSettings"),
  "/governance": () => import("@/pages/Governance"),
  "/demo": () => import("@/pages/DemoData"),
  "/ai-mock": () => import("@/pages/AiMock"),
  "/decisions": () => import("@/pages/Decisions"),
  "/offers": () => import("@/pages/Offers"),
  "/activity": () => import("@/pages/Activity"),
  "/docs": () => import("@/pages/Docs"),
  "/support": () => import("@/pages/Support"),
  "/settings": () => import("@/pages/Settings"),
} satisfies Record<WorkspacePagePath, () => Promise<PageModule>>;

export const ApplicationDetail = lazy(() => import("@/pages/ApplicationDetail"));
export const Home = lazy(() => import("@/pages/Home"));
export const WorkspaceNotFound = lazy(() => import("@/pages/WorkspaceNotFound"));

export type WorkspacePageRoute = {
  path: WorkspacePagePath;
  Component: LazyExoticComponent<ComponentType>;
};

export const workspacePageRoutes: WorkspacePageRoute[] = WORKSPACE_PATHS.map(
  path => ({
    path,
    Component: lazy(workspacePageLoaders[path]),
  }),
);

export const APPLICATION_DETAIL_ROUTES = [
  "/applications/:id/:section",
  "/applications/:id",
] as const;
