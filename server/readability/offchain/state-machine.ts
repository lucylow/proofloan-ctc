import type {WorkerPhase} from './types';
const transitions:Record<WorkerPhase,WorkerPhase[]>={created:['discovered','cancelled'],discovered:['matured','dead-letter'],matured:['proof-building','dead-letter'], 'proof-building':['proof-ready','dead-letter'], 'proof-ready':['submitting','dead-letter'],submitting:['submitted','dead-letter'],submitted:['confirmed','dead-letter'],confirmed:[], 'dead-letter':[],cancelled:[]};
export function canTransition(from:WorkerPhase,to:WorkerPhase){return transitions[from]?.includes(to)??false}
export function assertTransition(from:WorkerPhase,to:WorkerPhase){if(!canTransition(from,to))throw new Error(`illegal worker transition ${from} -> ${to}`)}
export function allowedNext(from:WorkerPhase){return [...(transitions[from]??[])]}
