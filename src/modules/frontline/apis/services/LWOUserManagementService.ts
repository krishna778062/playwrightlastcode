import { APIRequestContext, expect, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

export class LWOUserManagementService {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  async deleteEmailAndMobile(userID: string, empID: string, firstName: string, lastName: string) {
    const payload = {
      personal_info: {
        first_name: firstName,
        last_name: lastName,
        mobile: null,
        timezone_id: 17,
        language_id: 1,
        locale_id: 1,
        email: null,
        license_type: 'Corporate',
      },
      work_info: { department: 'QA', employee_number: empID },
      role_id: 'a8d8c6b0-8968-44a7-a034-00110cc25817',
      additional_role_id: [],
    };
    await test.step(`Delete Email and Mobile`, async () => {
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
    await test.step(`Create QR Using API`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.appConfig.appConfig + '/app.security.lwo', {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }
}
