export type PollingPolicyInput = {
  online: boolean;
  visible: boolean;
  hasWork: boolean;
  attempt: number;
};

export function getPollingDelay({ online, visible, hasWork, attempt }: PollingPolicyInput): number | null {
  if (!online || !visible || !hasWork) return null;
  const base = Math.min(30_000, 3000 * 2 ** Math.max(0, attempt));
  return base;
}
