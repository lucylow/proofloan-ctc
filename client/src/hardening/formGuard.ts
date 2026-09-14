import { z } from "zod";

export const addressSchema = z.string().trim().min(8).max(100);
export const transactionHashSchema = z.string().trim().regex(/^0x[a-fA-F0-9]{64}$/);
export const amountSchema = z.number().finite().positive().max(1_000_000);

export function validateAmount(value: unknown) {
  return amountSchema.safeParse(typeof value === "string" ? Number(value) : value);
}

export function validateAddress(value: unknown) {
  return addressSchema.safeParse(value);
}

export function validateTransactionHash(value: unknown) {
  return transactionHashSchema.safeParse(value);
}
