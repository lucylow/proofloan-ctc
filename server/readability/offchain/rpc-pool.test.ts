import { describe, it, expect } from "vitest";
import { RpcPool } from "./rpc-pool";
import { WorkerError } from "./errors";

const source = (name: string, hash: string) => ({
  name,
  getLatestBlock: async () => 100,
  getBlockHash: async () => hash,
  getLogs: async () => [],
  getTransactionReceipt: async () => null,
});

describe("rpc pool", () => {
  it("uses quorum", async () => {
    const pool = new RpcPool([source("a", "x"), source("b", "x"), source("c", "y")], 2);
    expect(await pool.getBlockHash(1)).toBe("x");
  });

  it("rejects an empty source set as a typed config error", () => {
    expect(() => new RpcPool([])).toThrow(WorkerError);
    try {
      new RpcPool([]);
    } catch (error) {
      expect(error).toMatchObject({ code: "CONFIG", retryable: false });
    }
  });

  it("fails closed when block-hash quorum is unavailable", async () => {
    const pool = new RpcPool([source("a", "x"), source("b", "y")], 2);
    await expect(pool.getBlockHash(1)).rejects.toMatchObject({ code: "RPC_QUORUM", retryable: true });
  });
});
