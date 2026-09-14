import {
  JsonRpcProvider,
  Wallet,
  getAddress,
} from "ethers";
import { DeployError } from "./errors";
import {
  explorerAddressUrl,
  explorerTxUrl,
  type CreditcoinDeployNetwork,
} from "./networks";
import type { DeploymentPlan, PlannedDeployment } from "./plan";
import type { PreflightReport } from "./preflight";
import {
  type DeployedContractArtifact,
  type DeploymentArtifact,
  writeDeploymentArtifact,
} from "./artifacts";

export type DeployedContractResult = DeployedContractArtifact & {
  skipped: boolean;
};

export type DeploymentResult = {
  network: CreditcoinDeployNetwork;
  broadcast: boolean;
  deployer?: string;
  contracts: DeployedContractResult[];
  artifactPath?: string;
  preflight: PreflightReport;
};

function multiplyGas(estimate: bigint, multiplierBps: number): bigint {
  const scaled = (estimate * BigInt(multiplierBps)) / 100n;
  return scaled < 21000n ? 21000n : scaled;
}

async function deployOne(
  planned: PlannedDeployment,
  input: {
    wallet: Wallet;
    provider: JsonRpcProvider;
    network: CreditcoinDeployNetwork;
    nonce: number;
  },
): Promise<{ artifact: DeployedContractResult; nonce: number }> {
  const codeProbe = async (address: string) => {
    const code = await input.provider.getCode(address);
    return code && code !== "0x";
  };

  const feeData = await input.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  if (!gasPrice || gasPrice === 0n) {
    throw new DeployError(
      "NETWORK",
      `${input.network.label} did not return a usable gasPrice.`,
      { retriable: true },
    );
  }

  let gasEstimate: bigint;
  try {
    gasEstimate = await input.provider.estimateGas({
      from: input.wallet.address,
      data: planned.initCode,
    });
  } catch (error) {
    throw new DeployError(
      "BROADCAST",
      `Gas estimate failed for ${planned.name}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { retriable: true, cause: error },
    );
  }

  const tx = await input.wallet.sendTransaction({
    type: 0,
    data: planned.initCode,
    nonce: input.nonce,
    gasLimit: multiplyGas(gasEstimate, input.network.gasMultiplierBps),
    gasPrice,
    chainId: input.network.evmChainId,
  });
  const receipt = await tx.wait(input.network.minConfirmations);
  const address = receipt?.contractAddress;
  if (!address) {
    throw new DeployError(
      "BROADCAST",
      `${planned.name} transaction ${tx.hash} mined without a contract address.`,
    );
  }
  if (!(await codeProbe(address))) {
    throw new DeployError(
      "BROADCAST",
      `${planned.name} at ${address} has no bytecode after ${tx.hash}. Creditcoin Frontier rejected the deploy.`,
    );
  }

  return {
    nonce: input.nonce + 1,
    artifact: {
      name: planned.name,
      address: getAddress(address),
      txHash: tx.hash,
      explorerUrl: explorerAddressUrl(input.network, address),
      constructorArgs: planned.constructorArgs,
      skipped: false,
    },
  };
}

export async function executeDeployment(input: {
  network: CreditcoinDeployNetwork;
  plan: DeploymentPlan;
  preflight: PreflightReport;
  privateKey: string;
  broadcast: boolean;
}): Promise<DeploymentResult> {
  if (!input.broadcast) {
    return {
      network: input.network,
      broadcast: false,
      deployer: input.preflight.deployer?.address,
      contracts: input.plan.contracts.map(contract => ({
        name: contract.name,
        address: "",
        constructorArgs: contract.constructorArgs,
        skipped: true,
      })),
      preflight: input.preflight,
    };
  }

  if (input.preflight.rpc.chainId !== input.network.evmChainId) {
    throw new DeployError(
      "CHAIN_ID",
      `Refusing to broadcast: RPC chain ID ${input.preflight.rpc.chainId} does not match ${input.network.evmChainId}.`,
    );
  }
  if (!input.preflight.deployer) {
    throw new DeployError("CONFIG", "Preflight did not resolve a deployer account.");
  }
  if (input.preflight.deployer.balanceWei === "0") {
    throw new DeployError(
      "BALANCE",
      `Deployer ${input.preflight.deployer.address} needs ${input.network.nativeSymbol} on ${input.network.label}.`,
    );
  }

  const provider = new JsonRpcProvider(input.preflight.rpc.url, input.network.evmChainId, {
    staticNetwork: true,
  });
  const wallet = new Wallet(input.privateKey, provider);
  if (getAddress(wallet.address) !== getAddress(input.preflight.deployer.address)) {
    throw new DeployError("CONFIG", "Deployer key does not match the preflight account.");
  }

  const deployed: DeployedContractResult[] = [];
  let nonce = input.preflight.deployer.nonce;
  try {
    for (const planned of input.plan.contracts) {
      const result = await deployOne(planned, {
        wallet,
        provider,
        network: input.network,
        nonce,
      });
      nonce = result.nonce;
      deployed.push(result.artifact);
    }
  } finally {
    provider.destroy?.();
  }

  const artifact: DeploymentArtifact = {
    network: input.network.id,
    evmChainId: input.network.evmChainId,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    compiler: input.plan.compiler,
    evmVersion: input.plan.evmVersion,
    contracts: deployed.map(({ skipped: _skipped, ...rest }) => rest),
  };
  const artifactPath = writeDeploymentArtifact(artifact);

  return {
    network: input.network,
    broadcast: true,
    deployer: wallet.address,
    contracts: deployed,
    artifactPath,
    preflight: input.preflight,
  };
}

export function formatDeploymentResult(result: DeploymentResult): string {
  const lines = [
    `${result.broadcast ? "Broadcast" : "Dry-run"} on ${result.network.label} (chain ID ${result.network.evmChainId})`,
    `RPC ${result.preflight.rpc.url} @ block ${result.preflight.rpc.blockNumber}`,
  ];
  if (result.deployer) lines.push(`Deployer ${result.deployer}`);
  for (const contract of result.contracts) {
    if (!result.broadcast) {
      lines.push(`- ${contract.name}: planned`);
      continue;
    }
    const tx = contract.txHash ? ` tx ${explorerTxUrl(result.network, contract.txHash)}` : "";
    lines.push(`- ${contract.name}: ${contract.address}${tx}`);
  }
  if (result.artifactPath) lines.push(`Wrote ${result.artifactPath}`);
  return lines.join("\n");
}
