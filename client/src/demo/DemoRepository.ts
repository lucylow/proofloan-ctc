import {
  createDemoData,
} from "./createDemoData";

import type {
  DemoApplication,
  DemoDecision,
  DemoEvidence,
  DemoOffer,
  DemoScenario,
} from "./types";

export class DemoRepository {
  private scenario: DemoScenario;

  constructor(
    scenario: DemoScenario = "hero",
  ) {
    this.scenario = scenario;
  }

  private get data() {
    return createDemoData(
      this.scenario,
    );
  }

  getApplications(): DemoApplication[] {
    return this.data.applications;
  }

  getApplication(
    id: string,
  ): DemoApplication | undefined {
    return this.data.applications.find(
      application =>
        application.id === id,
    );
  }

  getEvidence(
    applicationId?: string,
  ): DemoEvidence[] {
    const evidence =
      this.data.evidence;

    if (!applicationId) {
      return evidence;
    }

    return evidence.filter(
      item =>
        item.applicationId ===
        applicationId,
    );
  }

  getDecision(
    applicationId: string,
  ): DemoDecision | undefined {
    return this.data.decisions.find(
      item =>
        item.applicationId ===
        applicationId,
    );
  }

  getOffers(
    applicationId?: string,
  ): DemoOffer[] {
    const offers = this.data.offers;

    if (!applicationId) {
      return offers;
    }

    return offers.filter(
      item =>
        item.applicationId ===
        applicationId,
    );
  }
}

export const demoRepository =
  new DemoRepository("hero");
