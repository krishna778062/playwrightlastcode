import { faker } from '@faker-js/faker';

import { User } from '@core/types/user.type';

import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { AlbumCreationOptions } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationOptions } from '@/src/modules/content/pages/eventCreationPage';
import { PageCreationOptions } from '@/src/modules/content/pages/pageCreationPage';

export class TestDataGenerator {
  /**
   * Generates a random user with realistic data
   * @param overrides Optional properties to override in the generated user
   * @param identifiers Optional object specifying which login identifiers to include
   * @returns A User object with random realistic data
   *
   * @example
   * // Generate user with all identifiers (default behavior)
   * const user = TestDataGenerator.generateUser();
   *
   * // Generate user with only email
   * const emailUser = TestDataGenerator.generateUser({}, { email: true });
   *
   * // Generate user with only mobile
   * const mobileUser = TestDataGenerator.generateUser({}, { mobile: true });
   *
   * // Generate user with only employee number
   * const empUser = TestDataGenerator.generateUser({}, { emp: true });
   *
   * // Generate user with email and mobile
   * const emailMobileUser = TestDataGenerator.generateUser({}, { email: true, mobile: true });
   *
   * // Generate user with email and employee number
   * const emailEmpUser = TestDataGenerator.generateUser({}, { email: true, emp: true });
   *
   * // Generate user with mobile and employee number
   * const mobileEmpUser = TestDataGenerator.generateUser({}, { mobile: true, emp: true });
   *
   * // Generate user with custom overrides and specific identifiers
   * const customUser = TestDataGenerator.generateUser(
   *   { first_name: 'John', last_name: 'Doe' },
   *   { email: true, emp: true }
   * );
   */
  static generateUser(
    overrides?: Partial<User>,
    identifiers?: { email?: boolean; mobile?: boolean; emp?: boolean }
  ): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // If identifiers object is specified, use it to determine which fields to include
    if (identifiers) {
      return {
        first_name: firstName,
        last_name: lastName,
        username: `${firstName} ${lastName}`,
        email: identifiers.email ? faker.internet.email({ provider: 'simpplr.com' }) : '',
        mobile: identifiers.mobile ? faker.number.int({ min: 1000000000, max: 9999999999 }) : 0,
        emp: identifiers.emp ? faker.string.alphanumeric(8).toUpperCase() : '',
        timezone_id: 17,
        language_id: 1,
        locale_id: 1,
        ...overrides,
      };
    }

    // Default behavior (all identifiers) - backward compatible
    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: faker.internet.email({ provider: 'simpplr.com' }),
      mobile: faker.number.int({ min: 1000000000, max: 9999999999 }),
      emp: faker.string.alphanumeric(8).toUpperCase(),
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates a user with only email as login identifier
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with only email
   */
  static generateUserWithEmail(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: faker.internet.email({ provider: 'simpplr.com' }),
      mobile: 0, // Default value for compatibility
      emp: '', // Empty string for compatibility
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates a user with only mobile as login identifier
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with only mobile
   */
  static generateUserWithMobile(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: '', // Empty string for compatibility
      mobile: faker.number.int({ min: 1000000000, max: 9999999999 }),
      emp: '', // Empty string for compatibility
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates a user with only employee number as login identifier
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with only emp
   */
  static generateUserWithEmp(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: '', // Empty string for compatibility
      mobile: 0, // Default value for compatibility
      emp: faker.string.alphanumeric(8).toUpperCase(),
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates a user with email and mobile as login identifiers
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with email and mobile
   */
  static generateUserWithEmailAndMobile(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: faker.internet.email({ provider: 'simpplr.com' }),
      mobile: faker.number.int({ min: 1000000000, max: 9999999999 }),
      emp: '', // Empty string for compatibility
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates a user with email and employee number as login identifiers
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with email and emp
   */
  static generateUserWithEmailAndEmp(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: faker.internet.email({ provider: 'simpplr.com' }),
      mobile: 0, // Default value for compatibility
      emp: faker.string.alphanumeric(8).toUpperCase(),
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates a user with mobile and employee number as login identifiers
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with mobile and emp
   */
  static generateUserWithMobileAndEmp(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      first_name: firstName,
      last_name: lastName,
      username: `${firstName} ${lastName}`,
      email: '', // Empty string for compatibility
      mobile: faker.number.int({ min: 1000000000, max: 9999999999 }),
      emp: faker.string.alphanumeric(8).toUpperCase(),
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

  /**
   * Generates a random QR code name with timestamp to ensure uniqueness
   * @param prefix Optional prefix for the QR code name
   * @returns A unique QR code name
   */
  static generateQRName(prefix: string = 'QR'): string {
    const randomWord = faker.word.sample();
    const timestamp = Date.now();
    return `${prefix}-${randomWord}-${timestamp}`;
  }

  /**
   * Generates a random QR code description
   * @param prefix Optional prefix for the description
   * @returns A random QR code description
   */
  static generateQRDescription(prefix: string = 'QR Code Description'): string {
    const randomWords = faker.lorem.words(5);
    const timestamp = Date.now();
    return `${prefix}: ${randomWords} - ${timestamp}`;
  }

  /**
   * Generates a unique category name with specified length and starting alphabet characters
   * @param maxLength - Maximum length of the category name
   * @param startingAlphabetCount - Number of alphabet characters to start with
   * @returns Generated unique category name
   */
  static generateUniqueCategoryName(maxLength: number, startingAlphabetCount: number): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    // Start with alphabet characters (A-Z, a-z)
    const alphabetChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let startingPart = '';

    // Generate starting alphabet characters
    for (let i = 0; i < startingAlphabetCount; i++) {
      startingPart += alphabetChars.charAt(Math.floor(Math.random() * alphabetChars.length));
    }

    // Combine: starting alphabets + random suffix + timestamp
    const combined = `${startingPart}${randomSuffix}${timestamp}`;

    // Ensure it doesn't exceed max length
    const result = combined.substring(0, maxLength);

    console.log(`Generated unique category name: ${result.substring(0, 30)}... (${result.length} characters)`);
    return result;
  }

  /**
   * Generates feed test data with customizable options
   * @param options Configuration options for the feed
   * @returns Object with feed creation parameters
   *
   * @example
   * // Generate public feed without attachment
   * const publicFeed = TestDataGenerator.generateFeed({ scope: 'public' });
   *
   * // Generate site feed with attachment
   * const siteFeed = TestDataGenerator.generateFeed({
   *   scope: 'site',
   *   siteId: 'site123',
   *   withAttachment: true
   * });
   *
   * // Generate feed with custom text
   * const customFeed = TestDataGenerator.generateFeed({
   *   scope: 'public',
   *   text: 'Custom post text'
   * });
   */
  static generateFeed(
    options:
      | {
          scope: string;
          siteId?: string;
          withAttachment?: false;
          fileName?: undefined;
          fileSize?: undefined;
          mimeType?: undefined;
          filePath?: undefined;
          waitForSearchIndex?: boolean;
        }
      | {
          scope: string;
          siteId?: string;
          withAttachment: true;
          fileName: string;
          fileSize: number;
          mimeType: string;
          filePath: string; // Required when withAttachment is true
          waitForSearchIndex?: boolean;
        }
  ) {
    if ('withAttachment' in options && options.withAttachment) {
      const { scope, siteId, fileName, fileSize, mimeType, filePath, waitForSearchIndex = false } = options;
      return {
        text: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Post - ${faker.commerce.productName()}`,
        scope,
        siteId: siteId || undefined,
        withAttachment: true as const,
        fileName,
        fileSize,
        mimeType,
        filePath,
        options: {
          waitForSearchIndex,
        },
      };
    } else {
      const { scope, siteId, waitForSearchIndex = false } = options;
      return {
        text: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Post - ${faker.commerce.productName()}`,
        scope,
        siteId: siteId || undefined,
        withAttachment: false as const,
        fileName: undefined,
        fileSize: undefined,
        mimeType: undefined,
        filePath: undefined,
        options: {
          waitForSearchIndex,
        },
      };
    }
  }
}
