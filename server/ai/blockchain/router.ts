import type { AIBlockchainFeatures } from './featureTypes';
import { routeBlockchainFeatures } from './featureRouter';
export function aiBlockchainRoute(f:AIBlockchainFeatures){ return routeBlockchainFeatures(f); }
