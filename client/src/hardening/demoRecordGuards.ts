import type { DemoApplication, DemoEvidence, DemoOffer } from "@/demo/types";

export function isRenderableApplication(value: unknown): value is DemoApplication {
  const item = value as Partial<DemoApplication> | null;
  return Boolean(item && typeof item.id === "string" && typeof item.amount === "number" && typeof item.state === "string");
}

export function isRenderableEvidence(value: unknown): value is DemoEvidence {
  const item = value as Partial<DemoEvidence> | null;
  return Boolean(item && typeof item.id === "string" && typeof item.applicationId === "string" && typeof item.verified === "boolean");
}

export function isRenderableOffer(value: unknown): value is DemoOffer {
  const item = value as Partial<DemoOffer> | null;
  return Boolean(item && typeof item.id === "string" && typeof item.applicationId === "string" && typeof item.amount === "number");
}
