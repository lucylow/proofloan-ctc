import type { BlockchainObservation, VerifiedChainEvent } from './blockchainTypes';
export interface DemoBlockchainDataset { observations:BlockchainObservation[]; events:VerifiedChainEvent[]; }
export function emptyDemoDataset():DemoBlockchainDataset{return {observations:[],events:[]};}
