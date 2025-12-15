import { APIRequestContext, expect, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

/**
 * Options for deleting user contact information
 */
export type DeleteContactOptions = {
  deleteEmail?: boolean;
  deleteMobile?: boolean;
};

export class LWOUserManagementService {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Generic method to delete user contact information (email and/or mobile)
   * @param userID - User ID
   * @param empID - Employee ID
   * @param firstName - User's first name
   * @param lastName - User's last name
   * @param options - Options specifying which fields to delete (defaults to both email and mobile)
   */
  async deleteUserContactInfo(
    userID: string,
    empID: string,
    firstName: string,
    lastName: string,
    options: DeleteContactOptions = { deleteEmail: true, deleteMobile: true }
  ) {
    const personalInfo: Record<string, any> = {
      first_name: firstName,
      last_name: lastName,
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      license_type: 'Corporate',
    };

    // Only add null fields for what needs to be deleted
    if (options.deleteMobile) {
      personalInfo.mobile = null;
    }
    if (options.deleteEmail) {
      personalInfo.email = null;
    }

    const payload = {
      personal_info: personalInfo,
      work_info: { department: 'QA', employee_number: empID },
      role_id: 'a8d8c6b0-8968-44a7-a034-00110cc25817',
      additional_role_id: [],
    };

    const stepDescription =
      options.deleteEmail && options.deleteMobile
        ? 'Delete Email and Mobile'
        : options.deleteEmail
          ? 'Delete Email Only'
          : 'Delete Mobile Only';

    await test.step(stepDescription, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.appManagement.users.delete(userID), {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }

  async setLWOSetting(verificationType: string) {
    let payload: any = '';
    if (verificationType === 'optional') {
      payload = { loginWithOtpEnabled: true, loginWithOtpVerificationType: 'optional' };
    } else {
      payload = { loginWithOtpEnabled: true, loginWithOtpVerificationType: 'mandatory' };
    }
    await test.step(`Set LWO Setting to`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.appConfig.appConfig + '/app.security.lwo', {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }

  async disableLoginWithOtp() {
    await test.step(`Disable Login with OTP`, async () => {
      const payload: any = { loginWithOtpEnabled: false };
      const response = await this.httpClient.put(API_ENDPOINTS.appConfig.appConfig + '/app.security.lwo', {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }
}
