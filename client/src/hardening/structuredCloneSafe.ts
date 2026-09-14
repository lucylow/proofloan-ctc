export function structuredCloneSafe<T>(value: T): T {
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
  } catch {
    // fallback below
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}
