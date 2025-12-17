import {
  ExpertiseCreateResponse,
  ExpertiseEndorseResponse,
  ExpertiseUnendorseResponse,
} from '@core/types/expertise.type';

/**
 * Interface for Expertise Management operations
 */
export interface IExpertiseManagementOperations {
  /**
   * Creates a new expertise
   * @param name - The name of the expertise to create
   * @returns Promise with the created expertise response
   */
  createExpertise(name: string): Promise<ExpertiseCreateResponse>;

  /**
   * Endorses a user with a specific expertise
   * @param userId - The ID of the user to endorse
   * @param expertiseId - The ID of the expertise to endorse the user with
   * @returns Promise with the endorsement response
   */
  endorseUserWithExpertise(userId: string, expertiseId: string): Promise<ExpertiseEndorseResponse>;

  /**
   * Unendorses a user from a specific expertise
   * @param userId - The ID of the user to unendorse
   * @param expertiseId - The ID of the expertise to unendorse the user from
   * @returns Promise with the unendorsement response
   */
  unendorseUserFromExpertise(userId: string, expertiseId: string): Promise<ExpertiseUnendorseResponse>;
}
