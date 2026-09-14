export async function safePromise<T>(promise: Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await promise };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function safeVoid(operation: () => Promise<void>): Promise<boolean> {
  try {
    await operation();
    return true;
  } catch {
    return false;
  }
}
