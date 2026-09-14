import { describe, expect, it } from "vitest";
import { createDemoData } from "@/demo/createDemoData";
import {
  formatOfferExpiry,
  getApplicationNextStep,
  getApplicationProgress,
  getApplicationStateMeta,
  getNextBestAction,
  isActiveApplicationState,
} from "./applicationState";

describe("application state helpers", () => {
  it("labels known application states for the UI", () => {
    expect(getApplicationStateMeta("OfferReady")).toEqual({
      label: "Offer ready",
      tone: "green",
    });
    expect(getApplicationStateMeta("VerifyingEvidence").label).toBe(
      "Verifying evidence",
    );
    expect(isActiveApplicationState("Executed")).toBe(false);
    expect(isActiveApplicationState("OfferReady")).toBe(true);
    expect(getApplicationProgress("Draft")).toBe(0);
    expect(getApplicationProgress("Executed")).toBe(1);
    expect(getApplicationProgress("Rejected")).toBe(0);
  });

  it("points at a ready offer before generic borrowing", () => {
    const data = createDemoData("hero");
    const offerReady = data.applications.find(
      application => application.state === "OfferReady",
    );

    if (!offerReady) {
      data.applications[0].state = "OfferReady";
    }

    const action = getNextBestAction(data);
    expect(action.href).toMatch(/^\/applications\//);
    expect(action.href).toMatch(/\/offer$/);
    expect(action.label).toBe("Review application");
  });

  it("asks an empty workspace to start an application", () => {
    const data = createDemoData("empty");
    data.applications = [];
    data.evidence = [];

    expect(getNextBestAction(data)).toMatchObject({
      href: "/borrow",
      label: "Start application",
    });
  });

  it("routes each application to the next useful screen", () => {
    expect(getApplicationNextStep({ id: "PL-1", state: "OfferReady" })).toEqual({
      label: "Review offer",
      href: "/applications/PL-1/offer",
    });
    expect(getApplicationNextStep({ id: "PL-1", state: "Accepted" }).label).toBe(
      "Finish execution",
    );
    expect(getApplicationNextStep({ id: "PL-1", state: "Executed" }).href).toBe(
      "/credit-file",
    );
    expect(getApplicationNextStep({ id: "PL-1", state: "Draft" })).toEqual({
      label: "Continue",
      href: "/applications/PL-1",
    });
  });

  it("formats upcoming offer expiry", () => {
    const soon = new Date(Date.now() + 90 * 60_000).toISOString();
    expect(formatOfferExpiry(soon)).toBe("Expires in 1h");
    expect(formatOfferExpiry(new Date(Date.now() - 1_000).toISOString())).toBe(
      "Expired",
    );
  });
});
