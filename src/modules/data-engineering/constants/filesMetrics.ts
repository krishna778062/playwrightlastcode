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
    subtitle: 'Total files marked at favourites',
  },
  REACTIONS: {
    title: 'Reactions',
    subtitle: 'Total user reactions on files',
  },
  UNIQUE_VIEWS: {
    title: 'Unique views',
    subtitle: 'Distinct users viewing files',
  },
} as const;
