import type { AIBlockchainFeatures } from './featureTypes';
export function modelContext(f:AIBlockchainFeatures){ return {verified:true,features:f,policy:{doNotInferMissingFacts:true,doNotTreatUnverifiedDataAsVerified:true}}; }
