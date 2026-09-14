import {sortEvents} from './event-order';
import type {SourceLog} from './types';
export class EventBuffer{private events:SourceLog[]=[];add(...events:SourceLog[]){this.events.push(...events);this.events=sortEvents(this.events)}drain(limit:number){const out=this.events.slice(0,limit);this.events=this.events.slice(limit);return out}size(){return this.events.length}clear(){this.events=[]}}
