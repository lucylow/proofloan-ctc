import { describe, expect, it } from "vitest";

import { isKnownRootRoute } from "@/hardening/routeRegistry";
import {
  KEYBOARD_SHORTCUTS,
  SAFE_ROUTES,
  STANDALONE_PATHS,
  WORKSPACE_PATHS,
} from "./catalog";
import { navigationItems } from "./config";

describe("navigation catalog", () => {
  it("keeps workspace nav paths aligned with the catalog", () => {
    expect(navigationItems.map(item => item.path)).toEqual([...WORKSPACE_PATHS]);
  });

  it("derives safe routes from standalone and workspace paths", () => {
    for (const path of [...STANDALONE_PATHS, ...WORKSPACE_PATHS]) {
      expect(SAFE_ROUTES.has(path)).toBe(true);
      expect(isKnownRootRoute(path)).toBe(true);
    }

    expect(isKnownRootRoute("/applications/PL-1/evidence")).toBe(true);
    expect(isKnownRootRoute("/evil/path")).toBe(false);
  });

  it("points keyboard shortcuts at known workspace pages", () => {
    for (const path of Object.values(KEYBOARD_SHORTCUTS)) {
      expect(WORKSPACE_PATHS).toContain(path);
    }
  });
});
