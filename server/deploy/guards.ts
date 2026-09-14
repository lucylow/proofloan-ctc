import { DeployError } from "./errors";
import type { CreditcoinDeployNetwork } from "./networks";

export type DeployMode = "compile" | "preflight" | "dry-run" | "deploy";

export type DeployRequest = {
  network: CreditcoinDeployNetwork;
  mode: DeployMode;
  broadcast: boolean;
  privateKey?: string;
  guardian?: string;
  confirmMainnet: boolean;
  demoMode: boolean;
  allowMainnetDemo: boolean;
};

const TRUE_VALUES = new Set(["1", "true", "yes", "on", "confirm"]);

export function readFlag(value: string | undefined): boolean {
  if (!value) return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export function extractPrivateKey(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const raw =
    env.CREDITCOIN_DEPLOYER_PRIVATE_KEY ??
    env.CC3TEST_PRIVATE_KEY ??
    env.PRIVATE_KEY;
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new DeployError(
      "CONFIG",
      "Deployer private key must be a 32-byte hex value. Do not paste a mnemonic or address.",
    );
  }
  return normalized;
}

export function assertDeployGuards(request: DeployRequest): void {
  if (request.mode === "compile" || request.mode === "preflight") return;

  if (request.broadcast && request.network.requiresMainnetConfirmation && !request.confirmMainnet) {
    throw new DeployError(
      "GUARD",
      "Refusing to broadcast to Creditcoin Mainnet without CONFIRM_MAINNET=yes. Dry-run still works.",
    );
  }

  if (
    request.broadcast &&
    request.network.networkKind === "mainnet" &&
    request.demoMode &&
    !request.allowMainnetDemo
  ) {
    throw new DeployError(
      "GUARD",
      "Refusing a mainnet broadcast while PROOFLOAN_DEMO_MODE is enabled. Disable demo mode or set ALLOW_MAINNET_DEMO=true only for an explicit labeled demo.",
    );
  }

  if ((request.mode === "deploy" && request.broadcast) || request.mode === "dry-run") {
    if (request.broadcast && !request.privateKey) {
      throw new DeployError(
        "CONFIG",
        "Set CREDITCOIN_DEPLOYER_PRIVATE_KEY to broadcast a deployment. Omit --broadcast for a dry-run.",
      );
    }
  }
}

export function buildDeployRequest(
  network: CreditcoinDeployNetwork,
  options: {
    mode: DeployMode;
    broadcast?: boolean;
    env?: Record<string, string | undefined>;
  },
): DeployRequest {
  const env = options.env ?? process.env;
  const broadcast = Boolean(options.broadcast);
  return {
    network,
    mode: options.mode,
    broadcast,
    privateKey: extractPrivateKey(env),
    guardian: env.CREDITCOIN_DEPLOY_GUARDIAN?.trim(),
    confirmMainnet: readFlag(env.CONFIRM_MAINNET),
    demoMode: readFlag(env.PROOFLOAN_DEMO_MODE),
    allowMainnetDemo: readFlag(env.ALLOW_MAINNET_DEMO),
  };
}
