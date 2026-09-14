import type { LucideIcon } from "lucide-react";

import type { WorkspacePagePath } from "./catalog";

export type NavSection =
  | "overview"
  | "borrowing"
  | "credit"
  | "activity"
  | "resources";

export const NAV_SECTION_ORDER: NavSection[] = [
  "overview",
  "borrowing",
  "credit",
  "activity",
  "resources",
];

export const NAV_SECTION_LABELS: Record<NavSection, string> = {
  overview: "Overview",
  borrowing: "Borrow",
  credit: "Credit",
  activity: "Activity",
  resources: "Resources",
};

export type NavItem = {
  id: string;
  label: string;
  description: string;
  path: WorkspacePagePath;
  icon: LucideIcon;
  section: NavSection;
  badge?: string | number;
  keywords?: string[];
  mobile?: boolean;
  mobilePrimary?: boolean;
  desktop?: boolean;
};

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

export type WalletConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "wrong-network"
  | "error";

export type WalletInfo = {
  address: string;
  chainId: number;
  chainName: string;
};

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  path?: string;
  icon: LucideIcon;
  keywords?: string[];
};

export type PageTransitionDirection = "forward" | "back" | "same";
