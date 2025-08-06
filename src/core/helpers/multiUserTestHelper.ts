import { Browser, BrowserContext, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { TestUser } from '@core/types/test.types';
import { BrowserFactory, MultiUserContexts } from '@core/utils/browserFactory';

export class MultiUserTestHelper {
  protected multiUserContexts!: MultiUserContexts;
  protected browserFactory!: BrowserFactory;
  protected defaultPassword = 'Simpplr@2025';
  private recordVideo = false;
  public testUsers: TestUser[] = [];

  constructor(browser: Browser, options?: { recordVideo?: boolean }) {
    this.browserFactory = new BrowserFactory(browser);
    this.recordVideo = options?.recordVideo ?? false;
  }

  /**
   * Get the page based on the user email
   * @param email - The email of the user for which the page is required
   * @returns The page for the user
   */
  public getPageForUser(email: string) {
    return this.multiUserContexts[email].page;
  }

  /**
   * Get the context based on the user email
   * @param email - The email of the user for which the context is required
   * @returns The context for the user
   */
  public getContextForUser(email: string) {
    return this.multiUserContexts[email];
  }

  /**
   * Clean up the browser contexts and videos (if recordVideo is true)
   */
  public async cleanup() {
    if (!this.multiUserContexts) {
      return;
    }
    for (const [userEmail, { context, videoDir }] of Object.entries(this.multiUserContexts)) {
      await BrowserFactory.closeContext(context, userEmail);
    }
  }

  /**
   * Creates browser contexts for a list of users
   * @param users - The list of users for which the contexts are required
   * @returns The browser contexts for the users
   */
  public async createContextsForUsers(users: TestUser[]) {
    return await test.step(`Creating browser contexts for users`, async () => {
      const contexts: MultiUserContexts = {};
      for (const user of users) {
        contexts[user.email] = await this.browserFactory.createNewContextAndPage({
          recordVideo: this.recordVideo,
        });
      }
      this.multiUserContexts = contexts;
      return contexts;
    });
  }

  /**
   * Creates logged in contexts for a list of users
   * @param listOfUsers - The list of users for which the logged in contexts are required
   * @returns The logged in contexts for the users
   */
  async createLoggedInContextsForUsers(listOfUsers: TestUser[]) {
    const loggedInContexts: { [key: string]: BrowserContext } = {};
    return await test.step(`Simultaneously logging in and navigating to chats for users  ${listOfUsers.map(user => user.email).join(', ')}`, async () => {
      const loginPromises = listOfUsers.map(async user => {
        const page = this.getPageForUser(user.email);
        return await LoginHelper.loginWithPassword(page, { email: user.email, password: this.defaultPassword });
      });
      const listOfHomePages = await Promise.all(loginPromises);
      //close all the pages
      //map each context to the user email
      const loggedInContexts = listOfHomePages.reduce(
        (acc, homePage, index) => {
          acc[listOfUsers[index].email] = homePage.page.context();
          return acc;
        },
        {} as { [key: string]: BrowserContext }
      );
      await Promise.all(listOfHomePages.map(homePage => homePage.page?.close()));
      return loggedInContexts;
    });
  }
}
