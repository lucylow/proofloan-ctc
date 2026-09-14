import type { AiModelProfile } from "./aiTypes"; import { DEFAULT_MODEL_PROFILE } from "./service";
export class AiModelRegistry{private readonly models=new Map<string,AiModelProfile>([[DEFAULT_MODEL_PROFILE.id,DEFAULT_MODEL_PROFILE]]); register(profile:AiModelProfile){this.models.set(profile.id,profile)} get(id:string){return this.models.get(id)} list(){return [...this.models.values()]}}
export const aiModelRegistry=new AiModelRegistry();
