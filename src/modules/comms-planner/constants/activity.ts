export interface Activity {
  title: string;
  description: string;
  type: string;
  content: {
    id?: string;
    type: string;
    subType?: string;
    title: string;
    description: string;
    location?: string;
  };
}

export const ACTIVITIES: Activity[] = [
  {
    title: `Wellness Kickoff Announcement`,
    type: `Page`,
    description: `Share a company-wide message introducing wellness month, benefits, and participation rules.`,
    content: {
      type: 'page',
      subType: 'news',
      title: `Wellness Kickoff Announcement`,
      description: `Share a company-wide message introducing wellness month, benefits, and participation rules.`,
    },
  },
  {
    title: `Team Photo Showcase`,
    type: `Page`,
    description: `Each team uploads a group photo that represents their theme, task, or personality. All images are compiled into a single album to celebrate team spirit.`,
    content: {
      type: 'album',
      title: `Team Photo Showcase`,
      description: `Each team uploads a group photo that represents their theme, task, or personality. All images are compiled into a single album to celebrate team spirit.`,
    },
  },
  {
    title: `Live Workshop Session`,
    type: `Event`,
    description: `Conduct an instructor-led workshop (virtual or in-person) to teach a specific skill, process, or method related to the campaign theme.`,
    content: {
      type: 'event',
      title: `Live Workshop Session`,
      location: `Online`,
      description: `Conduct an instructor-led workshop (virtual or in-person) to teach a specific skill, process, or method related to the campaign theme.`,
    },
  },
];
