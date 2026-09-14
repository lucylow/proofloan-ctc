import {digestObject} from './hash';
import type {SourceLog} from './types';
export function eventDigest(e:SourceLog){return digestObject({chainId:e.chainId,blockNumber:e.blockNumber,blockHash:e.blockHash,transactionHash:e.transactionHash,transactionIndex:e.transactionIndex,logIndex:e.logIndex,contractAddress:e.contractAddress,eventName:e.eventName,topics:e.topics,data:e.data})}
