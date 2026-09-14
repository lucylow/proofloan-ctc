import type { OperatorNodeConfig, RpcRole } from './types';
import { OperatorRpcManager } from './rpc';

export type DiagnosticResult = { id:string; ok:boolean; severity:'info'|'warning'|'error'; message:string; details?:Record<string,unknown> };

export class OperatorDiagnostics {
  constructor(private readonly rpc: OperatorRpcManager) {}
  static config(config: Partial<OperatorNodeConfig>): DiagnosticResult[] {
    return [
      check('config.name', !!config.name, 'Operator name configured.', 'Operator name is missing.'),
      check('config.secret', !!config.secret, 'Operator secret configured.', 'Operator secret is missing.'),
      check('config.chainKey', Number.isInteger(config.chainKey) && (config.chainKey ?? 0) > 0, 'Chain key configured.', 'Chain key is invalid.'),
      check('config.eth', !!config.eth?.url && /^(ws|wss):\/\//.test(config.eth.url), 'Ethereum WebSocket RPC configured.', 'Ethereum RPC must be ws:// or wss://.'),
      check('config.cc3', !!config.cc3?.url, 'CC3 RPC configured.', 'CC3 RPC is missing.'),
      check('config.p2p', !!config.p2pPort && config.p2pPort > 0, 'P2P port configured.', 'P2P port is missing.'),
      check('config.bootNodes', !!config.bootNodes?.length, 'Boot nodes configured.', 'No boot nodes are configured.'),
    ];
  }
  rpcResults(): DiagnosticResult[] {
    return (['cc3','ethereum'] as RpcRole[]).map(role => { const endpoints=this.rpc.list(role); const ok=endpoints.some(e=>e.healthy!==false); return {id:`rpc.${role}`,ok,severity:ok?'info':'error',message:ok?`${role} RPC has at least one usable endpoint.`:`${role} RPC has no usable endpoint.`,details:{count:endpoints.length}}; });
  }
  p2p(portOpen:boolean, publicAddress?:string):DiagnosticResult[] { return [ {id:'p2p.reachability',ok:portOpen,severity:portOpen?'info':'error',message:portOpen?`P2P endpoint ${publicAddress ?? 'configured'} is reachable.`:'P2P port is not reachable.'}, {id:'p2p.public-address',ok:!!publicAddress,severity:publicAddress?'info':'warning',message:publicAddress?'Stable public address configured.':'No stable public address configured; NAT changes may break peer reachability.'} ]; }
}
function check(id:string,ok:boolean,yes:string,no:string):DiagnosticResult { return {id,ok,severity:ok?'info':'error',message:ok?yes:no}; }