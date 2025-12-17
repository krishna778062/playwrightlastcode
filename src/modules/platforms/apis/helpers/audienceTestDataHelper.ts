import { APIRequestContext, test } from '@playwright/test';

// Fallback constants for when API calls fail
const FALLBACK_IDS = {
  SECURITY_GROUP: '6e9d7856-8e08-4c0f-b866-94a0aacd2021',
  OKTA_BUILT_IN: '00g6vnon0k3BDmhMv5d7',
  MICROSOFT_365: '7f8e9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
  MAIL_SECURITY: '8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
  DISTRIBUTION: '9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e',
  COUNTRY: 'United States',
} as const;

/**
 * Simple helper for fetching security group ID from API
 */
export class AudienceTestDataHelper {
  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {}

  /**
   * Gets a security group ID from the API
   * @returns Security group ID string
   */
  async getSecurityGroupId(): Promise<string> {
    return await test.step('Fetching security group ID', async () => {
      try {
        const response = await this.apiRequestContext.get(
          `${this.baseUrl}/v2/identity/audiences/external-groups/Azure?type=security&size=16`
        );

        if (!response.ok()) {
          throw new Error(`API call failed: ${response.status()}`);
        }

        const data = await response.json();

        const groups = data.result?.listOfItems || [];

        if (groups.length === 0) {
          throw new Error('No security groups found');
        }

        const groupId = groups[0].groupId;
        return groupId;
      } catch (error) {
        console.warn(`Failed to fetch security group ID from API, using fallback: ${error}`);
        return FALLBACK_IDS.SECURITY_GROUP;
      }
    });
  }

  /**
   * Gets an Okta Built-in group ID from the API
   * @returns Okta Built-in group ID string
   */
  async getOktaBuiltInGroupId(): Promise<string> {
    return await test.step('Fetching Okta Built-in group ID', async () => {
      try {
        const response = await this.apiRequestContext.get(
          `${this.baseUrl}/v2/identity/audiences/external-groups/Okta?type=BUILT_IN&size=16`
        );

        if (!response.ok()) {
          throw new Error(`API call failed: ${response.status()}`);
        }

        const data = await response.json();

        const groups = data.result?.listOfItems || [];

        if (groups.length === 0) {
          throw new Error('No Okta Built-in groups found');
        }

        const groupId = groups[0].groupId;
        return groupId;
      } catch (error) {
        console.warn(`Failed to fetch Okta Built-in group ID from API, using fallback: ${error}`);
        return FALLBACK_IDS.OKTA_BUILT_IN;
      }
    });
  }

  /**
   * Gets a Microsoft 365 group ID from the API
   * @returns Microsoft 365 group ID string
   */
  async getMicrosoft365GroupId(): Promise<string> {
    return await test.step('Fetching Microsoft 365 group ID', async () => {
      try {
        const response = await this.apiRequestContext.get(
          `${this.baseUrl}/v2/identity/audiences/external-groups/Azure?type=microsoft365&size=16`
        );

        if (!response.ok()) {
          throw new Error(`API call failed: ${response.status()}`);
        }

        const data = await response.json();

        const groups = data.result?.listOfItems || [];

        if (groups.length === 0) {
          throw new Error('No Microsoft 365 groups found');
        }

        const groupId = groups[0].groupId;
        return groupId;
      } catch (error) {
        console.warn(`Failed to fetch Microsoft 365 group ID from API, using fallback: ${error}`);
        return FALLBACK_IDS.MICROSOFT_365;
      }
    });
  }

  /**
   * Gets a Mail Security group ID from the API
   * @returns Mail Security group ID string
   */
  async getMailSecurityGroupId(): Promise<string> {
    return await test.step('Fetching Mail Security group ID', async () => {
      try {
        const response = await this.apiRequestContext.get(
          `${this.baseUrl}/v2/identity/audiences/external-groups/Azure?type=mail-security&size=16`
        );

        if (!response.ok()) {
          throw new Error(`API call failed: ${response.status()}`);
        }

        const data = await response.json();

        const groups = data.result?.listOfItems || [];

        if (groups.length === 0) {
          throw new Error('No Mail Security groups found');
        }

        const groupId = groups[0].groupId;
        return groupId;
      } catch (error) {
        console.warn(`Failed to fetch Mail Security group ID from API, using fallback: ${error}`);
        return FALLBACK_IDS.MAIL_SECURITY;
      }
    });
  }

  /**
   * Gets a Distribution group ID from the API
   * @returns Distribution group ID string
   */
  async getDistributionGroupId(): Promise<string> {
    return await test.step('Fetching Distribution group ID', async () => {
      try {
        const response = await this.apiRequestContext.get(
          `${this.baseUrl}/v2/identity/audiences/external-groups/Azure?type=distribution&size=16`
        );

        if (!response.ok()) {
          throw new Error(`API call failed: ${response.status()}`);
        }

        const data = await response.json();

        const groups = data.result?.listOfItems || [];

        if (groups.length === 0) {
          throw new Error('No Distribution groups found');
        }

        const groupId = groups[0].groupId;
        return groupId;
      } catch (error) {
        console.warn(`Failed to fetch Distribution group ID from API, using fallback: ${error}`);
        return FALLBACK_IDS.DISTRIBUTION;
      }
    });
  }

  /**
   * Gets a Country value from the API
   * @returns Country value string
   */
  async getCountryValue(): Promise<string> {
    return await test.step('Fetching Country value', async () => {
      try {
        const response = await this.apiRequestContext.get(
          `${this.baseUrl}/v2/identity/people-filters/location?country=true&size=16&byPassDisplayCondition=true`
        );

        if (!response.ok()) {
          throw new Error(`API call failed: ${response.status()}`);
        }

        const data = await response.json();

        const countries = data.result?.listOfItems || [];

        if (countries.length === 0) {
          throw new Error('No countries found');
        }

        const countryValue = countries[0].value;
        return countryValue;
      } catch (error) {
        console.warn(`Failed to fetch Country value from API, using fallback: ${error}`);
        return FALLBACK_IDS.COUNTRY;
      }
    });
  }
}
