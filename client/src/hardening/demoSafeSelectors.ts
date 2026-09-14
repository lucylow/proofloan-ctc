import type { DemoDataSet } from "@/demo/types";

export function selectPrimaryApplication(data: DemoDataSet) {
  return data.applications.find(item => item.id === "PL-7F42A91C") ?? data.applications[0];
}

export function selectApplication(data: DemoDataSet, id: string | undefined) {
  if (!id) return undefined;
  return data.applications.find(item => item.id === id);
}

export function selectDecisionForApplication(data: DemoDataSet, id: string | undefined) {
  if (!id) return undefined;
  return data.decisions.find(item => item.applicationId === id);
}

export function selectOffersForApplication(data: DemoDataSet, id: string | undefined) {
  if (!id) return [];
  return data.offers.filter(item => item.applicationId === id);
}
