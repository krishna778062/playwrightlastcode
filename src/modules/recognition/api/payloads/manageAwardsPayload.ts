export interface ManageAwardsPayload {
  awardName: string;
  description: string;
  companyValues: string[];
}

export const buildPeerRecognitionAwardPayload = (awardName: string, description: string): ManageAwardsPayload => ({
  awardName,
  description,
  companyValues: [],
});
