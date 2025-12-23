import { APIRequestContext, expect, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

/**
 * Type for specifying which contact info to delete
 */
export type DeleteContactType = 'email' | 'mobile' | 'both';

export class LWOUserManagementService {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Delete user contact information (email and/or mobile)
   */
  async deleteUserContactInfo(
    userID: string,
    empID: string,
    firstName: string,
    lastName: string,
    deleteType: DeleteContactType = 'both'
  ) {
    const deleteMobile = deleteType === 'mobile' || deleteType === 'both';
    const deleteEmail = deleteType === 'email' || deleteType === 'both';

    const payload = {
      personal_info: {
        first_name: firstName,
        last_name: lastName,
        timezone_id: 17,
        language_id: 1,
        locale_id: 1,
        license_type: 'Corporate',
        ...(deleteMobile && { mobile: null }),
        ...(deleteEmail && { email: null }),
      },
      work_info: { department: 'QA', employee_number: empID },
      role_id: 'a8d8c6b0-8968-44a7-a034-00110cc25817',
      additional_role_id: [],
    };

    await test.step(`Delete ${deleteType === 'both' ? 'Email and Mobile' : deleteType}`, async () => {
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
