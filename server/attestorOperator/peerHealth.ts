export type PeerRecord={peerId:string; address:string; reachable:boolean; latencyMs:number; lastSeenAt?:string; failures:number};
export type PeerSummary={total:number;reachable:number;averageLatencyMs:number;degraded:boolean};

export class PeerHealthBook {
  private peers=new Map<string,PeerRecord>();
  update(peer:PeerRecord):void{this.peers.set(peer.peerId,{...peer,lastSeenAt:peer.lastSeenAt??new Date().toISOString()});}
  list():PeerRecord[]{return [...this.peers.values()].map(p=>({...p}));}
  summary():PeerSummary{const a=this.list(); const reachable=a.filter(p=>p.reachable); const avg=reachable.length?reachable.reduce((s,p)=>s+p.latencyMs,0)/reachable.length:0; return {total:a.length,reachable:reachable.length,averageLatencyMs:Math.round(avg),degraded:a.length===0||reachable.length/a.length<0.5};}
}