export function once<TArgs extends unknown[]>(fn: (...args: TArgs) => void) {
  let called = false;
  return (...args: TArgs) => {
    if (called) return;
    called = true;
    fn(...args);
  };
}
