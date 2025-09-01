import { faker } from '@faker-js/faker';

import { User } from '@core/types/user.type';

import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { AlbumCreationOptions } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationOptions } from '@/src/modules/content/pages/eventCreationPage';
import { PageCreationOptions } from '@/src/modules/content/pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

export class TestDataGenerator {
  /**
   * Generates a random user with realistic data
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with random realistic data
   */
  static generateUser(overrides?: Partial<User>): User {
    return {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email({ provider: 'simpplr.com' }),
      mobile: faker.number.int({ min: 1000000000, max: 9999999999 }),
      emp: faker.string.alphanumeric(8),
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates multiple random users
   * @param count Number of users to generate
   * @param overrides Optional properties to override in all generated users
   * @returns Array of User objects
   */
  static generateUsers(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.generateUser(overrides));
  }

  /**
   * Generates a unique email that won't conflict with existing users
   * @param prefix Optional prefix for the email
   * @returns A unique email address
   */
  static generateUniqueEmail(prefix?: string): string {
    const timestamp = Date.now();
    const randomString = faker.string.alphanumeric(6);
    const emailPrefix = prefix || faker.internet.username();
    return `${emailPrefix}.${timestamp}.${randomString}@simpplr.com`;
  }

  /**
   * Generates a random group name with a timestamp to ensure uniqueness
   * @returns A unique group name
   */
  static generateGroupName(): string {
    const prefix = faker.word.sample();
    const timestamp = Date.now();
    return `${prefix}-group-${timestamp}`;
  }

  // Helper function to generate unique category names with consistent timestamp-based naming
  static generateCategoryName(prefix: string = 'TestCategory'): string {
    return `${prefix}_${Date.now()}`;
  }

  // Helper function to generate test description with timestamp
  static generateRandomString(prefix: string = 'Test description for category'): string {
    return `${prefix} created at ${new Date().toISOString()}`;
  }

  static generateCategoryNameAndDescription(): { name: string; description: string } {
    const name = this.generateCategoryName();
    const description = this.generateRandomString();
    return { name, description };
  }

  /**
   * Generates a random page with realistic data
   * @param contentType Content type for the page
   * @param fileName Cover image file name
   * @param category Optional category for the page (if empty string generates random category)
   * @param overrides Optional properties to override in the generated page
   * @returns A PageCreationOptions object with random realistic data
   */
  static generatePage(
    contentType: PageContentType,
    fileName: string,
    category?: string,
    overrides?: Partial<PageCreationOptions>
  ): PageCreationOptions {
    // Handle category special cases
    const finalCategory = category === undefined ? faker.word.noun().toLowerCase() : category;

    const pageOptions: PageCreationOptions = {
      title: `Automated Test Page ${faker.company.name()} - ${faker.commerce.productName()}`,
      description: `This is an automated test description ${faker.lorem.paragraph()}`,
      category: finalCategory,
      contentType: contentType,
      coverImage: {
        fileName,
        cropOptions: {
          widescreen: false,
          square: false,
        },
      },
    };

    return {
      ...pageOptions,
      ...overrides,
    };
  }

  /**
   * Generates multiple random pages
   * @param count Number of pages to generate
   * @param contentType Content type for the pages
   * @param fileName Cover image file name for the pages
   * @param category Optional category for the pages (if empty string generates random category)
   * @param overrides Optional properties to override in all generated pages
   * @returns Array of PageCreationOptions objects
   */
  static generatePages(
    count: number,
    contentType: PageContentType,
    fileName: string,
    category?: string,
    overrides?: Partial<PageCreationOptions>
  ): PageCreationOptions[] {
    return Array.from({ length: count }, () => this.generatePage(contentType, fileName, category, overrides));
  }

  /**
   * Generates a random album with realistic data
   * @param overrides Optional properties to override in the generated album
   * @returns An AlbumCreationOptions object with random realistic data
   */
  static generateAlbum(
    fileName: string,
    attachmentFileName?: string,
    videoUrl?: string,
    openAlbum?: boolean,
    overrides?: Partial<AlbumCreationOptions>
  ): AlbumCreationOptions {
    const albumOptions: AlbumCreationOptions = {
      title: `Automated Test Page ${faker.company.name()} - ${faker.commerce.productName()}`,
      description: `This is an automated test description ${faker.lorem.paragraph()}`,
      images: [fileName],
      videoUrl: videoUrl,
      attachments: attachmentFileName ? [attachmentFileName] : undefined,
      openAlbum: openAlbum,
      topics: [faker.company.name()],
    };

    return {
      ...albumOptions,
      ...overrides,
    };
  }

  /**
   * Generates multiple random albums
   * @param count Number of albums to generate
   * @param overrides Optional properties to override in all generated albums
   * @returns Array of AlbumCreationOptions objects
   */
  static generateAlbums(
    count: number,
    fileName: string,
    attachmentFileName?: string,
    videoUrl?: string,
    openAlbum?: boolean,
    overrides?: Partial<AlbumCreationOptions>
  ): AlbumCreationOptions[] {
    return Array.from({ length: count }, () =>
      this.generateAlbum(fileName, attachmentFileName, videoUrl, openAlbum, overrides)
    );
  }

  /**
   * Generates a random event with realistic data
   * @param overrides Optional properties to override in the generated event
   * @returns An EventCreationOptions object with random realistic data
   */
  static generateEvent(
    fileName?: string,
    startDate?: string,
    endDate?: string,
    overrides?: Partial<EventCreationOptions>
  ): EventCreationOptions {
    const eventOptions: EventCreationOptions = {
      title: `Automated Test Event ${faker.company.name()} - ${faker.commerce.productName()}`,
      description: `This is an automated test event description ${faker.lorem.paragraph()}`,
      startDate: startDate || faker.date.future().toISOString().split('T')[0],
      endDate: endDate || faker.date.future().toISOString().split('T')[0],
      location: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      coverImage: fileName
        ? {
            fileName,
            cropOptions: {
              widescreen: false,
              square: false,
            },
          }
        : undefined,
    };

    return {
      ...eventOptions,
      ...overrides,
    };
  }

  /**
   * Generates multiple random events
   * @param count Number of events to generate
   * @param overrides Optional properties to override in all generated events
   * @returns Array of EventCreationOptions objects
   */
  static generateEvents(count: number, overrides?: Partial<EventCreationOptions>): EventCreationOptions[] {
    return Array.from({ length: count }, () => this.generateEvent(undefined, undefined, undefined, overrides));
  }

  /**
   * Generates a random site with realistic data
   * @param fileName Optional cover image file name
   * @param overrides Optional properties to override in the generated site
   * @returns A SiteCreationOptions object with random realistic data
   */
  static generateSite(access: string, overrides?: Partial<any>): any {
    const siteOptions = {
      name: `Automated Test Site ${faker.company.name()} - ${faker.commerce.department()}`.substring(0, 39),
      description: `This is an automated test site description ${faker.lorem.paragraph()}`,
      siteCategory: faker.word.noun().toLowerCase(),
      access: access,
    };

    return {
      ...siteOptions,
      ...overrides,
    };
  }

  /**
   * Generates multiple random sites
   * @param count Number of sites to generate
   * @param fileName Optional cover image file name
   * @param overrides Optional properties to override in all generated sites
   * @returns Array of SiteCreationOptions objects
   */
  static generateSites(count: number, access: string, overrides?: Partial<any>): any[] {
    return Array.from({ length: count }, () => this.generateSite(access, overrides));
  }
}
