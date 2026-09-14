import {
  Activity,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  FileSearch,
  Fingerprint,
  GitBranch,
  KeyRound,
  Landmark,
  Beaker,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { WorkspacePagePath } from "./catalog";
import {
  NAV_SECTION_LABELS,
  NAV_SECTION_ORDER,
  type BreadcrumbItem,
  type NavItem,
} from "./types";

export const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Your ProofLoan overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    section: "overview",
    keywords: ["home", "overview", "summary"],
    desktop: true,
    mobile: true,
    mobilePrimary: true,
  },

  {
    id: "borrow",
    label: "Borrow",
    description: "Create a new credit application",
    path: "/borrow",
    icon: CircleDollarSign,
    section: "borrowing",
    keywords: ["loan", "apply", "credit", "borrow"],
    desktop: true,
    mobile: true,
    mobilePrimary: true,
  },

  {
    id: "applications",
    label: "Applications",
    description: "Track your credit applications",
    path: "/applications",
    icon: ListChecks,
    section: "borrowing",
    keywords: ["applications", "loans", "requests"],
    desktop: true,
    mobile: true,
    mobilePrimary: true,
  },

  {
    id: "credit-file",
    label: "Credit File",
    description: "Verified on-chain credit profile",
    path: "/credit-file",
    icon: CreditCard,
    section: "credit",
    keywords: ["credit", "score", "profile", "risk"],
    desktop: true,
    mobile: true,
    mobilePrimary: true,
  },

  {
    id: "evidence",
    label: "Evidence",
    description: "Verified blockchain evidence",
    path: "/evidence",
    icon: FileSearch,
    section: "credit",
    keywords: ["proof", "attestation", "transactions", "chain"],
    desktop: true,
  },

  {
    id: "readability",
    label: "Readability",
    description: "Source-chain event to Block Prover pipeline",
    path: "/readability",
    icon: GitBranch,
    section: "credit",
    keywords: ["readability", "attestation", "merkle", "prover", "event"],
    desktop: true,
  },

  {
    id: "transaction-proving",
    label: "Proving",
    description: "Query, Merkle, continuity, and Block Prover verification",
    path: "/transaction-proving",
    icon: Fingerprint,
    section: "credit",
    keywords: ["proving", "merkle", "continuity", "transaction", "block prover", "query"],
    desktop: true,
  },

  {
    id: "attestor-settings",
    label: "Attestor Settings",
    description: "Per-chain CC3 Mainnet and Testnet Attestor operator settings",
    path: "/attestor-settings",
    icon: KeyRound,
    section: "credit",
    keywords: ["attestor", "chainkey", "cc3", "docker", "boot node", "authorized"],
    desktop: true,
  },

  {
    id: "governance",
    label: "Governance",
    description: "DAO control of RiskGuard, AI, Attestor, and ATC parameters",
    path: "/governance",
    icon: Landmark,
    section: "credit",
    keywords: ["dao", "governance", "proposal", "vote", "timelock", "riskguard", "constitution"],
    desktop: true,
  },

  {
    id: "demo-data",
    label: "Demo Data",
    description: "Mock evidence, fallback, and offline underwriting",
    path: "/demo",
    icon: Beaker,
    section: "credit",
    keywords: ["demo", "mock", "fallback", "synthetic", "judge", "catalog", "extended"],
    desktop: true,
  },

  {
    id: "ai-mock",
    label: "AI Mock Lab",
    description: "Deterministic AI underwriting scenarios and explanations",
    path: "/ai-mock",
    icon: Sparkles,
    section: "credit",
    keywords: ["ai", "mock", "scenario", "underwriting", "what-if", "explanation", "confidence"],
    desktop: true,
  },

  {
    id: "decisions",
    label: "Decisions",
    description: "AI-assisted underwriting decisions",
    path: "/decisions",
    icon: BarChart3,
    section: "credit",
    keywords: ["decision", "underwriting", "risk", "model"],
    desktop: true,
  },

  {
    id: "offers",
    label: "Offers",
    description: "Available loan offers",
    path: "/offers",
    icon: BriefcaseBusiness,
    section: "borrowing",
    keywords: ["offers", "apr", "loan", "liquidity"],
    desktop: true,
  },

  {
    id: "activity",
    label: "Activity",
    description: "Application and proof activity",
    path: "/activity",
    icon: Activity,
    section: "activity",
    keywords: ["activity", "history", "events", "audit"],
    desktop: true,
    mobile: true,
  },

  {
    id: "docs",
    label: "Documentation",
    description: "Learn how ProofLoan works",
    path: "/docs",
    icon: BookOpen,
    section: "resources",
    keywords: ["docs", "documentation", "help", "guide"],
    desktop: true,
  },

  {
    id: "support",
    label: "Support",
    description: "Get help with ProofLoan",
    path: "/support",
    icon: LifeBuoy,
    section: "resources",
    keywords: ["support", "help", "contact"],
    desktop: true,
  },

  {
    id: "settings",
    label: "Settings",
    description: "Application preferences",
    path: "/settings",
    icon: Settings,
    section: "resources",
    keywords: ["settings", "preferences", "account", "operator", "attestor"],
    desktop: true,
  },
];

export const APPLICATION_DETAIL_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    suffix: "",
    icon: ShieldCheck,
  },
  {
    id: "evidence",
    label: "Evidence",
    suffix: "/evidence",
    icon: FileCheck2,
  },
  {
    id: "decision",
    label: "Decision",
    suffix: "/decision",
    icon: BarChart3,
  },
  {
    id: "offer",
    label: "Offer",
    suffix: "/offer",
    icon: BriefcaseBusiness,
  },
  {
    id: "activity",
    label: "Activity",
    suffix: "/activity",
    icon: Activity,
  },
] as const;

export type ApplicationDetailSectionId =
  (typeof APPLICATION_DETAIL_SECTIONS)[number]["id"];

export const mobileNavigationItems = navigationItems.filter(
  item => item.mobile,
);

export const mobilePrimaryItems = navigationItems.filter(
  item => item.mobilePrimary,
);

export const desktopNavigationGroups = NAV_SECTION_ORDER.map(section => ({
  section,
  label: NAV_SECTION_LABELS[section],
  items: navigationItems.filter(item => item.section === section),
}));

export const workspacePagePaths = navigationItems.map(
  item => item.path,
) as WorkspacePagePath[];

export function normalizePathname(pathname: string) {
  const path = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function isApplicationDetailSection(
  value: string | undefined,
): value is ApplicationDetailSectionId {
  return APPLICATION_DETAIL_SECTIONS.some(section => section.id === value);
}

export function getApplicationDetailPath(
  applicationId: string,
  section: ApplicationDetailSectionId = "overview",
) {
  const match = APPLICATION_DETAIL_SECTIONS.find(item => item.id === section);
  return `/applications/${applicationId}${match?.suffix ?? ""}`;
}

export function findNavigationItem(pathname: string) {
  const path = normalizePathname(pathname);

  return navigationItems.find(item => {
    if (path === item.path) {
      return true;
    }

    if (item.path.length > 1 && path.startsWith(`${item.path}/`)) {
      return true;
    }

    return false;
  });
}

export type WorkspacePath =
  | {
      kind: "application";
      path: string;
      applicationId: string;
      section: ApplicationDetailSectionId;
      unknownSection: boolean;
    }
  | {
      kind: "page";
      path: string;
      item: NavItem | null;
    };

export function parseWorkspacePath(pathname: string): WorkspacePath {
  const path = normalizePathname(pathname);
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "applications" && parts[1]) {
    const sectionPart = parts[2];
    const unknownSection = Boolean(sectionPart) && !isApplicationDetailSection(sectionPart);

    return {
      kind: "application",
      path,
      applicationId: parts[1],
      section: isApplicationDetailSection(sectionPart) ? sectionPart : "overview",
      unknownSection,
    };
  }

  return {
    kind: "page",
    path,
    item: findNavigationItem(path) ?? null,
  };
}

export function getSectionLabel(pathname: string) {
  const parsed = parseWorkspacePath(pathname);

  if (parsed.kind === "application") {
    const section = APPLICATION_DETAIL_SECTIONS.find(
      item => item.id === parsed.section,
    );
    return section && parsed.section !== "overview"
      ? section.label
      : parsed.applicationId;
  }

  return parsed.item?.label ?? "ProofLoan";
}

export function getSiblingNavItems(pathname: string) {
  const parsed = parseWorkspacePath(pathname);

  if (parsed.kind === "application") {
    return [];
  }

  const item = parsed.item;
  if (!item) {
    return [];
  }

  return (
    desktopNavigationGroups.find(group => group.section === item.section)
      ?.items ?? []
  );
}

const sectionHome: Record<NavItem["section"], BreadcrumbItem> = {
  overview: { label: "Overview", path: "/dashboard" },
  borrowing: { label: "Borrow", path: "/borrow" },
  credit: { label: "Credit", path: "/credit-file" },
  activity: { label: "Activity", path: "/activity" },
  resources: { label: "Resources", path: "/docs" },
};

export function getBreadcrumbs(
  pathname: string,
  options?: { applicationLabel?: string },
) {
  const parsed = parseWorkspacePath(pathname);

  if (parsed.kind === "application") {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Applications", path: "/applications" },
      {
        label: options?.applicationLabel ?? parsed.applicationId,
        path: getApplicationDetailPath(parsed.applicationId),
      },
    ];

    if (parsed.section !== "overview") {
      const section = APPLICATION_DETAIL_SECTIONS.find(
        item => item.id === parsed.section,
      );

      breadcrumbs.push({
        label: section?.label ?? "Details",
        path: getApplicationDetailPath(parsed.applicationId, parsed.section),
      });
    }

    return breadcrumbs;
  }

  const item = parsed.item;

  if (!item) {
    return [{ label: "ProofLoan", path: "/dashboard" }];
  }

  const home = sectionHome[item.section];

  if (home.path === item.path) {
    return [{ label: item.label, path: item.path }];
  }

  return [home, { label: item.label, path: item.path }];
}
