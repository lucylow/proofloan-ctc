import type {SourceLog} from './types';
export function canonicalEvent(e:SourceLog){return{...e,chainId:e.chainId.trim(),contractAddress:e.contractAddress.toLowerCase(),eventName:e.eventName.trim(),transactionHash:e.transactionHash.toLowerCase(),blockHash:e.blockHash.toLowerCase(),topics:e.topics.map(x=>x.toLowerCase()),data:e.data.toLowerCase()}}
