import { compareChainToEnvironment } from "./compatibility";
import {
  findOfficialChain,
  getOfficialEnvironment,
  officialChains,
} from "./official";
import { AttestcoinError } from "../../attestcoin/errors";

export class OfficialAttestcoinRegistry {
  getEnvironment(id: string) {
    return getOfficialEnvironment(id);
  }

  getChain(environment: string, chain: string) {
    return findOfficialChain(environment, chain);
  }

  chains(environment: string) {
    return officialChains(environment);
  }

  assertChain(environment: string, chain: string) {
    const result = compareChainToEnvironment(chain, environment);
    if (!result.compatible) {
      throw new AttestcoinError(
        "UNSUPPORTED_CHAIN",
        `Unsupported chain/environment pair: ${environment}/${chain}. ${result.reasons.join("; ")}`,
      );
    }
    return this.getChain(environment, chain)!;
  }
}

export const officialRegistry = new OfficialAttestcoinRegistry();
