import { parseFiniteNumber } from "@/hardening/safeNumber";

export function SafeNumber({ value, prefix = "", suffix = "" }: { value: unknown; prefix?: string; suffix?: string }) {
  const number = parseFiniteNumber(value, NaN);
  if (!Number.isFinite(number)) return <>—</>;
  return <>{prefix}{number.toLocaleString()}{suffix}</>;
}
