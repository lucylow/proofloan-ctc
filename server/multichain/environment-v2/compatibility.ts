import {
  MULTICHAIN_REGISTRY,
  isSourceChainId,
  type SourceChainId,
} from "@shared/multichain";
import {
  DOCUMENTED_DECODER_CONTRACTS,
  DOCUMENTED_OFFICIAL_CHAINKEYS,
  findOfficialChain,
  getOfficialEnvironment,
  isOfficialEnvironment,
  listOfficialEnvironmentIds,
} from "./official";

export type Compatibility = { compatible: boolean; reasons: string[] };

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function compareChainToEnvironment(
  chainId: string,
  environment: string,
): Compatibility {
  const descriptor = findOfficialChain(environment, chainId);
  if (!descriptor) {
    return {
      compatible: false,
      reasons: [`${chainId} is not listed for ${environment}`],
    };
  }
  const reasons: string[] = [];
  if (!descriptor.attestcoinEnabled) reasons.push("Attestcoin disabled");
  if (descriptor.chainKey === undefined) reasons.push("Missing chainKey");
  if (!descriptor.rpcUrl) reasons.push("Missing source RPC");
  return { compatible: reasons.length === 0, reasons };
}

export function compareEnvironments(a: string, b: string): Compatibility {
  if (!isOfficialEnvironment(a) || !isOfficialEnvironment(b)) {
    return {
      compatible: false,
      reasons: ["Unknown official Attestcoin environment"],
    };
  }
  const ea = getOfficialEnvironment(a);
  const eb = getOfficialEnvironment(b);
  const reasons: string[] = [];
  if (ea.decoderContract.toLowerCase() === eb.decoderContract.toLowerCase()) {
    reasons.push("Decoder contract is shared");
  }
  if (
    ea.blockProverPrecompile.toLowerCase() !==
    eb.blockProverPrecompile.toLowerCase()
  ) {
    reasons.push("Block Prover differs");
  }
  if (ea.chains.length !== eb.chains.length) {
    reasons.push("Enabled chain sets differ");
  }
  return { compatible: reasons.length <= 1, reasons };
}

export function operationalRegistryAlignmentIssues(): string[] {
  const issues: string[] = [];

  for (const environmentId of listOfficialEnvironmentIds()) {
    const official = getOfficialEnvironment(environmentId);
    const operational = MULTICHAIN_REGISTRY.environments[environmentId];
    const bindings = MULTICHAIN_REGISTRY.officialBindings[environmentId] ?? {};

    if (!operational) {
      issues.push(`Operational registry is missing ${environmentId}.`);
      continue;
    }

    if (
      operational.decoderContract.toLowerCase() !==
      official.decoderContract.toLowerCase()
    ) {
      issues.push(`${environmentId} decoder drifted from the official documentation registry.`);
    }
    if (
      operational.decoderContract.toLowerCase() !==
      DOCUMENTED_DECODER_CONTRACTS[environmentId].toLowerCase()
    ) {
      issues.push(`${environmentId} decoder drifted from documented Attestcoin Protocol addresses.`);
    }
    if (
      stripTrailingSlash(operational.proofBuilderUrl) !==
      stripTrailingSlash(official.proofBuilderUrl)
    ) {
      issues.push(`${environmentId} Proof Builder URL drifted from the official documentation registry.`);
    }
    if (
      official.chainInfoPrecompile.toLowerCase() !==
      operational.chainInfoPrecompile.toLowerCase()
    ) {
      issues.push(`${environmentId} ChainInfo precompile drifted.`);
    }
    if (
      official.blockProverPrecompile.toLowerCase() !==
      operational.blockProverPrecompile.toLowerCase()
    ) {
      issues.push(`${environmentId} Block Prover precompile drifted.`);
    }

    const officialIds = new Set(official.chains.map(chain => chain.id));
    const documentedKeys = DOCUMENTED_OFFICIAL_CHAINKEYS[environmentId] as Partial<
      Record<SourceChainId, number>
    >;

    for (const chain of official.chains) {
      const binding = bindings[chain.id];
      const documentedKey = documentedKeys[chain.id];
      if (documentedKey !== undefined && chain.chainKey !== documentedKey) {
        issues.push(
          `${environmentId}/${chain.id} official chainKey ${chain.chainKey} does not match documented ${documentedKey}.`,
        );
      }
      if (!binding) {
        issues.push(
          `${environmentId}/${chain.id} is official in documentation but missing from the operational registry.`,
        );
        continue;
      }
      if (binding.chainKey !== chain.chainKey) {
        issues.push(
          `${environmentId}/${chain.id} chainKey drifted (${binding.chainKey} vs official ${chain.chainKey}).`,
        );
      }
      if (binding.genesisBlock !== chain.genesisBlock) {
        issues.push(`${environmentId}/${chain.id} genesisBlock drifted.`);
      }
    }

    for (const [chainId, binding] of Object.entries(bindings) as Array<
      [string, { chainKey: number } | undefined]
    >) {
      if (!binding) continue;
      if (!isSourceChainId(chainId) || !officialIds.has(chainId as SourceChainId)) {
        issues.push(
          `${environmentId} operational registry invents an official binding for ${chainId}.`,
        );
      }
    }
  }

  if (MULTICHAIN_REGISTRY.officialBindings["cc3-mainnet"]["ethereum-sepolia"]) {
    issues.push("CC3 Mainnet must not invent an Ethereum Sepolia chainKey.");
  }
  if (MULTICHAIN_REGISTRY.officialBindings["cc3-testnet"]["polygon-amoy"]) {
    issues.push("CC3 Testnet must not invent a Polygon Amoy chainKey.");
  }
  if (MULTICHAIN_REGISTRY.officialBindings["cc3-mainnet"]["polygon-amoy"]) {
    issues.push("CC3 Mainnet must not invent a Polygon Amoy chainKey.");
  }

  return issues;
}

export function assertOperationalRegistryAligned(): void {
  const issues = operationalRegistryAlignmentIssues();
  if (issues.length) {
    throw new Error(
      `Official Attestcoin environment registry is not aligned with the operational multi-chain registry: ${issues.join(" ")}`,
    );
  }
}
