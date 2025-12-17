import { Page } from '@playwright/test';

/**
 * Computes the next target time using rule:
 * targetMinute = ((floor(currentMinute / 10) + 1) * 10) + 1
 * and waits until that time.
 *
 * @param page optional Playwright Page - if provided uses page.waitForTimeout, otherwise setTimeout
 * @param maxWaitMs optional maximum wait in ms (default 15 minutes) to protect against runaway waits
 * @returns the Date object of the moment when the wait finished (the target time)
 */
export async function waitUntilNextDecadePlusOne(page?: Page, maxWaitMs = 15 * 60 * 1000): Promise<Date> {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // compute candidate target minute
  const candidateMinute = (Math.floor(minute / 10) + 1) * 10 + 1;

  // Build target; Date constructor will auto-rollover if candidateMinute >= 60
  let target = new Date(year, month, day, hour, candidateMinute, 0, 0);

  // If target is not strictly in the future (e.g. seconds made it <= now), bump by 10 minutes
  if (target.getTime() <= now.getTime()) {
    target = new Date(target.getTime() + 10 * 60 * 1000);
  }

  const diffMs = target.getTime() - now.getTime();

  // Safety cap
  const waitMs = Math.min(diffMs, maxWaitMs);

  console.log(`Now: ${now.toISOString()}`);
  console.log(`Waiting until: ${target.toISOString()} (diff ${diffMs} ms, using wait ${waitMs} ms)`);

  if (waitMs > 0) {
    if (page && typeof page.waitForTimeout === 'function') {
      await page.waitForTimeout(waitMs);
    } else {
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  } else {
    // no wait needed
    console.log('Target time already reached or non-positive wait; continuing immediately.');
  }

  // If we hit maxWaitMs but diffMs was larger, you may want to loop/poll — return the time we attempted to reach
  return new Date();
}
