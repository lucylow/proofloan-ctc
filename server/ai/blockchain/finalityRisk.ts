export function finalityRisk(ageBlocks:number, requiredBlocks:number){ return ageBlocks>=requiredBlocks?0:Math.min(1,(requiredBlocks-ageBlocks)/Math.max(1,requiredBlocks)); }
