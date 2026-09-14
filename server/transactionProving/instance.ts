import { TransactionProvingService } from "./pipeline";

export const transactionProvingService = new TransactionProvingService();

export function resetTransactionProvingRuntime(): void {
  transactionProvingService.reset();
}
