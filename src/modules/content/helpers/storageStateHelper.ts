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
 * Creates an authenticated browser context using storage state caching.
 * This helper eliminates redundant logins across parallel test workers by:
 * 1. Checking cache for existing storage state
 * 2. If cache miss, acquiring a lock and performing login once
 * 3. Other workers wait for the cache to be populated
 * 4. All workers reuse the cached storage state
 *
 * @param options - Configuration options for storage state caching
 * @returns Promise<Page> - Authenticated page ready for use
 */
export async function createAuthenticatedContextWithCache(options: StorageStateCacheOptions): Promise<Page> {
  const { browser, userEmail, userPassword, testEnv, tenantOrgId, cacheUrl } = options;
  const cacheServerUrl = cacheUrl || process.env.STORAGE_STATE_CACHE_URL || 'http://localhost:3010';

  // Try to get cached storage state FIRST (before creating context)
  let cachedState: any = null;
  let needsLogin = false;
  const cacheKey = `env=${testEnv}&tenant=${encodeURIComponent(tenantOrgId)}&user=${encodeURIComponent(userEmail)}`;

  try {
    const response = await fetch(`${cacheServerUrl}/get?${cacheKey}`);

    if (response.ok) {
      cachedState = await response.json();
      log.info('Cache HIT', { userEmail });
    } else if (response.status === 404) {
      log.debug('Cache MISS', { userEmail });
      // Cache miss - try to acquire lock (BEFORE creating context)
      try {
        const lockResponse = await fetch(`${cacheServerUrl}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            env: testEnv,
            tenant: tenantOrgId,
            user: userEmail,
          }),
        });
        if (lockResponse.ok) {
          const lockData = await lockResponse.json();
          const lockAcquired = lockData.success && !lockData.locked;
          if (lockAcquired) {
            log.info('Lock acquired, proceeding with login', { userEmail });
            needsLogin = true;
          } else {
            log.debug('Lock held by another worker, waiting for cache (max 2min)', { userEmail });
            // Another worker has the lock, poll until cache is ready (BEFORE creating context)
            const maxWaitTime = 120000; // 2 minutes
            const pollInterval = 5000; // 5 seconds
            const maxAttempts = Math.floor(maxWaitTime / pollInterval);

            let cacheFound = false;
            for (let i = 0; i < maxAttempts; i++) {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              const pollResponse = await fetch(`${cacheServerUrl}/get?${cacheKey}`);
              if (pollResponse.ok) {
                cachedState = await pollResponse.json();
                log.info('Cache ready', {
                  userEmail,
                  waitTimeSeconds: ((i + 1) * pollInterval) / 1000,
                });
                cacheFound = true;
                break;
              }
              // Log every 30 seconds
              if ((i + 1) % 6 === 0) {
                const elapsedSeconds = ((i + 1) * pollInterval) / 1000;
                log.debug('Waiting for cache', { elapsedSeconds, userEmail });
              }
            }

            if (!cacheFound) {
              log.warn('Cache not available after 2 minutes, proceeding with login', { userEmail });
              needsLogin = true;
            }
          }
        }
      } catch (error) {
        log.warn('Failed to acquire lock', {
          userEmail,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        needsLogin = true;
      }
    }
  } catch (error) {
    log.warn('Cache server unavailable, using normal login', {
      userEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
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

    // Save storage state to cache (this will release the lock)
    try {
      const storageState = await context.storageState();
      const saveResponse = await fetch(`${cacheServerUrl}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          env: testEnv,
          tenant: tenantOrgId,
          user: userEmail,
          state: storageState,
        }),
      });
      if (saveResponse.ok) {
        log.info('Storage state cached', { userEmail });
      }
    } catch (error) {
      log.warn('Failed to save cache', {
        userEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
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

  // Try to get cached storage state FIRST (before creating context)
  let cachedState: any = null;
  let needsLogin = false;
  const cacheKey = `env=${testEnv}&tenant=${encodeURIComponent(tenantOrgId)}&user=${encodeURIComponent(userEmail)}`;

  try {
    const response = await fetch(`${cacheServerUrl}/get?${cacheKey}`);

    if (response.ok) {
      cachedState = await response.json();
      log.info('Cache HIT', { userEmail });
    } else if (response.status === 404) {
      log.debug('Cache MISS', { userEmail });
      // Cache miss - try to acquire lock (BEFORE creating context)
      try {
        const lockResponse = await fetch(`${cacheServerUrl}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            env: testEnv,
            tenant: tenantOrgId,
            user: userEmail,
          }),
        });
        if (lockResponse.ok) {
          const lockData = await lockResponse.json();
          const lockAcquired = lockData.success && !lockData.locked;
          if (lockAcquired) {
            log.info('Lock acquired, proceeding with login', { userEmail });
            needsLogin = true;
          } else {
            log.debug('Lock held by another worker, waiting for cache (max 2min)', { userEmail });
            // Another worker has the lock, poll until cache is ready (BEFORE creating context)
            const maxWaitTime = 120000; // 2 minutes
            const pollInterval = 5000; // 5 seconds
            const maxAttempts = Math.floor(maxWaitTime / pollInterval);

            let cacheFound = false;
            for (let i = 0; i < maxAttempts; i++) {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              const pollResponse = await fetch(`${cacheServerUrl}/get?${cacheKey}`);
              if (pollResponse.ok) {
                cachedState = await pollResponse.json();
                log.info('Cache ready', {
                  userEmail,
                  waitTimeSeconds: ((i + 1) * pollInterval) / 1000,
                });
                cacheFound = true;
                break;
              }
              // Log every 30 seconds
              if ((i + 1) % 6 === 0) {
                const elapsedSeconds = ((i + 1) * pollInterval) / 1000;
                log.debug('Waiting for cache', { elapsedSeconds, userEmail });
              }
            }

            if (!cacheFound) {
              log.warn('Cache not available after 2 minutes, proceeding with login', { userEmail });
              needsLogin = true;
            }
          }
        }
      } catch (error) {
        log.warn('Failed to acquire lock', {
          userEmail,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        needsLogin = true;
      }
    }
  } catch (error) {
    log.warn('Cache server unavailable, using normal login', {
      userEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
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

    // Save storage state to cache (this will release the lock)
    try {
      const storageState = await context.storageState();
      const saveResponse = await fetch(`${cacheServerUrl}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          env: testEnv,
          tenant: tenantOrgId,
          user: userEmail,
          state: storageState,
        }),
      });
      if (saveResponse.ok) {
        log.info('Storage state cached', { userEmail });
      }
    } catch (error) {
      log.warn('Failed to save cache', {
        userEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { context, page };
}
