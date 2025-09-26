import { faker } from '@faker-js/faker';

export class LinkTestDataGenerator {
  /**
   * Generates random alphabetic text
   */
  static generateText(min: number = 7, max: number = 8): string {
    return faker.string.alpha({ length: { min, max } });
  }

  /**
   * Generates random text pair for link testing
   */
  static generateLinkPair(): { displayText: string; urlText: string } {
    return {
      displayText: this.generateText(),
      urlText: this.generateText(),
    };
  }

  /**
   * Generates valid link pair with proper URL format
   */
  static generateValidLinkPair(): { displayText: string; urlText: string } {
    return {
      displayText: this.generateText(),
      urlText: faker.internet.url(),
    };
  }
}
