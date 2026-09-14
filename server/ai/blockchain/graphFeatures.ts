import { CrossChainGraph } from './crossChainGraph';
export function graphCentrality(graph: CrossChainGraph, address: string): number {
  const d=graph.degree(address); return Math.min(1, d/50);
}
export function bridgeExposure(graph: CrossChainGraph, address: string): number {
  const node=graph.nodes.get(address); if(!node) return 0;
  return Math.min(1, Math.max(0,node.chainIds.size-1)/4);
}
