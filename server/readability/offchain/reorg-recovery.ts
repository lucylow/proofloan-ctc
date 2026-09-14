import type {DurableWorkerStore} from './store';
import {ReorgGuard} from './reorg';
export class ReorgRecovery{private readonly guard:ReorgGuard;constructor(store:DurableWorkerStore,key:string){this.guard=new ReorgGuard(store,key)}async verifyAndInvalidate(source:any,from:number,to:number){const changed=await this.guard.detectRange(source,from,to);return{changed,requiresRescan:changed.length>0}}}
