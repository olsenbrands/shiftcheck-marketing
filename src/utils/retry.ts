/**
 * Retry Utility
 * ShiftCheck Marketing Website
 *
 * Provides retry logic with exponential backoff for transient network failures.
 * Used by service functions to automatically retry failed requests.
 */

// ============================================================================
// Types
// ============================================================================

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number;
  /** Exponential backoff factor (default: 2) */
  backoffFactor?: number;
  /** Function to determine if error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: unknown) => isRetryableError(error),
  onRetry: () => {},
};

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Determine if an error is retryable (transient)
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Check for error response with status code
  if (error && typeof error === 'object') {
    const err = error as { status?: number; statusCode?: number; code?: string };

    // Network/server errors are retryable
    if (err.status || err.statusCode) {
      const status = err.status || err.statusCode;
      // 5xx server errors
      if (status && status >= 500) return true;
      // 429 rate limiting
      if (status === 429) return true;
      // 408 request timeout
      if (status === 408) return true;
    }

    // Specific error codes
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
      return true;
    }
  }

  // Check for error message patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('unavailable') ||
      message.includes('temporary')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  // Exponential backoff: delay = initial * (factor ^ attempt)
  const exponentialDelay = initialDelay * Math.pow(backoffFactor, attempt);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (10-30% random variance) to prevent thundering herd
  const jitter = cappedDelay * (0.1 + Math.random() * 0.2);

  return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with automatic retry on failure
 *
 * @example
 * const result = await withRetry(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, onRetry: (err, attempt) => console.log(`Retry ${attempt}`) }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<RetryResult<T>> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffFactor,
    shouldRetry,
    onRetry,
  } = { ...DEFAULT_CONFIG, ...config };

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffFactor);

        // Notify about retry
        onRetry(error, attempt + 1, delay);

        // Wait before retrying
        await sleep(delay);
        attempt++;
      } else {
        // Don't retry - return error
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: attempt + 1,
  };
}

/**
 * Retry wrapper for fetch requests
 *
 * @example
 * const response = await fetchWithRetry('/api/data', { method: 'POST', body: '{}' });
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  const result = await withRetry(
    async () => {
      const response = await fetch(url, options);

      // Throw on server errors to trigger retry
      if (response.status >= 500 || response.status === 429) {
        const error = new Error(`HTTP ${response.status}`);
        (error as { status?: number }).status = response.status;
        throw error;
      }

      return response;
    },
    {
      ...retryConfig,
      shouldRetry: (error) => {
        // Also retry on specific HTTP status codes
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          return status >= 500 || status === 429;
        }
        return isRetryableError(error);
      },
    }
  );

  if (!result.success || !result.data) {
    throw result.error || new Error('Request failed after retries');
  }

  return result.data;
}

// ============================================================================
// React Hook for Retry State
// ============================================================================

export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: unknown | null;
}

/**
 * Create initial retry state
 */
export function createRetryState(): RetryState {
  return {
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  };
}

/**
 * Update retry state on retry attempt
 */
export function updateRetryState(
  _state: RetryState,
  error: unknown,
  attempt: number
): RetryState {
  return {
    isRetrying: true,
    retryCount: attempt,
    lastError: error,
  };
}

/**
 * Reset retry state on success or final failure
 */
export function resetRetryState(error?: unknown): RetryState {
  return {
    isRetrying: false,
    retryCount: 0,
    lastError: error || null,
  };
}
