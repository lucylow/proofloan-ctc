import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export function assertReleaseImage(network: AttestorNetwork, image: string): void {
  const expected = getAttestorSettings(network).releaseImage;
  if (image !== expected) {
    throw new Error(`Unsupported Attestor image for ${network}. Expected ${expected}; received ${image}.`);
  }
}

export function dockerRunCommand(
  network: AttestorNetwork,
  opts: {
    configPath: string;
    logsPath: string;
    dataPath: string;
    publicAddress?: string;
  },
): string {
  const settings = getAttestorSettings(network);
  const publicArg = opts.publicAddress ? ` --public-addr ${shell(opts.publicAddress)}` : "";
  return [
    "docker run -d --name cc3-attestor",
    "--entrypoint /bin/attestor",
    `-p ${settings.p2pPort}:${settings.p2pPort}`,
    `-p ${settings.metricsPort}:${settings.metricsPort}`,
    `-v ${shell(opts.configPath)}:/config.yaml:ro`,
    `-v ${shell(opts.logsPath)}:/logs`,
    `-v ${shell(opts.dataPath)}:/data`,
    settings.releaseImage,
    `--config /config.yaml --logs /logs${publicArg}`,
  ].join(" ") + "\n";
}

function shell(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
