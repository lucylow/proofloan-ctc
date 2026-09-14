import type {
  DemoApplicationState,
  DemoDataSet,
} from "@/demo/types";

export type StatusTone = "cyan" | "green" | "amber" | "red" | "slate";

export type ApplicationStateMeta = {
  label: string;
  tone: StatusTone;
};

export const APPLICATION_STATE_META: Record<
  DemoApplicationState,
  ApplicationStateMeta
> = {
  Draft: { label: "Draft", tone: "slate" },
  Submitted: { label: "Submitted", tone: "cyan" },
  VerifyingEvidence: { label: "Verifying evidence", tone: "amber" },
  EvidenceVerified: { label: "Evidence verified", tone: "cyan" },
  Scored: { label: "Underwritten", tone: "amber" },
  OfferReady: { label: "Offer ready", tone: "green" },
  Accepted: { label: "Accepted", tone: "green" },
  Executed: { label: "Executed", tone: "green" },
  Rejected: { label: "Rejected", tone: "red" },
  Paused: { label: "Paused", tone: "amber" },
};

const ACTIVE_STATES: DemoApplicationState[] = [
  "Draft",
  "Submitted",
  "VerifyingEvidence",
  "EvidenceVerified",
  "Scored",
  "OfferReady",
  "Accepted",
  "Paused",
];

export function getApplicationStateMeta(state: string): ApplicationStateMeta {
  return (
    APPLICATION_STATE_META[state as DemoApplicationState] ?? {
      label: state.replace(/([a-z])([A-Z])/g, "$1 $2"),
      tone: "slate",
    }
  );
}

export function isActiveApplicationState(state: string) {
  return ACTIVE_STATES.includes(state as DemoApplicationState);
}

export const APPLICATION_PROGRESS_STATES: DemoApplicationState[] = [
  "Draft",
  "Submitted",
  "VerifyingEvidence",
  "EvidenceVerified",
  "Scored",
  "OfferReady",
  "Accepted",
  "Executed",
];

export function getApplicationProgress(state: string) {
  if (state === "Rejected") {
    return 0;
  }

  const index = APPLICATION_PROGRESS_STATES.indexOf(state as DemoApplicationState);
  if (index < 0) {
    return 0.4;
  }

  return index / (APPLICATION_PROGRESS_STATES.length - 1);
}

export type NextBestAction = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
};

export function getNextBestAction(data: DemoDataSet): NextBestAction {
  const actionable = data.applications.find(
    application =>
      application.state === "OfferReady" ||
      application.state === "Accepted",
  );

  if (actionable) {
    return {
      eyebrow: "Next best action",
      title:
        actionable.state === "Accepted"
          ? "Finish Creditcoin execution"
          : "Review your ready offer",
      description: `${actionable.id} for $${actionable.amount.toLocaleString()} ${actionable.currency} is waiting on you.`,
      href: `/applications/${actionable.id}/offer`,
      label: "Review application",
    };
  }

  const inProgress = data.applications.find(application =>
    [
      "Draft",
      "Submitted",
      "VerifyingEvidence",
      "EvidenceVerified",
      "Scored",
      "Paused",
    ].includes(application.state),
  );

  if (inProgress) {
    return {
      eyebrow: "Next best action",
      title: "Continue your in-progress application",
      description: `${inProgress.id} is currently ${getApplicationStateMeta(inProgress.state).label.toLowerCase()}.`,
      href: `/applications/${inProgress.id}`,
      label: "Continue application",
    };
  }

  const aging = data.evidence.filter(
    item => item.freshness === "Aging" || item.freshness === "Stale",
  );

  if (aging.length > 0) {
    return {
      eyebrow: "Next best action",
      title: "Review aging evidence",
      description: `${aging.length} evidence record${aging.length === 1 ? " is" : "s are"} approaching the freshness threshold.`,
      href: "/evidence",
      label: "Review evidence",
    };
  }

  if (data.applications.length === 0) {
    return {
      eyebrow: "Get started",
      title: "Start your first verifiable credit application",
      description:
        "Prove eligible on-chain history to generate a bounded, auditable borrowing decision.",
      href: "/borrow",
      label: "Start application",
    };
  }

  return {
    eyebrow: "Next best action",
    title: "Start a new verifiable credit application",
    description:
      "Your workspace is current. Begin a new proof request when you want additional capacity.",
    href: "/borrow",
    label: "New application",
  };
}

export type ApplicationNextStep = {
  label: string;
  href: string;
};

export function getApplicationNextStep(application: {
  id: string;
  state: string;
}): ApplicationNextStep {
  if (application.state === "OfferReady") {
    return {
      label: "Review offer",
      href: `/applications/${application.id}/offer`,
    };
  }

  if (application.state === "Accepted") {
    return {
      label: "Finish execution",
      href: `/applications/${application.id}/offer`,
    };
  }

  if (application.state === "Executed") {
    return {
      label: "View credit file",
      href: "/credit-file",
    };
  }

  if (application.state === "Rejected") {
    return {
      label: "See decision",
      href: `/applications/${application.id}/decision`,
    };
  }

  if (application.state === "Paused") {
    return {
      label: "Resume",
      href: `/applications/${application.id}`,
    };
  }

  return {
    label: "Continue",
    href: `/applications/${application.id}`,
  };
}

export function formatOfferExpiry(isoDate: string) {
  const remaining = new Date(isoDate).getTime() - Date.now();

  if (Number.isNaN(remaining) || remaining <= 0) {
    return "Expired";
  }

  const minutes = Math.floor(remaining / 60_000);

  if (minutes < 1) {
    return "Expires now";
  }

  if (minutes < 60) {
    return `Expires in ${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Expires in ${hours}h`;
  }

  return `Expires in ${Math.floor(hours / 24)}d`;
}
