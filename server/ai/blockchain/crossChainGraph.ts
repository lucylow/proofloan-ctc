export interface GraphEdge { from: string; to: string; chainId: string; value: number; timestampMs: number; verified: boolean; }
export interface GraphNode { id: string; chainIds: Set<string>; inDegree: number; outDegree: number; }
export class CrossChainGraph {
  readonly nodes = new Map<string, GraphNode>();
  readonly edges: GraphEdge[] = [];
  addEdge(edge: GraphEdge) {
    this.edges.push(edge);
    for (const id of [edge.from, edge.to]) {
      const n = this.nodes.get(id) ?? { id, chainIds:new Set<string>(), inDegree:0, outDegree:0 };
      n.chainIds.add(edge.chainId);
      if(id===edge.from) n.outDegree++; else n.inDegree++;
      this.nodes.set(id,n);
    }
  }
  degree(address: string){ const n=this.nodes.get(address); return (n?.inDegree??0)+(n?.outDegree??0); }
}
