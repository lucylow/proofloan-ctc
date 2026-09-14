import { JsonRpcProvider, Wallet, formatEther } from "ethers";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { DeployError } from "./errors";
import { resolveDeployRpcUrls, type CreditcoinDeployNetwork } from "./networks";
import type { DeploymentPlan } from "./plan";

export type RpcProbe = {
  url: string;
  chainId: number;
  blockNumber: number;
  gasPriceWei: string;
  ok: boolean;
  error?: string;
};

export type PreflightReport = {
  network: CreditcoinDeployNetwork;
  rpc: RpcProbe;
  deployer?: {
    address: string;
    balanceWei: string;
    balanceFormatted: string;
    nonce: number;
  };
  compiler: string;
  evmVersion: string;
  contractCount: number;
  issues: string[];
};

async function probeRpc(url: string, expectedChainId: number): Promise<RpcProbe> {
  const provider = new JsonRpcProvider(url);
  try {
    const [network, blockNumber, feeData] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getFeeData(),
    ]);
    const chainId = Number(network.chainId);
    if (chainId !== expectedChainId) {
      return {
        url,
        chainId,
        blockNumber,
        gasPriceWei: (feeData.gasPrice ?? 0n).toString(),
        ok: false,
        error: `RPC ${url} reported chain ID ${chainId}, expected ${expectedChainId}.`,
      };
    }
    return {
      url,
      chainId,
      blockNumber,
      gasPriceWei: (feeData.gasPrice ?? 0n).toString(),
      ok: true,
    };
  } catch (error) {
    return {
      url,
      chainId: 0,
      blockNumber: 0,
      gasPriceWei: "0",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    provider.destroy?.();
  }
}

export async function probeDeployNetwork(
  network: CreditcoinDeployNetwork,
  env: Record<string, string | undefined> = process.env,
): Promise<RpcProbe> {
  const urls = resolveDeployRpcUrls(network, env);
  const probes: RpcProbe[] = [];
  for (const url of urls) {
    const probe = await probeRpc(url, network.evmChainId);
    probes.push(probe);
    if (probe.ok) return probe;
  }
  throw new DeployError(
    "NETWORK",
    `Unable to reach ${network.label}. ${probes
      .map(item => item.error ?? `${item.url} failed`)
      .join(" ")}`,
    { retriable: true },
  );
}

export async function runPreflight(input: {
  network: CreditcoinDeployNetwork;
  plan: DeploymentPlan;
  privateKey?: string;
  env?: Record<string, string | undefined>;
  requireBalance?: boolean;
}): Promise<PreflightReport> {
  const issues: string[] = [];
  const rpc = await probeDeployNetwork(input.network, input.env);
  if (!rpc.ok) issues.push(rpc.error ?? "Creditcoin RPC probe failed.");

  let deployer: PreflightReport["deployer"];
  if (input.privateKey) {
    const provider = new JsonRpcProvider(rpc.url, input.network.evmChainId, {
      staticNetwork: true,
    });
    try {
      const wallet = new Wallet(input.privateKey, provider);
      const [balance, nonce] = await Promise.all([
        provider.getBalance(wallet.address),
        provider.getTransactionCount(wallet.address),
      ]);
      deployer = {
        address: wallet.address,
        balanceWei: balance.toString(),
        balanceFormatted: formatEther(balance),
        nonce,
      };
      if (input.requireBalance && balance === 0n) {
        issues.push(
          `Deployer ${wallet.address} has 0 ${input.network.nativeSymbol} on ${input.network.label}. Fund the account before broadcasting.`,
        );
      }
    } finally {
      provider.destroy?.();
    }
  }

  if (input.plan.evmVersion !== input.network.evmVersion) {
    issues.push(
      `Compiled evmVersion ${input.plan.evmVersion} does not match Creditcoin ${input.network.evmVersion}.`,
    );
  }
  if (input.plan.contracts.length === 0) {
    issues.push("Deployment plan has no contracts.");
  }

  // Precompiles typically return empty bytecode; only record a warning if the RPC is down.
  void BLOCK_PROVER_PRECOMPILE;

  if (issues.length > 0 && input.requireBalance) {
    throw new DeployError("CONFIG", issues.join(" "));
  }

  return {
    network: input.network,
    rpc,
    deployer,
    compiler: input.plan.compiler,
    evmVersion: input.plan.evmVersion,
    contractCount: input.plan.contracts.length,
    issues,
  };
}
