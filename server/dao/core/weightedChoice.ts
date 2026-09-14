export function weightedChoice(forVotes:bigint,againstVotes:bigint):"for"|"against"|"tie"{return forVotes>againstVotes?"for":againstVotes>forVotes?"against":"tie";}
