import {describe,it,expect} from 'vitest';import {validateAscReceipt} from './result-validator';describe('receipt',()=>{it('rejects missing',()=>expect(()=>validateAscReceipt(null)).toThrow())})
