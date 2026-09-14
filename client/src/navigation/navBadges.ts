import type { DemoDataSet } from "@/demo/types";
import { isActiveApplicationState } from "./applicationState";

export type NavigationBadgeState = {
  applications?: number;
  offers?: number;
  evidence?: number;
  activity?: number;
};

export function getNavigationBadges(
  data?: Pick<DemoDataSet, "applications" | "offers" | "evidence" | "activity">,
): NavigationBadgeState {
  if (!data) {
    return {};
  }

  const applications = data.applications.filter(application =>
    isActiveApplicationState(application.state),
  ).length;
  const offers = data.offers.length;
  const evidence = data.evidence.length;
  const activity = data.activity.length;

  return {
    applications: applications > 0 ? applications : undefined,
    offers: offers > 0 ? offers : undefined,
    evidence: evidence > 0 ? evidence : undefined,
    activity: activity > 0 ? activity : undefined,
  };
}

export function badgeForNavItem(
  itemId: string,
  badges: NavigationBadgeState,
) {
  if (itemId === "applications") return badges.applications;
  if (itemId === "offers") return badges.offers;
  if (itemId === "evidence") return badges.evidence;
  if (itemId === "activity") return badges.activity;
  return undefined;
}
