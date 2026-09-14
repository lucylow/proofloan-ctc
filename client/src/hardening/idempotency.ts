import { nanoid } from "nanoid";

export function createIdempotencyKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${nanoid(12)}`;
}

export function isValidIdempotencyKey(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value) && value.length >= 8 && value.length <= 120;
}
