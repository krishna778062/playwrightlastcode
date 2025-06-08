import { test } from '@playwright/test';
import { AppManagerApiClient } from '@core/apiClients/appManagerApiClient';
import { ApiClientFactory } from '@core/apiClients/apiClientFactory';
import { Roles } from '@core/constants/roles';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';

test('App Management API Tests', async () => {
  // Initialize API client
  const appManagerClient = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'credentials',
    credentials: {
      username: process.env.APP_MANAGER_USERNAME!,
      password: process.env.APP_MANAGER_PASSWORD!,
    },
    baseUrl: process.env.API_BASE_URL!,
  });

  // Generate test user with realistic data
  const testUser = TestDataGenerator.generateUser();

  // Add a new user
  const addedUser = await appManagerClient
    .getUserManagementService()
    .addUser(testUser, Roles.END_USER);
  console.log('Added user:', addedUser);
});

test('Activate User Test', async () => {
  // Initialize API client
  const appManagerClient = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'credentials',
    credentials: {
      username: process.env.APP_MANAGER_USERNAME!,
      password: process.env.APP_MANAGER_PASSWORD!,
    },
    baseUrl: process.env.API_BASE_URL!,
  });

  // Generate test user with realistic data
  const testUser = TestDataGenerator.generateUser();

  // Add a new user
  await appManagerClient.getUserManagementService().addUser(testUser, Roles.END_USER);

  // Activate the user
  await appManagerClient
    .getUserManagementService()
    .activateUser(testUser.first_name, testUser.last_name);

  console.log(
    `User ${testUser.first_name} ${testUser.last_name} has been activated with password: intranet@2024`
  );
});
