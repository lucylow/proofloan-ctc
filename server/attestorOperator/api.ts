import type { OperatorAction, OperatorActionPlan, OperatorReadinessReport } from './types';
export type OperatorApi = {
  summary: {operatorId:string;environment:string;chainKey:number;status:string;readiness:string};
  readiness: OperatorReadinessReport;
  plan: OperatorActionPlan;
  metrics: Record<string,unknown>;
};
export function publicOperatorSummary(input:{operatorId:string;environment:string;chainKey:number;status:string;readiness:OperatorReadinessReport}):OperatorApi['summary']{return {operatorId:input.operatorId,environment:input.environment,chainKey:input.chainKey,status:input.status,readiness:input.readiness.readiness};}
export const supportedOperatorActions:OperatorAction[]=['authorize','register','signal','chill','unregister','withdraw-unbonded','restart','rotate-rpc','rotate-secret'];