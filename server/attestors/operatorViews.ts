import type { AttestorProfile } from "@shared/attestors";
import { publicAttestorView } from "./normalization";

export type OperatorDashboardCard = {
  operatorId: string;
  status: AttestorProfile["status"];
  stakeAtomic: string;
  weightBps: number;
  uptimeBps: number;
  rewardsAtomic: string;
  faults: number;
};

export function dashboardCards(profiles: AttestorProfile[]): OperatorDashboardCard[] {
  return profiles.map(p => ({ operatorId: p.operatorId, status: p.status, stakeAtomic: p.stakeAtomic, weightBps: p.weightBps, uptimeBps: p.uptimeBps, rewardsAtomic: p.rewardAtomic, faults: p.faultCount })).sort((a, b) => b.weightBps - a.weightBps);
}

export function publicList(profiles: AttestorProfile[]) { return profiles.map(publicAttestorView); }
