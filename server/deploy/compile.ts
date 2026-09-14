import fs from "node:fs";
import { createRequire } from "node:module";
import { CREDITCOIN_EVM_VERSION } from "@shared/multichain";
import {
  CONTRACTS_ROOT,
  PROOFLOAN_DEPLOY_CONTRACTS,
  contractSourcePath,
  type ProofLoanDeployContractName,
} from "./contracts";
import { DeployError } from "./errors";

const require = createRequire(import.meta.url);

type SolcOutput = {
  errors?: Array<{ severity: string; formattedMessage?: string; message?: string }>;
  contracts?: Record<
    string,
    Record<
      string,
      {
        abi: unknown[];
        evm: {
          bytecode: { object: string };
          deployedBytecode: { object: string };
        };
      }
    >
  >;
};

export type CompiledContract = {
  name: ProofLoanDeployContractName;
  source: string;
  abi: unknown[];
  bytecode: string;
  deployedBytecode: string;
  evmVersion: typeof CREDITCOIN_EVM_VERSION;
  compiler: string;
};

function loadSolc(): { compile(input: string): string; version(): string } {
  try {
    return require("solc");
  } catch (error) {
    throw new DeployError(
      "COMPILER",
      "solc@0.8.24 is required to compile ProofLoan contracts. Run pnpm add -D solc@0.8.24 -w",
      { cause: error },
    );
  }
}

function hexBytecode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new DeployError("COMPILER", "Compiler returned empty bytecode.");
  }
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

export function compileProofLoanContracts(): CompiledContract[] {
  const solc = loadSolc();
  const sources: Record<string, { content: string }> = {};
  for (const contract of PROOFLOAN_DEPLOY_CONTRACTS) {
    const filePath = contractSourcePath(contract.source);
    if (!fs.existsSync(filePath)) {
      throw new DeployError("COMPILER", `Missing contract source: ${filePath}`);
    }
    sources[contract.source] = { content: fs.readFileSync(filePath, "utf8") };
  }

  const input = {
    language: "Solidity",
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: CREDITCOIN_EVM_VERSION,
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
        },
      },
    },
  };

  let parsed: SolcOutput;
  try {
    parsed = JSON.parse(solc.compile(JSON.stringify(input))) as SolcOutput;
  } catch (error) {
    throw new DeployError("COMPILER", "solc failed to compile ProofLoan contracts.", {
      cause: error,
    });
  }

  const errors = (parsed.errors ?? []).filter(item => item.severity === "error");
  if (errors.length > 0) {
    throw new DeployError(
      "COMPILER",
      `Solidity compile failed:\n${errors
        .map(item => item.formattedMessage ?? item.message ?? "unknown compiler error")
        .join("\n")}`,
    );
  }

  return PROOFLOAN_DEPLOY_CONTRACTS.map(contract => {
    const compiled = parsed.contracts?.[contract.source]?.[contract.name];
    if (!compiled) {
      throw new DeployError(
        "COMPILER",
        `Compiler output missing ${contract.name} from ${contract.source}.`,
      );
    }
    const bytecode = hexBytecode(compiled.evm.bytecode.object);
    if (bytecode === "0x") {
      throw new DeployError("COMPILER", `${contract.name} compiled to empty deploy bytecode.`);
    }
    return {
      name: contract.name,
      source: contract.source,
      abi: compiled.abi,
      bytecode,
      deployedBytecode: hexBytecode(compiled.evm.deployedBytecode.object),
      evmVersion: CREDITCOIN_EVM_VERSION,
      compiler: solc.version(),
    };
  });
}

export function contractsRoot() {
  return CONTRACTS_ROOT;
}
