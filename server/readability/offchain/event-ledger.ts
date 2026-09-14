import type {IndexedEvent} from './types';
export class EventLedger{private map=new Map<string,IndexedEvent>();put(e:IndexedEvent){this.map.set(e.eventId,{...e})}get(id:string){return this.map.get(id)}all(){return [...this.map.values()]}}
