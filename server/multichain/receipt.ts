import { createRequire } from "node:module";
import { Contract, type InterfaceAbi } from "ethers";
import { utils } from "@gluwa/usc-sdk";
import {
  FAILED_RECEIPT_HEX,
  SUCCESS_RECEIPT_HEX,
  SUCCESS_RECEIPT_STATUS,
  type AttestcoinReceiptStatusHex,
} from "@shared/attestcoin";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { AttestcoinError } from "../attestcoin/errors";
import { getCachedAttestcoinEnvironment } from "./environment";
import { withCreditcoinRpc } from "./rpc";

export { SUCCESS_RECEIPT_HEX, SUCCESS_RECEIPT_STATUS, BLOCK_PROVER_PRECOMPILE };

export type DecodedSourceReceipt = {
  receiptStatus: number;
  receiptStatusHex: AttestcoinReceiptStatusHex;
};

export function receiptStatusHex(status: number): AttestcoinReceiptStatusHex {
  return status === SUCCESS_RECEIPT_STATUS ? SUCCESS_RECEIPT_HEX : FAILED_RECEIPT_HEX;
}

export function assertSuccessfulReceipt(status: number, requestId?: string) {
  if (status !== SUCCESS_RECEIPT_STATUS) {
    throw new AttestcoinError(
      "RECEIPT_FAILED",
      `Source transaction receipt status is ${receiptStatusHex(status)}; Attestcoin ASC requires status == 0x1 before business logic.`,
      { requestId },
    );
  }
}

function decoderAbi(): InterfaceAbi {
  const require = createRequire(import.meta.url);
  return require("@gluwa/usc-sdk/dist/utils/evmV1DecoderAbi.json") as unknown as InterfaceAbi;
}

export async function decodeSourceReceiptStatus(
  txBytes: string,
  requestId?: string,
): Promise<DecodedSourceReceipt> {
  try {
    return await withCreditcoinRpc(async provider => {
      const environment = getCachedAttestcoinEnvironment();
      const contract = new Contract(environment.decoderContract, decoderAbi(), provider);
      const decoded = await utils.decoder.decodeEvmV1Transaction(txBytes, contract);
      const receiptStatus = decoded.data.receipt.receiptStatus;
      return {
        receiptStatus,
        receiptStatusHex: receiptStatusHex(receiptStatus),
      };
    });
  } catch (error) {
    if (error instanceof AttestcoinError) throw error;
    throw new AttestcoinError(
      "DECODING",
      error instanceof Error
        ? error.message
        : "Failed to decode the Attestcoin source receipt.",
      { requestId, causeValue: error },
    );
  }
}
