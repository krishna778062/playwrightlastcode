export interface VideoFileSearchTestCase {
  content: string;
  category: string;
  label: string;
  filterText: string;
}

export const VIDEO_FILE_SEARCH_TEST_DATA = {
  category: 'Uncategorized',
  filterText: 'Videos',
  fileTypes: [
    {
      type: 'mp4',
      fileName: 'VideoFile.mp4',
      mimeType: 'video/mp4',
      label: 'Video',
    },
  ],
};
