export function shallowDiff(expected: Record<string, unknown>, actual: Record<string, unknown>) {
  const differences: string[] = [];
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) differences.push(key);
  }
  return differences;
}
