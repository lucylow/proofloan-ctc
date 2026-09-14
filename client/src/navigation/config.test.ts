import { describe, expect, it } from "vitest";
import { createDemoData } from "@/demo/createDemoData";
import {
  findNavigationItem,
  getApplicationDetailPath,
  getBreadcrumbs,
  getSiblingNavItems,
  navigationItems,
  parseWorkspacePath,
} from "./config";
import { WORKSPACE_PATHS } from "./catalog";
import { getNavigationBadges } from "./navBadges";

describe("workspace path parsing", () => {
  it("treats nested application tabs as the applications family", () => {
    expect(findNavigationItem("/applications/PL-7F42A91C/evidence")?.id).toBe(
      "applications",
    );

    expect(parseWorkspacePath("/applications/PL-7F42A91C/evidence")).toEqual({
      kind: "application",
      path: "/applications/PL-7F42A91C/evidence",
      applicationId: "PL-7F42A91C",
      section: "evidence",
      unknownSection: false,
    });
  });

  it("flags unknown application sections without dropping the id", () => {
    expect(parseWorkspacePath("/applications/PL-1/unknown")).toMatchObject({
      applicationId: "PL-1",
      section: "overview",
      unknownSection: true,
    });
  });

  it("builds application breadcrumbs without duplicating the list page", () => {
    expect(getBreadcrumbs("/applications/PL-7F42A91C/offer")).toEqual([
      { label: "Applications", path: "/applications" },
      { label: "PL-7F42A91C", path: "/applications/PL-7F42A91C" },
      { label: "Offer", path: "/applications/PL-7F42A91C/offer" },
    ]);
  });

  it("omits redundant section homes on landing pages", () => {
    expect(getBreadcrumbs("/dashboard")).toEqual([
      { label: "Dashboard", path: "/dashboard" },
    ]);
    expect(getBreadcrumbs("/activity")).toEqual([
      { label: "Activity", path: "/activity" },
    ]);
    expect(getBreadcrumbs("/applications")).toEqual([
      { label: "Borrow", path: "/borrow" },
      { label: "Applications", path: "/applications" },
    ]);
  });

  it("exposes sibling pages for section navigation", () => {
    const siblings = getSiblingNavItems("/evidence").map(item => item.id);
    expect(siblings).toEqual(["credit-file", "evidence", "readability", "transaction-proving", "attestor-settings", "governance", "demo-data", "ai-mock", "decisions"]);
    expect(getSiblingNavItems("/applications/PL-1")).toEqual([]);
  });

  it("builds application detail paths", () => {
    expect(getApplicationDetailPath("PL-1")).toBe("/applications/PL-1");
    expect(getApplicationDetailPath("PL-1", "decision")).toBe(
      "/applications/PL-1/decision",
    );
  });

  it("exposes one nav item per catalog workspace path", () => {
    expect(navigationItems.map(item => item.path)).toEqual([...WORKSPACE_PATHS]);
  });
});

describe("navigation badges", () => {
  it("counts only active applications", () => {
    const data = createDemoData("hero");
    const badges = getNavigationBadges(data);
    const active = data.applications.filter(application =>
      !["Rejected", "Executed"].includes(application.state),
    ).length;

    expect(badges.applications).toBe(active > 0 ? active : undefined);
    expect(badges.offers).toBe(data.offers.length || undefined);
  });
});
