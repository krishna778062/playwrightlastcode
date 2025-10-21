import { APIRequestContext } from '@playwright/test';
import { test } from '@playwright/test';

import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';

/**
 * Service for managing application configuration settings
 * Handles all app-level configuration operations like enabling/disabling features
 * Reuses existing FeedManagementService methods for consistency
 */
export class AppConfigurationService {
  private feedManagementService: FeedManagementService;

  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.feedManagementService = new FeedManagementService(context, baseUrl);
  }

  /**
   * Generic method to update app configuration
   * Gets current config, merges with provided config, and saves the complete config
   * @param configObject - Object containing field-value pairs (e.g., { orgChartEnabled: true })
   * @param description - Optional description for the test step
   */
  async updateAppConfigField(configObject: any, description?: string) {
    const stepDescription = description || `Update app configuration`;

    return await test.step(stepDescription, async () => {
      // Get current app configuration directly from FeedManagementService
      const currentConfig = await this.feedManagementService.getAppConfig();

      console.log('Current config status:', configObject);

      // Prepare update payload with all current values and merge with provided config
      const updatePayload: any = {
        appName: currentConfig.result.appName,
        automatedTranslationEnabled: currentConfig.result.automatedTranslationEnabled,
        availableContentTypes: currentConfig.result.availableContentTypes,
        addToCalendar: currentConfig.result.addToCalendar,
        feedbackRecipients: currentConfig.result.feedbackRecipients,
        enableSmsNotifications: currentConfig.result.enableSmsNotifications,
        enablePushNotificationMobile: currentConfig.result.enablePushNotificationMobile,
        shareFeedback: currentConfig.result.shareFeedback,
        socialCampaignsPolicyUrl: currentConfig.result.socialCampaignsPolicyUrl,
        selectedLanguages: currentConfig.result.selectedLanguages.ids,
        orgChartEnabled: currentConfig.result.orgChartEnabled,
        isSmartWritingEnabled: currentConfig.result.isSmartWritingEnabled,
        isSmartAnswerEnabled: currentConfig.result.isSmartAnswerEnabled,
        isContentAiSummaryEnabled: currentConfig.result.isContentAiSummaryEnabled,
        isMultilingualModelEnabled: currentConfig.result.isMultilingualModelEnabled,
        calendarOffice365Enabled: currentConfig.result.calendarOffice365Enabled,
        calendarOffice365Url: currentConfig.result.calendarOffice365Url,
        isContentFeaturePromotionEnabled: currentConfig.result.isContentFeaturePromotionEnabled,
        isQuestionAnswerEnabled: currentConfig.result.isQuestionAnswerEnabled,
        isNewsletterTranslationEnabled: currentConfig.result.isNewsletterTranslationEnabled,
        ...configObject, // Merge the provided config object
      };

      // Update app configuration directly using FeedManagementService
      const response = await this.feedManagementService.updateAppConfig(updatePayload);

      const responseBody = await response.json();
      console.log(`Configuration updated successfully. Response:`, JSON.stringify(responseBody, null, 2));

      return responseBody;
    });
  }
}
