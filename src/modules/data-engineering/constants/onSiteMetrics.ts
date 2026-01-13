export const ON_SITE_METRICS = {
  REACTIONS_MADE: {
    title: 'Reactions made',
    subtitle: 'Users (up to 5) with the highest number of reaction interactions in the selected period',
  },
  REACTIONS_RECEIVED: {
    title: 'Reactions received',
    subtitle: 'Users (up to 5) ranked by the total reactions received in the selected period',
  },
  FAVORITES_RECEIVED: {
    title: 'Favorites received',
    subtitle: 'Users (up to 5) ranked by favorites received in the selected period',
  },
  SHARES_RECEIVED: {
    title: 'Shares received',
    subtitle: 'Users (up to 5) ranked by shares received in the selected period',
  },
  FEED_POSTS_AND_CONTENT_COMMENTS: {
    title: 'Feed posts and content comments',
    subtitle: 'Users (up to 5) ranked by comments made on feed posts and content in the selected period',
  },
  REPLIES_TO_OTHERS: {
    title: 'Replies to others',
    subtitle: 'Users (up to 5) ranked by number of reply interactions made in the selected period',
  },
  REPLIES_FROM_OTHER_USERS: {
    title: 'Replies from other users',
    subtitle: 'Users (up to 5) ranked by number of reply interactions they received in the selected period',
  },
  MOST_POPULAR: {
    title: 'Most popular',
    subtitle: 'Content items (up to 5) ranked by overall popularity score for the selected period',
  },
  CONTENT_REFERRALS: {
    title: 'Content referrals',
    subtitle: 'Referrals by UTM source, with share of total and average referrals per item',
  },
  MOST_CONTENT_PUBLISHED: {
    title: 'Most content published',
    subtitle: 'Top content creators on site ranked by total number of items published',
  },
  MOST_VIEWED_CONTENT: {
    title: 'Most viewed content',
    subtitle: 'Top content items ranked by total views in the selected period',
  },
} as const;
