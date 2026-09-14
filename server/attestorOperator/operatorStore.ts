import type { OperatorOnChainState, OperatorHealthSnapshot, OperatorReadinessReport } from './types';

export class OperatorStateStore {
  private state?:OperatorOnChainState;
  private readiness?:OperatorReadinessReport;
  private health?:OperatorHealthSnapshot;
  setState(value:OperatorOnChainState){this.state=structuredClone(value)}
  setReadiness(value:OperatorReadinessReport){this.readiness=structuredClone(value)}
  setHealth(value:OperatorHealthSnapshot){this.health=structuredClone(value)}
  snapshot(){return {state:this.state?structuredClone(this.state):undefined,readiness:this.readiness?structuredClone(this.readiness):undefined,health:this.health?structuredClone(this.health):undefined}}
}