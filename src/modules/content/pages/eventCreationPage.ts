import { Page } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

export interface EventCreationOptions {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isAllDay?: boolean;
  isVirtual?: boolean;
  virtualLink?: string;
  category?: string;
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
  attachments?: string[];
  topics?: string[];
}

export class EventCreationPage extends BasePage {
  verifyThePageIsLoaded(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  constructor(page: Page) {
    super(page);
  }

  get actions() {
    return undefined;
  }

  get assertions() {
    return undefined;
  }
}
