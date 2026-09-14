export function assertFresh(validUntil:string,now=Date.now()){if(Date.parse(validUntil)<=now)throw new Error('attestation expired');return true}
export function assertBlock(hashA:string,hashB:string){if(hashA.toLowerCase()!==hashB.toLowerCase())throw new Error('attested block hash mismatch')}
