import { sha256Hex } from "../core/crypto";
export interface ChainExecutor { execute(target:string, selector:string, params:Record<string,unknown>, value:string):Promise<{txHash:string;accepted:boolean}>; }
export class DryRunChainExecutor implements ChainExecutor { async execute(target:string,selector:string,params:Record<string,unknown>,value:string){return {txHash:sha256Hex({target,selector,params,value}),accepted:true};} }
