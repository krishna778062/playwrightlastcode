/**
 * @fileoverview Site Creation Test Suite
 * @description Tests for creating public and private sites through the UI
 * @author Diksha Gaur
 */

import { test, expect } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { contentTestFixture as contentTest } from '@/src/modules/content/fixtures/contentFixture';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content/test-data/site-creation.test-data';
import { SiteType } from '@/src/modules/content/constants/siteType';


contentTest.describe(
  'Site Creation Test Suite',
  {
    tag: [ContentSuiteTags.SITE_CREATION],
  },
  () => {
    
    // =============================================================================
    // UI VERIFICATION TESTS - These check that the form looks correct
    // =============================================================================
    
    contentTest(
      'UI Test: Verify Access section looks correct',
      {
        tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage }) => {
        // Setup test metadata for tracking
        tagTest(test.info(), {
          description: 'Verify that Access section displays correctly with proper headings, toggle state, and help text',
          zephyrTestId: 'CONT-37535',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation modal
        const siteCreationModal = await appManagerHomePage.actions.openSiteCreationModal();
        
        // STEP 2: Verify the modal opened correctly
        await siteCreationModal.verifyTheSiteCreationFormIsVisible();
        
        // STEP 3: Check main elements are visible
        await expect(siteCreationModal.addSiteHeading).toBeVisible();
        await expect(siteCreationModal.accessSectionHeading).toBeVisible();
        await expect(siteCreationModal.makePrivateSubHeading).toBeVisible();
        
        // STEP 4: Verify default state (private toggle should be OFF by default)
        await siteCreationModal.verifyPrivateToggleState(false);
        
        // STEP 5: Verify help text is displayed
        await expect(siteCreationModal.helpText).toBeVisible();
      }
    );

    contentTest(
      'UI Test: Verify Target Audience section looks correct',
      {
        tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage }) => {
        // Setup test metadata
        tagTest(test.info(), {
          description: 'Verify Target Audience section displays correctly with proper labels and placeholders',
          zephyrTestId: 'CONT-37536', 
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation modal
        const siteCreationModal = await appManagerHomePage.actions.openSiteCreationModal();
        
        // STEP 2: Check Target Audience section elements
        await expect(siteCreationModal.targetAudienceHeading).toBeVisible();
        await expect(siteCreationModal.page.getByText('Target audience', { exact: true })).toBeVisible();
        
        // STEP 3: Verify it's marked as mandatory (has * symbol)
        await expect(siteCreationModal.page.locator('div').filter({ hasText: /^Target audience\*$/ })).toBeVisible();
        
        // STEP 4: Check help text and placeholder
        await expect(siteCreationModal.page.getByText('Defining the target audience establishes who in your organization can access this site')).toBeVisible();
        await expect(siteCreationModal.page.getByText('No audiences selected')).toBeVisible();
        
        // STEP 5: Verify Browse button is present
        await expect(siteCreationModal.browseAudiencesButton).toBeVisible();
      }
    );

    contentTest(
      'UI Test: Verify Subscriptions section looks correct',
      {
        tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage }) => {
        // Setup test metadata
        tagTest(test.info(), {
          description: 'Verify Subscriptions section shows proper disabled state when no target audience is selected',
          zephyrTestId: 'CONT-37551',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation modal  
        const siteCreationModal = await appManagerHomePage.actions.openSiteCreationModal();
        
        // STEP 2: Check Subscriptions section heading and description
        await expect(siteCreationModal.subscriptionsHeading).toBeVisible();
        await expect(siteCreationModal.page.getByText('When a subscription is created, the users within the defined audience will automatically follow the selected sites or people.')).toBeVisible();
        
        // STEP 3: Verify placeholder and disabled state
        await expect(siteCreationModal.page.getByText('No subscriptions added')).toBeVisible();
        
        // STEP 4: Check that Add Subscription button is disabled (since no target audience selected yet)
        const addSubscriptionButton = siteCreationModal.page.getByRole('button', { name: 'Add subscription' });
        await expect(addSubscriptionButton).toBeVisible();
        await expect(addSubscriptionButton).toBeDisabled();
        
        // STEP 5: Verify explanatory note
        await expect(siteCreationModal.page.getByText('Target audience must be set before you can add a subscription')).toBeVisible();
      }
    );

    // =============================================================================
    // FUNCTIONALITY TESTS - These actually create sites
    // =============================================================================

    contentTest(
      'Functionality Test: Create a PUBLIC site successfully',
      {
        tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage }) => {
        // Setup test metadata
        tagTest(test.info(), {
          description: 'Complete flow to create a public site with target audience and verify creation success',
          zephyrTestId: 'CONT-37588',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation modal
        const siteCreationModal = await appManagerHomePage.actions.openSiteCreationModal();
        
        // STEP 2: Create a public site (this does the entire flow)
        // - Fills site name and category
        // - Keeps private toggle OFF (default for public)
        // - Sets up target audience (All organization)
        // - Sets membership approval to manual
        // - Clicks "Add site" button
        await siteCreationModal.createSite({
          name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
          category: SITE_CREATION_TEST_DATA.PUBLIC_SITE.category,
          type: SiteType.PUBLIC,
        });
        
        // STEP 3: Verify the site was created successfully
        await siteCreationModal.verifySiteCreatedSuccessfully(
          SITE_CREATION_TEST_DATA.PUBLIC_SITE.name
        );
      }
    );

    contentTest(
      'Functionality Test: Create a PRIVATE site successfully', 
      {
        tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerHomePage }) => {
        // Setup test metadata
        tagTest(test.info(), {
          description: 'Complete flow to create a private site with confirmation dialog and verify creation success',
          zephyrTestId: 'CONT-37643',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation modal
        const siteCreationModal = await appManagerHomePage.actions.openSiteCreationModal();
        
        // STEP 2: Create a private site (this does the entire flow)
        // - Fills site name and category  
        // - Turns ON private toggle
        // - Clicks "Make private" confirmation button
        // - Sets up target audience (All organization)
        // - Membership approval is automatically set to manual (no UI needed for private sites)
        // - Clicks "Add site" button
        await siteCreationModal.createSite({
          name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
          category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
          type: SiteType.PRIVATE,
        });
        
        // STEP 3: Verify the site was created successfully
        await siteCreationModal.verifySiteCreatedSuccessfully(
          SITE_CREATION_TEST_DATA.PRIVATE_SITE.name
        );
      }
    );
  }
);