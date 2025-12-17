/**
 * Response interface for expertise creation
 */
export interface ExpertiseCreateResponse {
  status: number;
  responseTimeStamp: number;
  message: string;
  result: {
    uuid: string;
    name: string;
    nameCode: string;
    users: number;
    modifiedBy: string;
  };
}

/**
 * Response interface for expertise endorsement
 */
export interface ExpertiseEndorseResponse {
  status: number;
  responseTimeStamp: number;
  message: string;
  result: {
    nextPageToken: number;
    totalRecords: number;
    listOfItems: {
      count: number;
      expertise: {
        id: string;
        name: string;
        nameCode: string;
      };
      isEndorsed: boolean;
    };
  };
}

/**
 * Response interface for expertise unendorsement
 */
export interface ExpertiseUnendorseResponse {
  status: number;
  responseTimeStamp: number;
  message: string;
  result: {};
}
