import { createHash } from "node:crypto";

export function configHash(config: unknown) {
  return createHash("sha256").update(JSON.stringify(config)).digest("hex");
}
