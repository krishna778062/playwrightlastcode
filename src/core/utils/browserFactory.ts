import { Browser, BrowserContext, Page, test } from '@playwright/test';
import { nanoid } from 'nanoid';
import path from 'path';
import { FileUtil } from '@/src/core/utils/fileUtil';

export interface UserContext {
  context: BrowserContext;
  page: Page;
  videoDir?: string;
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
   * Creates a new browser context and page
   * @param options - The options for the context and page
   * @returns A UserContext object containing the new context and page
   */
  async createNewContextAndPage(options?: { recordVideo?: boolean }): Promise<UserContext> {
    const contextOptions: any = {};
    let videoDir: string | undefined;

    if (options?.recordVideo) {
      const videoTempDir = path.join('videos', nanoid());
      FileUtil.createDir(videoTempDir);
      videoDir = videoTempDir;
      contextOptions.recordVideo = {
        dir: videoDir,
      };
    }
    const context = await this.browser.newContext(contextOptions);
    const page = await context.newPage();
    return { context, page, videoDir };
  }

  /**
   * Closes a browser context safely.
   * @param context - The browser context to close.
   * @param userId - Optional user identifier for logging purposes.
   */
  public static async closeContext(context: BrowserContext, userId?: string): Promise<void> {
    try {
      const reason = userId ? `Tear down for user ${userId}` : 'Tear down';
      await context.close({ reason });
    } catch (error) {
      const userMsg = userId ? `for user ${userId}` : '';
      console.error(`Failed to close context ${userMsg}:`, error);
    }
  }

  public static async closePageGracefullyForUser(page: Page, userName?: string) {
    try {
      //THIS IS USED TO GENERATE A UNIQUE NAME FOR THE VIDEO FILE ATTACHMENT
      const userNameToUse = userName ?? nanoid();
      const videoPath = await page.video()?.path();
      await page.close();
      if (videoPath) {
        const projectName = test.info().project.name;
        const listOfProjects = test.info().config.projects;
        for (const project of listOfProjects) {
          if (project.name === projectName) {
            if (project.use.video !== 'off') {
              if (project.use.video === 'on-first-retry' && test.info().retry > 0) {
                await test.info().attach(`video-${userNameToUse}`, {
                  path: videoPath,
                  contentType: 'video/webm',
                });
              } else if (project.use.video === 'on') {
                await test.info().attach(`video-${userNameToUse}`, {
                  path: videoPath,
                  contentType: 'video/webm',
                });
              } else if (project.use.video === 'retain-on-failure' && test.info().status === 'failed') {
                await test.info().attach(`video-${userNameToUse}`, {
                  path: videoPath,
                  contentType: 'video/webm',
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to close page:`, error);
    }
  }
}
