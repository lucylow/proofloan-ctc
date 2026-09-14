import { normalizeAppError } from "./appError";
import type { Result } from "./types";

export async function copyToClipboardSafe(text: string): Promise<Result<void>> {
  if (!text) {
    return { ok: false, error: normalizeAppError(new Error("Empty clipboard payload"), { source: "validation" }) };
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { ok: true, value: undefined };
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Clipboard copy failed");
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: normalizeAppError(error) };
  }
}
