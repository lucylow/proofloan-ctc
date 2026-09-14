import type {EventCursor} from './types';
export class CursorCheckpoint{private current?:EventCursor;save(cursor:EventCursor){this.current={...cursor}}load(){return this.current&&{...this.current}}}
