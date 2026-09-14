import {WorkerError} from './errors';
export function validateAscReceipt(receipt:{status:number}|null){if(!receipt)throw new WorkerError('MISSING_RECEIPT','ASC receipt missing','transient');if(receipt.status!==1)throw new WorkerError('ASC_REVERTED','ASC transaction reverted','permanent');return true}
