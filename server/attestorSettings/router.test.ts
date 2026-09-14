import { describe, expect, it } from "vitest";
import { router } from "../_core/trpc";
import { attestorSettingsRouter } from "./router";

const settingsRouter = router({ attestorSettings: attestorSettingsRouter });
const ctx = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: {},
} as never;

const placeholderConfig = {
  name: "demo",
  chainKey: 3,
  secret: "one two three four five six seven eight nine ten eleven twelve",
  apiPort: 9100,
  p2pPort: 9000,
  noMdns: true,
  bootNodes: ["/ip4/1.2.3.4/tcp/9000/p2p/demo"],
  ethUrl: "wss://eth.example",
  cc3Url: "wss://rpc.cc3-testnet.creditcoin.network",
};

describe("Attestor settings router", () => {
  it("lists official chain keys and pinned release images", async () => {
    const caller = settingsRouter.createCaller(ctx);
    const list = await caller.attestorSettings.list();
    const mainnet = list.find(item => item.environment === "cc3-mainnet");
    const testnet = list.find(item => item.environment === "cc3-testnet");
    expect(mainnet?.chainKey).toBe(1);
    expect(testnet?.chainKey).toBe(3);
    expect(mainnet?.releaseImage).toBe("gluwa/creditcoin3:3.128.0-mainnet");
    expect(testnet?.releaseImage).toBe("gluwa/creditcoin3:3.128.0-testnet");
  });

  it("returns diagnostics and YAML without leaking extra secret fields", async () => {
    const caller = settingsRouter.createCaller(ctx);
    const diagnostics = await caller.attestorSettings.diagnostics({
      network: "cc3-testnet",
      config: placeholderConfig,
    });
    expect(diagnostics.validConfig).toBe(true);
    expect(diagnostics.chainKey).toBe(3);
    expect(JSON.stringify(diagnostics)).not.toMatch(/one two three/);

    const yaml = await caller.attestorSettings.configYaml({
      network: "cc3-testnet",
      config: placeholderConfig,
    });
    expect(yaml).toContain("chain_key: 3");
  });

  it("rejects YAML generation for invalid operator config", async () => {
    const caller = settingsRouter.createCaller(ctx);
    await expect(
      caller.attestorSettings.configYaml({
        network: "cc3-testnet",
        config: { ...placeholderConfig, secret: "not-a-valid-seed-phrase", cc3Url: "https://not-ws.example" },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringMatching(/PROOFLOAN_OPERATOR_ERROR/),
    });
  });

  it("includes election mode on network facts", async () => {
    const caller = settingsRouter.createCaller(ctx);
    const facts = await caller.attestorSettings.facts({ network: "cc3-testnet" });
    expect(facts.electionMode).toBe("AuthorizedOnly");
    expect(facts.chainKey).toBe(3);
  });

  it("plans AuthorizedOnly lifecycle actions without submitting them", async () => {
    const caller = settingsRouter.createCaller(ctx);
    const unauthorized = await caller.attestorSettings.lifecycle({
      network: "cc3-mainnet",
      status: "None",
      authorized: false,
    });
    expect(unauthorized.actions).toEqual(["authorize"]);
    expect(unauthorized.electionMode).toBe("AuthorizedOnly");
  });
});
