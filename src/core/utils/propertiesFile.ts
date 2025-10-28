import * as fs from 'fs';
import * as path from 'path';

/**
 * Properties file utility similar to Java Properties
 * Allows reading and writing key-value pairs to a properties file
 */
export class PropertiesFile {
  private properties: Map<string, string> = new Map();
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  /**
   * Load properties from file
   */
  load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const lines = content.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          // Skip empty lines and comments
          if (trimmed && !trimmed.startsWith('#')) {
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex > 0) {
              const key = trimmed.substring(0, equalIndex).trim();
              const value = trimmed.substring(equalIndex + 1).trim();
              this.properties.set(key, value);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error loading properties file ${this.filePath}:`, error);
    }
  }

  /**
   * Get property value by key
   */
  getProperty(key: string): string | undefined {
    return this.properties.get(key);
  }

  /**
   * Set property value
   */
  setProperty(key: string, value: string): void {
    this.properties.set(key, value);
  }

  /**
   * Save properties to file
   */
  store(comment?: string | null): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write properties to file
      let content = '';
      if (comment) {
        content += `# ${comment}\n`;
      }

      for (const [key, value] of this.properties) {
        content += `${key}=${value}\n`;
      }

      fs.writeFileSync(this.filePath, content, 'utf-8');
    } catch (error) {
      console.error(`Error saving properties file ${this.filePath}:`, error);
      throw error;
    }
  }
}
