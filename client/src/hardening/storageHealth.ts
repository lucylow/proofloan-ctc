import { resolveStorage } from "./safeStorage";

export function checkStorageHealth() {
  const local = resolveStorage("local");
  const session = resolveStorage("session");
  const key = "proofloan.storage.healthcheck";
  const result = { local: Boolean(local), session: Boolean(session) };

  try {
    local?.setItem(key, "1");
    local?.removeItem(key);
  } catch {
    result.local = false;
  }

  try {
    session?.setItem(key, "1");
    session?.removeItem(key);
  } catch {
    result.session = false;
  }

  return result;
}
