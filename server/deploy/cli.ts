import "dotenv/config";
import { Wallet } from "ethers";
import { compileProofLoanContracts } from "./compile";
import { executeDeployment, formatDeploymentResult } from "./execute";
import { assertDeployGuards, buildDeployRequest } from "./guards";
import { getDeployNetwork, parseDeployNetworkId } from "./networks";
import { planDeployments } from "./plan";
import { runPreflight } from "./preflight";
import { DeployError } from "./errors";

function readArg(argv: string[], name: string): string | undefined {
  const index = argv.findIndex(part => part === name || part.startsWith(`${name}=`));
  if (index < 0) return undefined;
  const token = argv[index]!;
  if (token.startsWith(`${name}=`)) return token.slice(name.length + 1);
  return argv[index + 1];
}

function hasFlag(argv: string[], name: string) {
  return argv.includes(name);
}

async function main(argv = process.argv.slice(2).filter(part => part !== "--")) {
  const command = argv[0] ?? "preflight";
  const network = getDeployNetwork(
    readArg(argv, "--network") ??
      process.env.CREDITCOIN_DEPLOY_NETWORK ??
      process.env.ATTESTCOIN_ENVIRONMENT,
  );
  const broadcast = hasFlag(argv, "--broadcast") || process.env.DEPLOY_BROADCAST === "true";

  if (command === "compile") {
    const compiled = compileProofLoanContracts();
    for (const contract of compiled) {
      console.log(
        `${contract.name} ${contract.bytecode.length / 2 - 1} bytes evm=${contract.evmVersion} solc=${contract.compiler}`,
      );
    }
    return;
  }

  const mode =
    command === "deploy" ? "deploy" : command === "dry-run" ? "dry-run" : "preflight";
  const request = buildDeployRequest(network, {
    mode,
    broadcast: command === "deploy" && broadcast,
  });
  if (command !== "plan") {
    assertDeployGuards(request);
  }

  const compiled = compileProofLoanContracts();
  const privateKey = request.privateKey;
  const deployer = privateKey ? new Wallet(privateKey).address : undefined;
  const placeholderGuardian = "0x000000000000000000000000000000000000dEaD";
  const guardian =
    request.guardian ||
    deployer ||
    (request.broadcast ? undefined : placeholderGuardian);
  const plan = planDeployments(network, compiled, { guardian, deployer });

  if (command === "plan") {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  const preflight = await runPreflight({
    network,
    plan,
    privateKey,
    requireBalance: request.broadcast,
  });

  if (command === "preflight") {
    console.log(JSON.stringify(preflight, null, 2));
    if (preflight.issues.length > 0) {
      throw new DeployError("CONFIG", preflight.issues.join(" "));
    }
    return;
  }

  const result = await executeDeployment({
    network,
    plan,
    preflight,
    privateKey: privateKey ?? "",
    broadcast: request.broadcast,
  });
  console.log(formatDeploymentResult(result));
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

export { parseDeployNetworkId };
