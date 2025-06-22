import { Browser, test } from '@playwright/test';
import { BrowserFactory, MultiUserContexts } from '@/src/core/utils/browserFactory';
import { ChatTestUser } from '@chat/types';
import { FileUtil } from '@/src/core/utils/fileUtil';

export class MultiUserTestHelper {
  protected multiUserContexts!: MultiUserContexts;
  protected browserFactory!: BrowserFactory;
  private recordVideo = false;

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
    await test.step('Attaching videos and cleaning up contexts', async () => {
      for (const [userEmail, { context, videoDir }] of Object.entries(this.multiUserContexts)) {
        await BrowserFactory.closeContext(context, userEmail);
        if (this.recordVideo && videoDir) {
          try {
            const files = FileUtil.readDir(videoDir);
            if (files.length > 0) {
              const videoPath = FileUtil.getFilePath(videoDir, files[0]);
              await test.info().attach(`video-${userEmail}`, {
                path: videoPath,
                contentType: 'video/webm',
              });
              // Clean up the temporary directory
              FileUtil.removeDir(videoDir);
            }
          } catch (error) {
            console.error(`Failed to attach video for user ${userEmail}:`, error);
          }
        }
      }
    });
  }

  public async createContextsForUsers(users: ChatTestUser[]) {
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
}
