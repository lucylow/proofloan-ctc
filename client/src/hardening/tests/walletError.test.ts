import { describe, expect, it } from "vitest";
import { isUserRejectedWalletError, createWalletRejectedError } from "../walletError";

describe("wallet errors", () => {
  it("recognizes EIP-1193 user rejection", () => expect(isUserRejectedWalletError(new Error("4001 user rejected"))).toBe(true));
  it("creates a typed rejection", () => expect(createWalletRejectedError().code).toBe("WALLET_REJECTED"));
});
