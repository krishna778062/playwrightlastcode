export interface AudienceItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  accessType: string;
  users: string[];
  type: string;
}

export interface ListAudiencesResponse {
  listOfItems: AudienceItem[];
}
