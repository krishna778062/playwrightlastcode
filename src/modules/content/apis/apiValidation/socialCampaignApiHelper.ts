import { expect, test } from '@playwright/test';

import { SocialCampaign, SocialCampaignApiResponse } from '@core/types/social-campaign.types';

export class SocialCampaignApiHelper {
  /**
   * Validates social campaign creation response
   * @param response - The API response from createCampaign
   */
  async validateCampaignCreation(response: SocialCampaignApiResponse): Promise<void> {
    await test.step('Validate social campaign creation response', async () => {
      expect(response.success, 'Success should be true').toBe(true);
      expect([200, 201], 'Status should be 200 or 201').toContain(response.status);
      expect(response.message, 'Message should indicate success').toBeTruthy();
      expect(response.result, 'Result should be present').toBeTruthy();
      expect(response.result.campaignId, 'Campaign ID should be present').toBeTruthy();
      expect(response.result.message, 'Campaign message should be present').toBeTruthy();
      expect(response.result.recipient, 'Campaign recipient should be present').toBeTruthy();
      expect(response.result.networks, 'Campaign networks should be present').toBeTruthy();
    });
  }

  /**
   * Validates social campaign details
   * @param campaign - The campaign object to validate
   * @param expectedMessage - Expected campaign message (optional)
   * @param expectedRecipient - Expected recipient (optional)
   * @param expectedNetworks - Expected networks (optional)
   */
  async validateCampaignDetails(
    campaign: SocialCampaign,
    expectedMessage?: string,
    expectedRecipient?: string,
    expectedNetworks?: string[]
  ): Promise<void> {
    await test.step('Validate social campaign details', async () => {
      expect(campaign.campaignId, 'Campaign ID should be present').toBeTruthy();
      expect(campaign.message, 'Campaign message should be present').toBeTruthy();
      expect(campaign.recipient, 'Campaign recipient should be present').toBeTruthy();
      expect(campaign.networks, 'Campaign networks should be present').toBeTruthy();

      if (expectedMessage) {
        expect(campaign.message, `Campaign message should be "${expectedMessage}"`).toBe(expectedMessage);
      }

      if (expectedRecipient) {
        expect(campaign.recipient, `Campaign recipient should be "${expectedRecipient}"`).toBe(expectedRecipient);
      }

      if (expectedNetworks) {
        const campaignNetworks = Object.keys(campaign.networks || {});
        expect(campaignNetworks.length, `Campaign should have ${expectedNetworks.length} network(s)`).toBe(
          expectedNetworks.length
        );
        // Verify all expected networks are present
        for (const expectedNetwork of expectedNetworks) {
          expect(
            campaignNetworks.includes(expectedNetwork),
            `Campaign should include network: ${expectedNetwork}`
          ).toBe(true);
        }
      }
    });
  }

  /**
   * Validates that campaign is present in the list
   * @param campaignsList - List of campaigns
   * @param campaignId - The campaign ID to verify
   */
  async validateCampaignInList(campaignsList: SocialCampaign[], campaignId: string): Promise<void> {
    await test.step('Validate campaign is present in list', async () => {
      expect(Array.isArray(campaignsList), 'Campaigns list should be an array').toBe(true);
      const campaignFound = campaignsList.some((campaign: SocialCampaign) => campaign.campaignId === campaignId);
      expect(campaignFound, `Campaign with ID ${campaignId} should be present in the list`).toBe(true);
    });
  }
}
