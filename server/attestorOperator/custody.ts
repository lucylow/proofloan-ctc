export type CustodyProfile = { host: 'attestor-host'|'cold-storage'|'ops-workstation'; secretPresent: boolean; internetReachable: boolean; allowedPurpose: string };
export type CustodyRisk = { severity:'low'|'medium'|'high'; finding:string; remediation:string };

export function assessCustody(profile: CustodyProfile): CustodyRisk[] {
  const risks: CustodyRisk[]=[];
  if (profile.host==='attestor-host' && profile.secretPresent && profile.internetReachable) risks.push({severity:'medium',finding:'Hot signing material resides on an internet-reachable Attestor host.',remediation:'Keep only the Attestor/controller secret on the host; keep the Stash secret offline.'});
  if (profile.host==='cold-storage' && profile.secretPresent && profile.internetReachable) risks.push({severity:'high',finding:'Cold custody material is marked internet reachable.',remediation:'Remove network access and use an offline signing workflow.'});
  if (profile.allowedPurpose.toLowerCase().includes('stash') && profile.host==='attestor-host') risks.push({severity:'high',finding:'Stash custody is colocated with the Attestor.',remediation:'Move stash signing to cold or isolated custody.'});
  if (!profile.secretPresent) risks.push({severity:'low',finding:'No secret material is loaded in this runtime.',remediation:'Provide the Attestor secret through a secure secret manager when running the node.'});
  return risks;
}

export function custodySummary(risks: CustodyRisk[]): 'healthy'|'review'|'unsafe' { return risks.some(r=>r.severity==='high')?'unsafe':risks.some(r=>r.severity==='medium')?'review':'healthy'; }