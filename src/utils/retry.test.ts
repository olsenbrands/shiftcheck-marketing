/**
 * Retry Utility Tests
 * ShiftCheck Marketing Website
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRetryableError, withRetry, fetchWithRetry } from './retry';

describe('isRetryableError', () => {
  it('should return true for fetch TypeError', () => {
    const error = new TypeError('Failed to fetch');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 500 status error', () => {
    const error = { status: 500 };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 502 status error', () => {
    const error = { status: 502 };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 503 status error', () => {
    const error = { status: 503 };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 429 rate limit error', () => {
    const error = { status: 429 };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 408 timeout error', () => {
    const error = { status: 408 };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for ECONNRESET code', () => {
    const error = { code: 'ECONNRESET' };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for ETIMEDOUT code', () => {
    const error = { code: 'ETIMEDOUT' };
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for network error message', () => {
    const error = new Error('Network error occurred');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for timeout error message', () => {
    const error = new Error('Request timeout');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for connection error message', () => {
    const error = new Error('Connection refused');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for 400 client error', () => {
    const error = { status: 400 };
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 401 auth error', () => {
    const error = { status: 401 };
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 403 forbidden error', () => {
    const error = { status: 403 };
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 404 not found error', () => {
    const error = { status: 404 };
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for regular errors', () => {
    const error = new Error('Validation failed');
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isRetryableError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isRetryableError(undefined)).toBe(false);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const promise = withRetry(fn);

    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable error and succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockResolvedValue('success');

    const promise = withRetry(fn, { maxRetries: 3, initialDelay: 100 });

    // Advance timers for retry delay
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 400 });

    const result = await withRetry(fn, { maxRetries: 3 });

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should exhaust retries and fail', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500 });

    const promise = withRetry(fn, { maxRetries: 2, initialDelay: 100 });

    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3); // 1 initial + 2 retries
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockResolvedValue('success');

    const promise = withRetry(fn, {
      maxRetries: 3,
      initialDelay: 100,
      onRetry,
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500 }),
      1,
      expect.any(Number)
    );
  });

  it('should use custom shouldRetry function', async () => {
    const customShouldRetry = vi.fn().mockReturnValue(false);
    const fn = vi.fn().mockRejectedValue({ status: 500 });

    const result = await withRetry(fn, {
      shouldRetry: customShouldRetry,
    });

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
    expect(customShouldRetry).toHaveBeenCalled();
  });

  it('should respect maxRetries config', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500 });

    const promise = withRetry(fn, { maxRetries: 1, initialDelay: 100 });

    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.attempts).toBe(2); // 1 initial + 1 retry
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should make successful fetch request', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
    });
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const response = await fetchWithRetry('/api/test');

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/test', undefined);
  });

  it('should pass options to fetch', async () => {
    const mockResponse = new Response('{}', { status: 200 });
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    };

    await fetchWithRetry('/api/test', options);

    expect(fetch).toHaveBeenCalledWith('/api/test', options);
  });

  it('should retry on 500 error', async () => {
    const failResponse = new Response('Server Error', { status: 500 });
    const successResponse = new Response('{}', { status: 200 });

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValue(successResponse);

    const promise = fetchWithRetry('/api/test', undefined, { initialDelay: 100 });

    await vi.runAllTimersAsync();

    const response = await promise;

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should not retry on 400 error', async () => {
    const failResponse = new Response('Bad Request', { status: 400 });
    global.fetch = vi.fn().mockResolvedValue(failResponse);

    const response = await fetchWithRetry('/api/test');

    expect(response.status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
