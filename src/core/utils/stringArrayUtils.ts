import { expect, Locator, Page, test } from '@playwright/test';

export class StringArrayVerifier {
  constructor(readonly page: Page) {
    this.page = page;
  }

  async areArraysEqualIgnoreCase(arr1: string[], arr2: string[]): Promise<boolean> {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((val, index) => val.toLowerCase() === arr2[index].toLowerCase());
  }
}
