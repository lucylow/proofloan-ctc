export const CONFIG_PRIORITY = ["cli", "environment", "config-file", "default"] as const;
export type ConfigSource = (typeof CONFIG_PRIORITY)[number];

export function choose<T>(values: Array<{ source: ConfigSource; value: T | undefined }>): { source: ConfigSource; value: T } | undefined {
  for (const source of CONFIG_PRIORITY) {
    const item = values.find(entry => entry.source === source && entry.value !== undefined);
    if (item) return { source, value: item.value as T };
  }
  return undefined;
}
