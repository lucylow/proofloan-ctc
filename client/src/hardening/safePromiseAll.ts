export async function promiseAllSettledValues<T>(promises: Promise<T>[]) {
  const results = await Promise.allSettled(promises);
  return results.reduce<{ values: T[]; errors: unknown[] }>((accumulator, result) => {
    if (result.status === "fulfilled") accumulator.values.push(result.value);
    else accumulator.errors.push(result.reason);
    return accumulator;
  }, { values: [], errors: [] });
}
