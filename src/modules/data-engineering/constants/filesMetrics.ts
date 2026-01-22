/**
 * Files Dashboard Metrics Constants
 * Defines metric titles and subtitles for Files dashboard
 */

export const FILES_METRICS = {
  TOTAL_VIEWS: {
    title: 'Total views',
    subtitle: 'Total views by all users in the selected time period',
  },
  DOWNLOADS: {
    title: 'Downloads',
    subtitle: 'Total files downloaded by users',
  },
  FAVOURITES: {
    title: 'Favourites',
    subtitle: 'Total files marked as favourites',
  },
  REACTIONS: {
    title: 'Reactions',
    subtitle: 'Total user reactions on files',
  },
  UNIQUE_VIEWS: {
    title: 'Unique views',
    subtitle: 'Distinct users viewing files',
  },
  DISTRIBUTION_OF_VIEWS_BY_FILE_CATEGORY: {
    title: 'Distribution of views by file category',
    subtitle: 'Break down of views by each file category',
  },
  DISTRIBUTION_OF_DOWNLOADS_BY_FILE_CATEGORY: {
    title: 'Distrubution of downloads by file category',
    subtitle: 'Break down of downloads by each file category',
  },
} as const;
