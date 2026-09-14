import type { GovernanceMember } from "../core/types";
export function snapshotMembers(members:Map<string,GovernanceMember>): GovernanceMember[]{ return [...members.values()].map(m=>({...m})); }
export function totalPower(snapshot:GovernanceMember[]):bigint{return snapshot.filter(m=>m.active).reduce((s,m)=>s+m.votingPower,0n);}
