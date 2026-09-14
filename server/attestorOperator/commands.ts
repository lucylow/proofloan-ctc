import type { OperatorAction, OperatorActionPlan } from './types';

export type OperatorExtrinsic = { pallet:'attestation'; method:string; args:Record<string,unknown>; signingRole:'attestor'|'stash'|'governance'; dangerous:boolean };

export function buildExtrinsic(action:OperatorAction, input:{chainKey:number;attestorAddress:string}):OperatorExtrinsic|null{
  switch(action){
    case 'authorize': return {pallet:'attestation',method:'authorizeAttestor',args:{chainKey:input.chainKey,attestorId:input.attestorAddress},signingRole:'governance',dangerous:true};
    case 'register': return {pallet:'attestation',method:'registerAttestor',args:{chainKey:input.chainKey,attestorId:input.attestorAddress},signingRole:'stash',dangerous:true};
    case 'signal': return null;
    case 'chill': return {pallet:'attestation',method:'chill',args:{chainKey:input.chainKey,attestorId:input.attestorAddress},signingRole:'stash',dangerous:true};
    case 'unregister': return {pallet:'attestation',method:'unregisterAttestor',args:{chainKey:input.chainKey,attestorId:input.attestorAddress},signingRole:'stash',dangerous:true};
    case 'withdraw-unbonded': return {pallet:'attestation',method:'withdrawUnbonded',args:{},signingRole:'stash',dangerous:true};
    default: return null;
  }
}

export function commandExplanation(action:OperatorAction, plan:OperatorActionPlan):string[]{ return [`action=${action}`,`allowed=${plan.allowed}`,`risk=${plan.risk}`,...plan.steps.map(x=>`step: ${x}`),...plan.warnings.map(x=>`warning: ${x}`)]; }