import { test } from '@playwright/test';

import { PEOPLE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/people-search.test-data';
import { AppConfigurationService } from '@/src/modules/platforms/apis/services/AppConfigurationService';

/**
 * Helper class for managing people field configuration API operations
 * Handles only API calls for enabling/disabling fields
 */
export class PeopleFieldConfigurationHelper {
  constructor(private appConfigurationService: AppConfigurationService) {}

  /**
   * Get current field configuration and find specific fields
   * @param fieldNames - Object containing field names to find
   * @returns Object containing found field data
   */
  async getFieldConfiguration(fieldNames: { Department: string; City: string; State: string; Country: string }) {
    return await test.step('Get current field configuration', async () => {
      const currentConfig = await this.appConfigurationService.getPeopleFieldConfiguration(
        'Get current people field configuration'
      );

      const departmentField = currentConfig.result.find((field: any) => field.field_name === fieldNames.Department);
      const cityField = currentConfig.result.find((field: any) => field.field_name === fieldNames.City);
      const stateField = currentConfig.result.find((field: any) => field.field_name === fieldNames.State);
      const countryField = currentConfig.result.find((field: any) => field.field_name === fieldNames.Country);

      if (!departmentField || !cityField || !stateField || !countryField) {
        console.log('Required fields not found in current configuration');
        console.log(
          'Available fields:',
          currentConfig.result.map((f: any) => ({ label: f.label, field_name: f.field_name }))
        );
        throw new Error('Required fields not found in current configuration');
      }

      return {
        departmentField,
        cityField,
        stateField,
        countryField,
        allFields: currentConfig.result,
      };
    });
  }

  /**
   * Enable Department and all location fields (City, State, Country) via API
   * @param fields - Object containing all field data
   */
  async enableAllFields(fields: { departmentField: any; cityField: any; stateField: any; countryField: any }) {
    return await test.step('Enable Department and all location fields via API', async () => {
      const enableDepartmentPayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createEnablePayload(
        fields.departmentField
      );
      const enableCityPayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createEnablePayload(fields.cityField);
      const enableStatePayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createEnablePayload(fields.stateField);
      const enableCountryPayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createEnablePayload(fields.countryField);

      await this.appConfigurationService.updatePeopleFieldConfiguration(
        [enableDepartmentPayload, enableCityPayload, enableStatePayload, enableCountryPayload],
        'Enable Department and all location fields for display'
      );
    });
  }

  /**
   * Disable Department field via API
   * @param departmentField - Department field data
   */
  async disableDepartmentField(departmentField: any) {
    return await test.step('Disable Department field via API', async () => {
      const disableDepartmentPayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createDisablePayload(departmentField);

      await this.appConfigurationService.updatePeopleFieldConfiguration(
        [disableDepartmentPayload],
        'Disable Department field display'
      );
    });
  }

  /**
   * Disable all location fields (City, State, Country) via API
   * @param fields - Object containing location field data
   */
  async disableLocationFields(fields: { cityField: any; stateField: any; countryField: any }) {
    return await test.step('Disable all location fields via API', async () => {
      const disableCityPayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createDisablePayload(fields.cityField);
      const disableStatePayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createDisablePayload(fields.stateField);
      const disableCountryPayload = PEOPLE_SEARCH_TEST_DATA.fieldConfiguration.createDisablePayload(
        fields.countryField
      );

      await this.appConfigurationService.updatePeopleFieldConfiguration(
        [disableCityPayload, disableStatePayload, disableCountryPayload],
        'Disable all location fields (City, State, Country) display'
      );
    });
  }

  /**
   * Restore original field display settings via API
   * @param originalFields - Object containing original field data
   */
  async restoreOriginalSettings(originalFields: {
    originalDepartmentField?: any;
    originalCityField?: any;
    originalStateField?: any;
    originalCountryField?: any;
  }) {
    return await test.step('Restore original field display settings via API', async () => {
      const restorePayloads = [];
      if (originalFields.originalDepartmentField) {
        restorePayloads.push(originalFields.originalDepartmentField);
      }
      if (originalFields.originalCityField) {
        restorePayloads.push(originalFields.originalCityField);
      }
      if (originalFields.originalStateField) {
        restorePayloads.push(originalFields.originalStateField);
      }
      if (originalFields.originalCountryField) {
        restorePayloads.push(originalFields.originalCountryField);
      }
      if (restorePayloads.length > 0) {
        await this.appConfigurationService.updatePeopleFieldConfiguration(
          restorePayloads,
          'Restore original field display settings'
        );
      }
    });
  }
}
