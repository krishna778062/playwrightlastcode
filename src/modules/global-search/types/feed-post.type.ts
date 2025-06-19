export interface FeedPostTestData {
  postType: 'text' | 'image' | 'video' | 'link' | 'poll';
  searchTerm: string;
  author: string;
  visibility: 'public' | 'private' | 'restricted';
}

export interface FeedPostResult {
  postType: 'text' | 'image' | 'video' | 'link' | 'poll';
  title: string;
  content: string;
  author: string;
  visibility: 'public' | 'private' | 'restricted';
  likes: number;
  comments: number;
  createdAt: string;
}

export interface FeedPostTestScenario {
  postType: 'text' | 'image' | 'video' | 'link' | 'poll';
  searchTerm: string;
  author: string;
  visibility: 'public' | 'private' | 'restricted';
  expectedLikes: boolean;
  expectedComments: boolean;
  expectedShare: boolean;
  expectedEdit: boolean;
}
