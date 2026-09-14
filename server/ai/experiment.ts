import type { AiRequest } from "./aiTypes"; import { aiUnderwritingService } from "./service";
export async function compareModes(input:AiRequest){const advisory=await aiUnderwritingService.decide({...input,mode:"advisory"});const shadow=await aiUnderwritingService.decide({...input,mode:"shadow"});return {advisory,shadow,confidenceDelta:shadow.decision.confidence-advisory.decision.confidence};}
