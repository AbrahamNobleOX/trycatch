/**
 * Represents a successful result with data
 */
export type Success<T> = {
  data: T;
  error: null;
  isSuccess: true;
};

/**
 * Represents a failed result with error
 */
export type Failure<E> = {
  data: null;
  error: E;
  isSuccess: false;
};

/**
 * Union type representing either success or failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Standard HTTP status code messages
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

/**
 * Creates a success result
 */
export function success<T>(data: T): Success<T> {
  return { data, error: null, isSuccess: true };
}

/**
 * Creates a failure result
 */
export function failure<E extends ErrorResponse>(
  error: E | unknown
): Failure<E> {
  if (error instanceof Error) {
    const originalError = error as any;
    const statusCode =
      originalError?.response?.status || originalError?.status || 500;
    const defaultMessage = HTTP_STATUS_MESSAGES[statusCode] || error.message;

    return {
      data: null,
      error: {
        code: statusCode,
        message: defaultMessage,
        originalError: error,
        stack: error.stack || new Error().stack,
      } as unknown as E,
      isSuccess: false,
    };
  }

  if (typeof error === "object" && error !== null) {
    const customError = error as E;
    const originalError = customError.originalError as any;
    const errorStack = new Error().stack;
    const statusCode =
      customError.code ||
      originalError?.response?.status ||
      originalError?.status ||
      500;

    customError.code = statusCode;
    customError.message =
      customError.message ||
      HTTP_STATUS_MESSAGES[statusCode] ||
      "Unknown Error";
    customError.stack = errorStack;
    customError.originalError = customError.originalError || error;
    return { data: null, error: customError, isSuccess: false };
  }

  const errorStack = new Error().stack;
  return {
    data: null,
    error: {
      code: 500,
      message: HTTP_STATUS_MESSAGES[500] || String(error),
      originalError: error,
      stack: errorStack,
    } as unknown as E,
    isSuccess: false,
  };
}

/**
 * Standard API error interface
 */
export interface ErrorResponse {
  code?: number;
  message: string;
  stack?: string;
  originalError?: Error | unknown;
}

/**
 * Wraps a promise to handle success and error cases in a type-safe way
 *
 * @param promise - The promise to wrap
 * @returns A Result object containing either data or error
 *
 * @example
 * ```typescript:clevali-trycatch-sdk/README.md
 * const result = await tryCatch(fetchUserData(userId));
 * if (result.error) {
 *   console.error('Failed:', result.error);
 *   return;
 * }
 * console.log('User:', result.data);
 * ```
 */
export async function tryCatch<T, E extends ErrorResponse>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    return failure<E>(error);
  }
}

/**
 * Maps a successful Result to a new Result
 */
export function map<T, U, E extends ErrorResponse>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.isSuccess) {
    return failure<E>(result.error);
  }
  return success(fn(result.data));
}

/**
 * Chains multiple Results together
 */
export function flatMap<T, U, E extends ErrorResponse>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.isSuccess) {
    return failure<E>(result.error);
  }
  return fn(result.data);
}
