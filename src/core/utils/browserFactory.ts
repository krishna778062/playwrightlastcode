import { Browser, BrowserContext, Page, test } from '@playwright/test';

export interface UserContext {
  context: BrowserContext;
  page: Page;
}

export interface MultiUserContexts {
  [key: string]: UserContext;
}

export class BrowserFactory {
  private readonly browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * Creates browser contexts for multiple users
   * @param userIdentifiers Array of unique identifiers for each user (e.g. email addresses)
   * @returns Object mapping user identifiers to their browser contexts and pages
   */
  async createMultiUserContexts(userIdentifiers: string[]): Promise<MultiUserContexts> {
    // Create contexts and pages in parallel for better performance
    let multiUserContexts: MultiUserContexts | undefined;
    await test.step('Creating browser contexts for multiple users', async () => {
      const contextPromises = userIdentifiers.map(async () => this.browser.newContext());
      const contexts = await Promise.all(contextPromises);

      const pagePromises = contexts.map(context => context.newPage());
      const pages = await Promise.all(pagePromises);

      // Create the mapping of user identifiers to their contexts and pages
      multiUserContexts = userIdentifiers.reduce((acc, userId, index) => {
        acc[userId] = {
          context: contexts[index],
          page: pages[index],
        };
        return acc;
      }, {} as MultiUserContexts);
    });

    if (multiUserContexts === undefined) {
      throw new Error('Failed to create browser contexts for multiple users');
    }
    return multiUserContexts;
  }

  /**
   * Cleans up all browser contexts safely without throwing exceptions
   * @param contexts Object containing browser contexts to clean up
   */
  async cleanupContexts(contexts: MultiUserContexts): Promise<void> {
    await test.step('Cleaning up all browser contexts', async () => {
      try {
        if (!contexts) return;

        // Close contexts sequentially
        for (const [userId, { context }] of Object.entries(contexts)) {
          try {
            await context?.close({ reason: `Tear down for user ${userId}` });
          } catch (error) {
            console.error(`Failed to close context for user ${userId}:`, error);
          }
        }
      } catch (error) {
        console.error('Unexpected error during context cleanup:', error);
      }
    });
  }
}
