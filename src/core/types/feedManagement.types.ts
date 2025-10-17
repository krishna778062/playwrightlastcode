export enum FeedMode {
  TIMELINE_COMMENT_POST = 'timeline_comment_post',
  TIMELINE_POST = 'timeline_post',
  TIMELINE_COMMENT = 'timeline_comment',
}

export interface AppConfigResponse {
  status: number;
  responseTimeStamp: number;
  message: string;
  result: {
    isStreetDisplayOn: boolean;
    releaseVersion: string;
    isEventOn: boolean;
    isPageOn: boolean;
    isAlbumOn: boolean;
    availableContentTypes: string[];
    popularSiteDashboardLayout: string;
    feedEnabled: boolean;
    feedRichTextEnabled: boolean;
    feedRefreshInterval: number;
    listingLoadSize: number;
    loginTimeout: number;
    appName: string;
    logoUrl: string;
    isAutomatedTranslationEnabled: boolean;
    languages: string[];
    launchpadEnabled: boolean;
    socialCampaignsPolicyUrl: string;
    calendarOffice365Url: string;
    feedbackRecipients: string[];
    shareFeedback: boolean;
    enablePushNotificationMobile: boolean;
    enableSmsNotifications: boolean;
    isContentFeaturePromotionEnabled: boolean;
    isMultilingualModelEnabled: boolean;
    isSmartAnswerEnabled: boolean;
    isSmartWritingEnabled: boolean;
    orgChartEnabled: boolean;
    selectedLanguages: {
      ids: number[];
      defaultIds: number[];
    };
    isNewsletterTranslationEnabled: boolean;
    automatedTranslationEnabled: boolean;
    addToCalendar: string[];
    calendarOffice365Enabled: boolean;
    isQuestionAnswerEnabled: boolean;
    isContentAiSummaryEnabled: boolean;
    feedMode: string;
    accountId: string;
    [key: string]: any; // For additional properties
  };
}
