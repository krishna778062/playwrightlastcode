import { expect, test } from '@playwright/test';

import { AlbumCreationResponse, EventCreationResponse, PageCreationResponse } from '@/src/modules/content/apis/types';

export class ContentApiHelper {
  /**
   * Validates the basic content response structure (status)
   * @param contentResponse - The content response to validate (Page, Event, or Album)
   */
  async validateContentResponseBasic(
    contentResponse: PageCreationResponse | EventCreationResponse | AlbumCreationResponse
  ): Promise<void> {
    await test.step('Validate content response basic fields', async () => {
      expect(contentResponse.status, 'Status should be success').toBe('success');
      expect(contentResponse.result, 'Result should exist').toBeDefined();
    });
  }

  /**
   * Validates page identification fields (id, title, type)
   * @param pageResponse - The page response to validate
   * @param expectedTitle - Optional expected title text
   */
  async validatePageIdentification(pageResponse: PageCreationResponse, expectedTitle?: string): Promise<void> {
    await test.step('Validate page identification fields', async () => {
      expect(pageResponse.result.id, 'Page ID should be present').toBeTruthy();
      expect(typeof pageResponse.result.id, 'Page ID should be a string').toBe('string');
      expect(pageResponse.result.title, 'Page title should be present').toBeTruthy();
      expect(typeof pageResponse.result.title, 'Page title should be a string').toBe('string');
      expect(pageResponse.result.type, 'Page type should be "page"').toBe('page');
      if (expectedTitle) {
        expect(pageResponse.result.title, 'Page title should match expected text').toContain(expectedTitle);
      }
    });
  }

  /**
   * Validates page site information
   * @param pageResponse - The page response to validate
   * @param expectedSiteId - Optional expected site ID
   */
  async validatePageSiteInfo(pageResponse: PageCreationResponse, expectedSiteId?: string): Promise<void> {
    await test.step('Validate page site information', async () => {
      expect(pageResponse.result.site, 'Site should exist').toBeDefined();
      expect(pageResponse.result.site.siteId, 'Site ID should be present').toBeTruthy();
      expect(typeof pageResponse.result.site.siteId, 'Site ID should be a string').toBe('string');
      if (expectedSiteId) {
        expect(pageResponse.result.site.siteId, 'Site ID should match expected').toBe(expectedSiteId);
      }
    });
  }

  /**
   * Validates page metadata (status, published, authoredBy)
   * @param pageResponse - The page response to validate
   */
  async validatePageMetadata(pageResponse: PageCreationResponse): Promise<void> {
    await test.step('Validate page metadata', async () => {
      expect(pageResponse.result.status, 'Status should be present').toBeTruthy();
      expect(typeof pageResponse.result.isPublished, 'isPublished should be a boolean').toBe('boolean');
      expect(pageResponse.result.authoredBy, 'authoredBy should exist').toBeDefined();
      expect(pageResponse.result.authoredBy.name, 'Author name should be present').toBeTruthy();
      expect(pageResponse.result.createdAt, 'createdAt should be present').toBeTruthy();
      expect(pageResponse.result.modifiedAt, 'modifiedAt should be present').toBeTruthy();
    });
  }

  /**
   * Validates event identification fields (id, title, type)
   * @param eventResponse - The event response to validate
   * @param expectedTitle - Optional expected title text
   */
  async validateEventIdentification(eventResponse: EventCreationResponse, expectedTitle?: string): Promise<void> {
    await test.step('Validate event identification fields', async () => {
      expect(eventResponse.result.id, 'Event ID should be present').toBeTruthy();
      expect(typeof eventResponse.result.id, 'Event ID should be a string').toBe('string');
      expect(eventResponse.result.title, 'Event title should be present').toBeTruthy();
      expect(typeof eventResponse.result.title, 'Event title should be a string').toBe('string');
      expect(eventResponse.result.type, 'Event type should be "event"').toBe('event');
      if (expectedTitle) {
        expect(eventResponse.result.title, 'Event title should match expected text').toContain(expectedTitle);
      }
    });
  }

  /**
   * Validates event site information
   * @param eventResponse - The event response to validate
   * @param expectedSiteId - Optional expected site ID
   */
  async validateEventSiteInfo(eventResponse: EventCreationResponse, expectedSiteId?: string): Promise<void> {
    await test.step('Validate event site information', async () => {
      expect(eventResponse.result.site, 'Site should exist').toBeDefined();
      expect(eventResponse.result.site.siteId, 'Site ID should be present').toBeTruthy();
      expect(typeof eventResponse.result.site.siteId, 'Site ID should be a string').toBe('string');
      expect(eventResponse.result.site.access, 'Site access should be "public" for public site').toBe('public');
      expect(eventResponse.result.site.isPublic, 'Site isPublic should be true').toBe(true);
      if (expectedSiteId) {
        expect(eventResponse.result.site.siteId, 'Site ID should match expected').toBe(expectedSiteId);
      }
    });
  }

  /**
   * Validates event metadata (status, dates, authoredBy)
   * @param eventResponse - The event response to validate
   */
  async validateEventMetadata(eventResponse: EventCreationResponse): Promise<void> {
    await test.step('Validate event metadata', async () => {
      expect(eventResponse.result.status, 'Status should be present').toBeTruthy();
      expect(eventResponse.result.startsAt, 'startsAt should be present').toBeTruthy();
      expect(eventResponse.result.endsAt, 'endsAt should be present').toBeTruthy();
      expect(eventResponse.result.authoredBy, 'authoredBy should exist').toBeDefined();
      expect(eventResponse.result.authoredBy.name, 'Author name should be present').toBeTruthy();
      expect(eventResponse.result.createdAt, 'createdAt should be present').toBeTruthy();
      expect(eventResponse.result.modifiedAt, 'modifiedAt should be present').toBeTruthy();
      expect(typeof eventResponse.result.isAllDay, 'isAllDay should be a boolean').toBe('boolean');
    });
  }

  /**
   * Validates album identification fields (id, title, type)
   * @param albumResponse - The album response to validate
   * @param expectedTitle - Optional expected title text
   */
  async validateAlbumIdentification(albumResponse: AlbumCreationResponse, expectedTitle?: string): Promise<void> {
    await test.step('Validate album identification fields', async () => {
      expect(albumResponse.result.id, 'Album ID should be present').toBeTruthy();
      expect(typeof albumResponse.result.id, 'Album ID should be a string').toBe('string');
      expect(albumResponse.result.title, 'Album title should be present').toBeTruthy();
      expect(typeof albumResponse.result.title, 'Album title should be a string').toBe('string');
      expect(albumResponse.result.type, 'Album type should be "album"').toBe('album');
      if (expectedTitle) {
        expect(albumResponse.result.title, 'Album title should match expected text').toContain(expectedTitle);
      }
    });
  }

  /**
   * Validates album site information
   * @param albumResponse - The album response to validate
   * @param expectedSiteId - Optional expected site ID
   */
  async validateAlbumSiteInfo(albumResponse: AlbumCreationResponse, expectedSiteId?: string): Promise<void> {
    await test.step('Validate album site information', async () => {
      expect(albumResponse.result.site, 'Site should exist').toBeDefined();
      expect(albumResponse.result.site.siteId, 'Site ID should be present').toBeTruthy();
      expect(typeof albumResponse.result.site.siteId, 'Site ID should be a string').toBe('string');
      if (expectedSiteId) {
        expect(albumResponse.result.site.siteId, 'Site ID should match expected').toBe(expectedSiteId);
      }
    });
  }

  /**
   * Validates album metadata (status, published, authoredBy)
   * @param albumResponse - The album response to validate
   */
  async validateAlbumMetadata(albumResponse: AlbumCreationResponse): Promise<void> {
    await test.step('Validate album metadata', async () => {
      expect(albumResponse.result.status, 'Status should be present').toBeTruthy();
      expect(typeof albumResponse.result.isPublished, 'isPublished should be a boolean').toBe('boolean');
      expect(albumResponse.result.authoredBy, 'authoredBy should exist').toBeDefined();
      expect(albumResponse.result.authoredBy.name, 'Author name should be present').toBeTruthy();
      expect(albumResponse.result.createdAt, 'createdAt should be present').toBeTruthy();
      expect(albumResponse.result.modifiedAt, 'modifiedAt should be present').toBeTruthy();
    });
  }

  /**
   * Validates a complete page creation response
   * @param pageResponse - The page response to validate
   * @param expectedTitle - Optional expected title text
   * @param expectedSiteId - Optional expected site ID
   */
  async validatePageCreation(
    pageResponse: PageCreationResponse,
    expectedTitle?: string,
    expectedSiteId?: string
  ): Promise<void> {
    await this.validateContentResponseBasic(pageResponse);
    await this.validatePageIdentification(pageResponse, expectedTitle);
    await this.validatePageSiteInfo(pageResponse, expectedSiteId);
    await this.validatePageMetadata(pageResponse);
  }

  /**
   * Validates a complete event creation response
   * @param eventResponse - The event response to validate
   * @param expectedTitle - Optional expected title text
   * @param expectedSiteId - Optional expected site ID
   */
  async validateEventCreation(
    eventResponse: EventCreationResponse,
    expectedTitle?: string,
    expectedSiteId?: string
  ): Promise<void> {
    await this.validateContentResponseBasic(eventResponse);
    await this.validateEventIdentification(eventResponse, expectedTitle);
    await this.validateEventSiteInfo(eventResponse, expectedSiteId);
    await this.validateEventMetadata(eventResponse);
  }

  /**
   * Validates a complete album creation response
   * @param albumResponse - The album response to validate
   * @param expectedTitle - Optional expected title text
   * @param expectedSiteId - Optional expected site ID
   */
  async validateAlbumCreation(
    albumResponse: AlbumCreationResponse,
    expectedTitle?: string,
    expectedSiteId?: string
  ): Promise<void> {
    await this.validateContentResponseBasic(albumResponse);
    await this.validateAlbumIdentification(albumResponse, expectedTitle);
    await this.validateAlbumSiteInfo(albumResponse, expectedSiteId);
    await this.validateAlbumMetadata(albumResponse);
  }
}
