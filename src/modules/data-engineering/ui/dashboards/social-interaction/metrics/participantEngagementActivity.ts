import { FilterOptions } from '@data-engineering/helpers/baseAnalyticsQueryHelper';
import { CSVValidationUtil } from '@data-engineering/utils/csvValidationUtil';
import { FrameLocator, Page } from '@playwright/test';
import { format } from 'date-fns';

import { VerticalBarChartComponent } from '../../../components/verticalBarChartComponent';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';

export class ParticipantEngagementActivity extends VerticalBarChartComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.PARTICIPANT_ENGAGEMENT_ACTIVITY.title);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyChartIsLoaded();
  }

  async verifyChartIsLoaded(): Promise<void> {
    await this.verifier.verifyCountOfElementsIsGreaterThan(this.bars, 0, {
      timeout: 120_000,
      assertionMessage: 'Chart bars should be visible',
    });
  }

  /**
   * Downloads CSV and validates it against database data
   * @param snowflakeDataArray - The snowflake data array
   * @param filterBy - Filter options including time period
   */
  async verifyCSVDataMatchesWithDBData(
    snowflakeDataArray: Array<Record<string, any>>,
    filterBy: FilterOptions
  ): Promise<void> {
    await this.scrollToComponent();
    const { filePath } = await this.downloadDataAsCSV();

    const getCaseInsensitiveValue = (obj: Record<string, any>, key: string): any => {
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
      return foundKey ? obj[foundKey] : obj[key];
    };

    const normalizeInteractionDate = (value: unknown): string => {
      if (value instanceof Date) {
        return format(value, 'yyyy-MM-dd');
      }
      if (typeof value === 'number') {
        return format(new Date(value), 'yyyy-MM-dd');
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.includes('T')) {
          return trimmed.split('T')[0];
        }
        if (trimmed.includes(' ')) {
          return trimmed.split(' ')[0];
        }
        return trimmed;
      }
      return '';
    };

    try {
      const transformedDataForValidation = snowflakeDataArray.map(item => ({
        interaction_date: normalizeInteractionDate(getCaseInsensitiveValue(item, 'interaction_date')),
        reactions: Number(getCaseInsensitiveValue(item, 'REACTIONS')),
        feed_posts_content_comments: Number(getCaseInsensitiveValue(item, 'FEED_POST_COMMENTS')),
        replies: Number(getCaseInsensitiveValue(item, 'REPLY')),
        shares: Number(getCaseInsensitiveValue(item, 'SHARES')),
        favorites: Number(getCaseInsensitiveValue(item, 'FAVORITES')),
      }));

      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: transformedDataForValidation as any,
        metricName: this.metricTitle,
        selectedPeriod: filterBy.timePeriod,
        customStartDate: filterBy.customStartDate,
        customEndDate: filterBy.customEndDate,
        expectedHeaders: [
          'Interaction date',
          'Reactions',
          'Feed posts & content comments',
          'Replies',
          'Shares',
          'Favorites',
        ],
        transformations: {
          headerMapping: {
            'Interaction date': 'interaction_date',
            Reactions: 'reactions',
            'Feed posts & content comments': 'feed_posts_content_comments',
            Replies: 'replies',
            Shares: 'shares',
            Favorites: 'favorites',
          },
          keyFields: ['interaction_date'],
        },
      });
    } finally {
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
