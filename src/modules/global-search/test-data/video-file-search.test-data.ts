export interface VideoFileSearchTestCase {
  content: string;
  category: string;
  label: string;
  filterText: string;
}

export interface VideoCaptionSearchTestCase {
  searchTerm: string;
  expectedVideoTitle: string;
  expectedCaptionsText: string;
  expectedTimestamp: string;
  expectedCaptionText: string;
  filterText: string;
  iconType: string;
  fileType: string;
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
  captionSearch: {
    searchTerm: 'feathering',
    expectedVideoTitle: 'VideoSearchwith_Captions.mov',
    expectedCaptionsText: 'feathering found in videos',
    expectedTimestamp: '00:43',
    expectedCaptionText: "feathering it wasn't beating for you all the time",
    filterText: 'Videos',
    iconType: 'video',
    fileType: 'mov',
  } as VideoCaptionSearchTestCase,
};
