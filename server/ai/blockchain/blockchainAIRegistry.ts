export interface BlockchainAIModule { name:string; version:string; enabled:boolean; }
export class BlockchainAIRegistry { private modules=new Map<string,BlockchainAIModule>(); register(m:BlockchainAIModule){this.modules.set(m.name,m);} get(name:string){return this.modules.get(name);} list(){return [...this.modules.values()];}}
