export type OperationState<T> =
  | { status: "idle"; data: undefined; error: undefined }
  | { status: "pending"; data: undefined | T; error: undefined }
  | { status: "success"; data: T; error: undefined }
  | { status: "error"; data: undefined | T; error: Error };

export const idleOperation = <T,>(): OperationState<T> => ({
  status: "idle",
  data: undefined,
  error: undefined,
});

export function pendingOperation<T>(data?: T): OperationState<T> {
  return { status: "pending", data, error: undefined };
}

export function successOperation<T>(data: T): OperationState<T> {
  return { status: "success", data, error: undefined };
}

export function errorOperation<T>(error: Error, data?: T): OperationState<T> {
  return { status: "error", data, error };
}
