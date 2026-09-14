import type {
  DemoScenario,
  DemoDataSet,
} from "./types";

import { createDemoWallets } from "./generators/wallets";
import { createDemoApplications } from "./generators/applications";
import { createDemoEvidence } from "./generators/evidence";
import { createDemoDecisions } from "./generators/decisions";
import { createDemoOffers } from "./generators/offers";
import { createDemoActivity } from "./generators/activity";
import { createDemoNotifications } from "./generators/notifications";
import { createDemoServices } from "./generators/services";
import { createDemoCreditFile } from "./generators/creditFile";
import { createDemoPortfolio } from "./generators/portfolio";

import { applyScenario } from "./scenarios";

export function createDemoData(
  scenario: DemoScenario = "hero",
): DemoDataSet {
  const wallets = createDemoWallets();

  const applications =
    createDemoApplications();

  const evidence =
    createDemoEvidence(applications);

  const decisions =
    createDemoDecisions(applications);

  const offers =
    createDemoOffers(applications);

  const activity =
    createDemoActivity(applications);

  const notifications =
    createDemoNotifications();

  const services =
    createDemoServices();

  const creditFile =
    createDemoCreditFile(
      applications,
      evidence,
    );

  const portfolio =
    createDemoPortfolio(
      applications,
    );

  const dataset: DemoDataSet = {
    scenario,
    wallets,
    applications,
    evidence,
    decisions,
    offers,
    activity,
    notifications,
    services,
    creditFile,
    portfolio,
  };

  return applyScenario(
    dataset,
    scenario,
  );
}
