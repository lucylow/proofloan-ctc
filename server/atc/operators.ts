import {
  formatAtomic,
  parseAtomic,
  type AtcOperator,
  type AtcOperatorAllocation,
} from "@shared/atc";
import { AtcError } from "./errors";

export function allocateOperatorRewards(
  poolAtomic: string,
  operators: AtcOperator[],
): AtcOperatorAllocation[] {
  if (operators.length === 0) {
    throw new AtcError("POLICY", "Cannot allocate ATC operator rewards without operators.");
  }
  const pool = parseAtomic(poolAtomic, "operator reward pool");
  const totalWeight = operators.reduce((sum, operator) => sum + operator.weight, 0);
  if (totalWeight <= 0) {
    throw new AtcError("POLICY", "ATC operator weights must be positive.");
  }
  const allocations = operators.map(operator => ({
    operatorId: operator.operatorId,
    name: operator.name,
    address: operator.address,
    weight: operator.weight,
    amount: (pool * BigInt(operator.weight)) / BigInt(totalWeight),
  }));
  const allocated = allocations.reduce((sum, item) => sum + item.amount, 0n);
  const remainder = pool - allocated;
  if (remainder < 0n) {
    throw new AtcError("POLICY", "ATC operator allocation exceeded the reward pool.");
  }
  const recipient = allocations.reduce((best, current) =>
    current.weight > best.weight ? current : best,
  );
  recipient.amount += remainder;
  const finalTotal = allocations.reduce((sum, item) => sum + item.amount, 0n);
  if (finalTotal !== pool) {
    throw new AtcError("POLICY", "ATC operator allocation does not equal the reward pool.");
  }
  if (allocations.some(item => item.amount < 0n)) {
    throw new AtcError("POLICY", "ATC operator allocation produced a negative reward.");
  }
  return allocations.map(item => ({
    operatorId: item.operatorId,
    name: item.name,
    address: item.address,
    weight: item.weight,
    amountAtomic: formatAtomic(item.amount),
  }));
}
