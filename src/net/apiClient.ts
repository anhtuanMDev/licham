import { ui$ } from '../state/ui';

// Simple in-memory map to store in-flight promises by key for deduplication
const inFlightRequests = new Map<string, Promise<any>>();

type RequestOptions = {
  timeoutMs?: number;
  retries?: number;
  dedupe?: boolean;
};

export const apiClient = {
  /**
   * Robust fetch wrapper with deduping, timeout, and state machine updates.
   * 
   * @param key Unique key for this request (used for deduping and state tracking)
   * @param fetchFn The actual fetch function, receives an AbortSignal
   * @param opts Configuration for timeout, retries, etc.
   */
  async request<T>(
    key: string,
    fetchFn: (signal: AbortSignal) => Promise<T>,
    opts: RequestOptions = {}
  ): Promise<T> {
    const { timeoutMs = 8000, retries = 0, dedupe = true } = opts;

    // 1. Deduplication
    if (dedupe && inFlightRequests.has(key)) {
      return inFlightRequests.get(key) as Promise<T>;
    }

    // 2. Set State to pending
    ui$.api[key].set({ status: 'pending' });

    // Build the request Promise
    const promise = (async () => {
      let attempt = 0;
      let lastError: Error | unknown;

      while (attempt <= retries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => { controller.abort(); }, timeoutMs);

        try {
          const result = await fetchFn(controller.signal);
          
          clearTimeout(timeoutId);
          ui$.api[key].set({ status: 'success' });
          return result;
          
        } catch (error: any) {
          clearTimeout(timeoutId);
          lastError = error;

          if (error.name === 'AbortError' || error === 'Timeout') {
            ui$.api[key].set({ status: 'cancelled' });
            throw new Error(`Request cancelled or timed out: ${error}`);
          }

          // If we have retries left, wait a bit before retrying (exponential backoff could be added here)
          if (attempt <= retries) {
            await new Promise(r => setTimeout(() => r(null), 1000 * attempt));
            continue;
          }
        }
      }

      // If we exit the loop, all retries failed
      const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
      ui$.api[key].set({ status: 'error', error: errorMsg });
      throw lastError;
    })();

    // 3. Store in-flight promise for deduping
    if (dedupe) {
      inFlightRequests.set(key, promise);
      promise.finally(() => {
        inFlightRequests.delete(key);
      });
    }

    return promise;
  }
};
