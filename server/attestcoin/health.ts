import type { AttestcoinHealth, AttestcoinSourceChain } from "@shared/attestcoin";
import { checkMultichainHealth } from "../multichain/health";

export async function checkAttestcoinHealth(
  sourceChain: AttestcoinSourceChain,
): Promise<AttestcoinHealth> {
  return checkMultichainHealth(sourceChain);
}
