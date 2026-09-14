export type MemberStatus="pending"|"active"|"inactive"|"slashed"; export function canVote(status:MemberStatus){return status==="active";}
