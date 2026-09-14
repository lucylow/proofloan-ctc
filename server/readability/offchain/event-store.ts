import type {SourceLog} from './types';
import {eventId} from './event-id';
export class EventStore{private events=new Map<string,SourceLog>();put(event:SourceLog){const id=eventId(event);this.events.set(id,event);return id}get(id:string){return this.events.get(id)}has(id:string){return this.events.has(id)}all(){return [...this.events.values()]}}
