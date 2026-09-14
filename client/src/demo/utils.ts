export function seededHash(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash =
      (hash << 5) -
      hash +
      input.charCodeAt(index);

    hash |= 0;
  }

  return Math.abs(hash);
}

export function seededNumber(
  seed: string,
  min: number,
  max: number,
) {
  const hash = seededHash(seed);

  const normalized = (hash % 10000) / 10000;

  return min + normalized * (max - min);
}

export function seededInteger(
  seed: string,
  min: number,
  max: number,
) {
  return Math.floor(
    seededNumber(seed, min, max + 1),
  );
}

export function money(
  value: number,
  currency = "USDC",
) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} ${currency}`;
}

export function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function shortenHash(value: string) {
  if (value.length < 12) {
    return value;
  }

  return `${value.slice(0, 6)}…${value.slice(-6)}`;
}

export function hoursAgo(hours: number) {
  return new Date(
    Date.now() - hours * 60 * 60 * 1000,
  ).toISOString();
}

export function daysAgo(days: number) {
  return new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function minutesAgo(minutes: number) {
  return new Date(
    Date.now() - minutes * 60 * 1000,
  ).toISOString();
}

export function futureHours(hours: number) {
  return new Date(
    Date.now() + hours * 60 * 60 * 1000,
  ).toISOString();
}

export function futureDays(days: number) {
  return new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(Math.max(value, min), max);
}
