import { Browser, BrowserContext, Page } from '@playwright/test';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { log } from '@/src/core/utils/logger';

export interface StorageStateCacheOptions {
  browser: Browser;
  userEmail: string;
  userPassword: string;
  testEnv: string;
  tenantOrgId: string;
  cacheUrl?: string;
}

/**
 * Helper function to make fetch requests with timeout to prevent hanging requests
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Creates an authenticated browser context using storage state caching.
 * This helper eliminates redundant logins across parallel test workers by:
 * 1. Checking cache for existing storage state
 * 2. If cache miss, acquiring a lock and performing login once
 * 3. Other workers wait for the cache to be populated
 * 4. All workers reuse the cached storage state
 *
 * Performance optimizations:
 * - Fast timeouts (2s) on all cache operations
 * - Reduced polling interval (1s instead of 5s)
 * - Reduced max wait time (30s instead of 2min)
 * - Non-blocking cache save operations
 * - Fast fallback to normal login if cache unavailable
 *
 * @param options - Configuration options for storage state caching
 * @returns Promise<Page> - Authenticated page ready for use
 */

export async function createAuthenticatedContextWithCache(options: StorageStateCacheOptions): Promise<Page> {
  const { browser, userEmail, userPassword, testEnv, tenantOrgId, cacheUrl } = options;
  const cacheServerUrl = cacheUrl || process.env.STORAGE_STATE_CACHE_URL || 'http://localhost:3010';
  const enableCache = process.env.ENABLE_STORAGE_STATE_CACHE !== 'false'; // Default to true

  // Try to get cached storage state FIRST (before creating context)
  let cachedState: any = null;
  let needsLogin = false;
  const cacheKey = `env=${testEnv}&tenant=${encodeURIComponent(tenantOrgId)}&user=${encodeURIComponent(userEmail)}`;

  if (enableCache) {
    try {
      // Fast cache check with 2 second timeout
      const response = await fetchWithTimeout(`${cacheServerUrl}/get?${cacheKey}`, {}, 2000);

      if (response.ok) {
        cachedState = await response.json();
        log.info('Cache HIT', { userEmail });
      } else if (response.status === 404) {
        log.debug('Cache MISS', { userEmail });
        // Cache miss - try to acquire lock (BEFORE creating context)
        try {
          const lockResponse = await fetchWithTimeout(
            `${cacheServerUrl}/lock`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                env: testEnv,
                tenant: tenantOrgId,
                user: userEmail,
              }),
            },
            2000
          );
          if (lockResponse.ok) {
            const lockData = await lockResponse.json();
            const lockAcquired = lockData.success && !lockData.locked;
            if (lockAcquired) {
              log.info('Lock acquired, proceeding with login', { userEmail });
              needsLogin = true;
            } else {
              log.debug('Lock held by another worker, waiting for cache (max 30s)', { userEmail });
              // Another worker has the lock, poll until cache is ready (BEFORE creating context)
              // Reduced wait time and faster polling for better performance
              const maxWaitTime = 30000; // 30 seconds (reduced from 2 minutes)
              const pollInterval = 1000; // 1 second (reduced from 5 seconds)
              const maxAttempts = Math.floor(maxWaitTime / pollInterval);

              let cacheFound = false;
              for (let i = 0; i < maxAttempts; i++) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                try {
                  const pollResponse = await fetchWithTimeout(`${cacheServerUrl}/get?${cacheKey}`, {}, 1000);
                  if (pollResponse.ok) {
                    cachedState = await pollResponse.json();
                    log.info('Cache ready', {
                      userEmail,
                      waitTimeSeconds: ((i + 1) * pollInterval) / 1000,
                    });
                    cacheFound = true;
                    break;
                  }
                } catch (pollError) {
                  // If poll fails, continue trying
                  if (i === maxAttempts - 1) {
                    log.warn('Cache poll failed, proceeding with login', { userEmail });
                  }
                }
              }

              if (!cacheFound) {
                log.warn('Cache not available after 30 seconds, proceeding with login', { userEmail });
                needsLogin = true;
              }
            }
          } else {
            needsLogin = true;
          }
        } catch (error) {
          log.warn('Failed to acquire lock, proceeding with login', {
            userEmail,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          needsLogin = true;
        }
      }
    } catch (error) {
      // Fast fallback: if cache server is unavailable, proceed with normal login immediately
      log.debug('Cache server unavailable, using normal login', {
        userEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      needsLogin = true;
    }
  } else {
    needsLogin = true;
  }

  // NOW create browser context and page (we know if we have cached state or not)
  const context = await browser.newContext(cachedState ? { storageState: cachedState } : {});
  const page = await context.newPage();

  // Login only if we need to (cache miss and we acquired the lock)
  if (needsLogin && !cachedState) {
    log.info('Starting login', { userEmail });
    await LoginHelper.loginWithPassword(page, {
      email: userEmail,
      password: userPassword,
    });

    // Save storage state to cache (this will release the lock) - non-blocking
    if (enableCache) {
      // Don't await - save in background to avoid blocking test execution
      context
        .storageState()
        .then(storageState => {
          return fetchWithTimeout(
            `${cacheServerUrl}/save`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                env: testEnv,
                tenant: tenantOrgId,
                user: userEmail,
                state: storageState,
              }),
            },
            3000
          );
        })
        .then(saveResponse => {
          if (saveResponse.ok) {
            log.info('Storage state cached', { userEmail });
          }
        })
        .catch(error => {
          log.debug('Failed to save cache (non-blocking)', {
            userEmail,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
    }
  }

  return page;
}

/**
 * Creates an authenticated browser context with storage state caching and returns both context and page.
 * Useful when you need access to the browser context for additional setup.
 *
 * @param options - Configuration options for storage state caching
 * @returns Promise<{context: BrowserContext, page: Page}> - Authenticated context and page
 */
export async function createAuthenticatedContextAndPageWithCache(
  options: StorageStateCacheOptions
): Promise<{ context: BrowserContext; page: Page }> {
  const { browser, userEmail, userPassword, testEnv, tenantOrgId, cacheUrl } = options;
  const cacheServerUrl = cacheUrl || process.env.STORAGE_STATE_CACHE_URL || 'http://localhost:3010';
  const enableCache = process.env.ENABLE_STORAGE_STATE_CACHE !== 'false'; // Default to true

  // Try to get cached storage state FIRST (before creating context)
  let cachedState: any = null;
  let needsLogin = false;
  const cacheKey = `env=${testEnv}&tenant=${encodeURIComponent(tenantOrgId)}&user=${encodeURIComponent(userEmail)}`;

  if (enableCache) {
    try {
      // Fast cache check with 2 second timeout
      const response = await fetchWithTimeout(`${cacheServerUrl}/get?${cacheKey}`, {}, 2000);

      if (response.ok) {
        cachedState = await response.json();
        log.info('Cache HIT', { userEmail });
      } else if (response.status === 404) {
        log.debug('Cache MISS', { userEmail });
        // Cache miss - try to acquire lock (BEFORE creating context)
        try {
          const lockResponse = await fetchWithTimeout(
            `${cacheServerUrl}/lock`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                env: testEnv,
                tenant: tenantOrgId,
                user: userEmail,
              }),
            },
            2000
          );
          if (lockResponse.ok) {
            const lockData = await lockResponse.json();
            const lockAcquired = lockData.success && !lockData.locked;
            if (lockAcquired) {
              log.info('Lock acquired, proceeding with login', { userEmail });
              needsLogin = true;
            } else {
              log.debug('Lock held by another worker, waiting for cache (max 30s)', { userEmail });
              // Another worker has the lock, poll until cache is ready (BEFORE creating context)
              // Reduced wait time and faster polling for better performance
              const maxWaitTime = 30000; // 30 seconds (reduced from 2 minutes)
              const pollInterval = 1000; // 1 second (reduced from 5 seconds)
              const maxAttempts = Math.floor(maxWaitTime / pollInterval);

              let cacheFound = false;
              for (let i = 0; i < maxAttempts; i++) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                try {
                  const pollResponse = await fetchWithTimeout(`${cacheServerUrl}/get?${cacheKey}`, {}, 1000);
                  if (pollResponse.ok) {
                    cachedState = await pollResponse.json();
                    log.info('Cache ready', {
                      userEmail,
                      waitTimeSeconds: ((i + 1) * pollInterval) / 1000,
                    });
                    cacheFound = true;
                    break;
                  }
                } catch (pollError) {
                  // If poll fails, continue trying
                  if (i === maxAttempts - 1) {
                    log.warn('Cache poll failed, proceeding with login', { userEmail });
                  }
                }
              }

              if (!cacheFound) {
                log.warn('Cache not available after 30 seconds, proceeding with login', { userEmail });
                needsLogin = true;
              }
            }
          } else {
            needsLogin = true;
          }
        } catch (error) {
          log.warn('Failed to acquire lock, proceeding with login', {
            userEmail,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          needsLogin = true;
        }
      }
    } catch (error) {
      // Fast fallback: if cache server is unavailable, proceed with normal login immediately
      log.debug('Cache server unavailable, using normal login', {
        userEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      needsLogin = true;
    }
  } else {
    needsLogin = true;
  }

  // NOW create browser context and page (we know if we have cached state or not)
  const context = await browser.newContext(cachedState ? { storageState: cachedState } : {});
  const page = await context.newPage();

  // Login only if we need to (cache miss and we acquired the lock)
  if (needsLogin && !cachedState) {
    log.info('Starting login', { userEmail });
    await LoginHelper.loginWithPassword(page, {
      email: userEmail,
      password: userPassword,
    });

    // Save storage state to cache (this will release the lock) - non-blocking
    if (enableCache) {
      // Don't await - save in background to avoid blocking test execution
      context
        .storageState()
        .then(storageState => {
          return fetchWithTimeout(
            `${cacheServerUrl}/save`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                env: testEnv,
                tenant: tenantOrgId,
                user: userEmail,
                state: storageState,
              }),
            },
            3000
          );
        })
        .then(saveResponse => {
          if (saveResponse.ok) {
            log.info('Storage state cached', { userEmail });
          }
        })
        .catch(error => {
          log.debug('Failed to save cache (non-blocking)', {
            userEmail,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
    }
  }

  return { context, page };
}
