import type { AiRiskMode, AiModelProfile } from "./aiTypes";
export function selectModel(mode:AiRiskMode, profiles:AiModelProfile[]):AiModelProfile|undefined{return profiles.find(p=>mode==="shadow"?p.status!=="disabled":p.status==="available");}
