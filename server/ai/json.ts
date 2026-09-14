import { AiError } from "./errors";

export function parseJsonObject(text: string): Record<string, unknown> {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new AiError("SANITIZE", "Expected a JSON object payload.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new AiError("SANITIZE", "Malformed JSON payload.", false, error);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new AiError("SANITIZE", "Expected JSON object.");
  }

  return parsed as Record<string, unknown>;
}
