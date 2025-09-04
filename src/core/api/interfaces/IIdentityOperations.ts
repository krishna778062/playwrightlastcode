import { Roles } from '@core/constants/roles';
import { ListAudiencesResponse } from '@core/types/audience.type';

export interface IIdentityAdminOperations {
  /**
   * Get list of audiences
   * @returns ListAudiencesResponse
   */
  getListOfAudiences(): Promise<ListAudiencesResponse>;

  /**
   * Get audience id
   * @param audienceName - The name of the audience
   * @returns Audience id
   */
  getAudienceId(audienceName: string): Promise<string>;

  /**
   * Fetch role id
   * @param role - The role
   * @returns Role id
   */
  fetchRoleId(role: Roles): Promise<number>;

  /**
   * Get identity user id
   * @param firstName - The first name of the user
   */
  getIdentityUserId(firstName: string, lastName: string): Promise<string>;

  /**
   * Create category
   * @param name - The name of the category
   * @param options - Optional attributes
   * @returns The created category ID
   */
  createCategory(name: string, options?: { description: string }): Promise<string>;

  /**
   * Find category
   * @param name - The name of the category
   * @param size - The size of the category
   * @param options - Optional attributes
   */
  findCategory(name: string, size: number, options?: { nextPageToken: number; term: string }): Promise<boolean>;

  /**
   * Get category id
   * @param name - The name of the category
   * @param size - The size of the category
   * @param options - Optional attributes
   */
  getCategoryId(name: string, size: number, options?: { nextPageToken: number; term: string }): Promise<string>;

  /**
   * Delete category by ID
   * @param categoryId - Category ID for the category to be deleted
   */
  deleteCategoryById(categoryId: string): Promise<void>;

  /**
   * Delete audience
   * @param audienceId - Audience ID for the audience to be deleted
   */
  deleteAudience(audienceId: string, options?: { nextPageToken: number; term: string }): Promise<void>;
}
