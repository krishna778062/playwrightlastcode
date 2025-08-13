/**
 * @fileoverview Site Creation Modal Component
 * @description Component that handles the site creation modal UI interactions and verifications
 */

import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@core/components/baseComponent';
import { SiteCreationPayload } from '@core/types/siteManagement.types';
import { SiteType } from '../constants/siteType';
import { SITE_CREATION_TEST_DATA } from '../test-data/site-creation.test-data';

/**
 * SiteCreationModalComponent
 * 
 * This component represents the modal that appears when you click "Create" > "Site"
 * It handles all interactions with form fields, buttons, and validation of the site creation flow
 */
export class SiteCreationModalComponent extends BaseComponent {
  
  // =============================================================================
  // LOCATORS - All the UI elements we need to interact with
  // =============================================================================
  
  // MODAL STRUCTURE - Main modal elements
  readonly modalContainer: Locator;
  readonly addSiteHeading: Locator;
  readonly cancelButton: Locator;
  readonly addSiteButton: Locator;
  readonly successMessage: Locator;
  
  // BASIC SITE DETAILS - Name and category section  
  readonly siteNameInput: Locator;
  readonly categoryInput: Locator;
  
  // ACCESS SECTION - Privacy settings
  readonly accessSectionHeading: Locator;
  readonly makePrivateSubHeading: Locator;
  readonly privateToggle: Locator;              // The actual input element (for state checking)
  readonly privateToggleLabel: Locator;         // The clickable switch element
  readonly helpText: Locator;
  readonly makePrivateButton: Locator;
  readonly makePrivateConfirmButton: Locator;   // Confirmation button in modal
  
  // TARGET AUDIENCE SECTION - Who can access the site or for whom the site is scoped
  readonly targetAudienceHeading: Locator;
  readonly targetAudienceDropdown: Locator;
  readonly browseAudiencesButton: Locator;
  
  // Audience selection modal elements
  readonly audienceModalTitle: Locator;
  readonly allOrganizationOption: Locator;
  readonly allOrganizationSwitch: Locator;
  readonly audienceDoneButton: Locator;
  
  // Post-selection verification elements (appear after selecting audience)
  readonly allOrgSelectionConfirmation: Locator;
  readonly allOrgDescription: Locator;
  readonly selectedAudienceText: Locator;
  readonly everyoneInOrgText: Locator;
  readonly userCountText: Locator;
  readonly basedOnAudiencesText: Locator;
  
  // SUBSCRIPTIONS SECTION - Auto-follow settings
  readonly subscriptionsHeading: Locator;
  
  // MEMBERSHIP REQUESTS SECTION - Approval settings (public sites only)
  readonly membershipRequestsHeading: Locator;
  readonly manuallyApproveOption: Locator;
  readonly automaticallyApproveOption: Locator;

  // =============================================================================
  // CONSTRUCTOR - Initialize all locators
  // =============================================================================
  
  constructor(page: Page) {
    super(page);
    
    // Initialize modal structure locators
    this.modalContainer = page.locator('div[role="dialog"]').filter({ hasText: 'Add site' });
    this.addSiteHeading = page.getByRole('heading', { name: 'Add site' });
    this.cancelButton = page.locator(`text=${SITE_CREATION_TEST_DATA.UI_ELEMENTS.BUTTONS.CANCEL}`);
    this.addSiteButton = page.getByRole('button', { name: 'Add site' });
    this.successMessage = page.getByText('Created site successfully');
    
    // Initialize basic site details locators
    this.siteNameInput = page.getByRole('textbox', { name: 'Site name' });
    this.categoryInput = page.getByRole('combobox', { name: 'Category: This is a required' });
    
    // Initialize access section locators
    this.accessSectionHeading = page.getByRole('heading', { name: 'Access' });
    this.makePrivateSubHeading = page.getByText('Make site private');
    this.privateToggle = page.locator('input[name="accessType"]');          // For checking state
    this.privateToggleLabel = page.getByRole('switch', { name: 'Make site private' }); // For clicking
    this.helpText = page.getByText('Users will have to request permission to join this site');
    this.makePrivateButton = page.getByText('Make site private');
    this.makePrivateConfirmButton = page.getByRole('button', { name: 'Make private' });
    
    // Initialize target audience locators
    this.targetAudienceHeading = page.getByRole('heading', { name: 'Target audience and' });
    this.targetAudienceDropdown = page.locator('div').filter({ hasText: /^Target audience\*$/ }).locator('span');
    this.browseAudiencesButton = page.getByRole('button', { name: 'Browse' });
    
    // Initialize audience modal locators
    this.audienceModalTitle = page.getByText('Audiences', { exact: true });
    this.allOrganizationOption = page.getByText('All organization');
    this.allOrganizationSwitch = page.getByRole('switch', { name: 'All organization' }).first();
    this.audienceDoneButton = page.getByRole('button', { name: 'Done' });
    
    // Initialize post-selection verification locators
    this.allOrgSelectionConfirmation = page.getByText("You've selected 'All");
    this.allOrgDescription = page.getByText('This will target everyone in');
    this.selectedAudienceText = page.getByText('All organization');
    this.everyoneInOrgText = page.getByText('Everyone in organization');
    this.userCountText = page.locator('text=/\\d+ users/');  // Dynamic pattern for any number
    this.basedOnAudiencesText = page.getByText('Based on the audiences');
    
    // Initialize subscriptions locators
    this.subscriptionsHeading = page.getByRole('heading', { name: 'Subscriptions', exact: true });
    
    // Initialize membership requests locators
    this.membershipRequestsHeading = page.getByRole('heading', { name: 'Membership requests' });
    this.manuallyApproveOption = page.getByText('Manually approve membership requests', { exact: true });
    this.automaticallyApproveOption = page.getByText('Automatically approve membership requests');
  }

  // =============================================================================
  // VERIFICATION METHODS - Check that UI elements are displayed correctly
  // =============================================================================

  /**
   * Verifies the site creation form is visible and ready for interaction
   */
  async verifyTheSiteCreationFormIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify site creation form is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addSiteHeading, {
        assertionMessage: 'Site creation form should be visible with "Add site" heading',
      });
    });
  }

  /**
   * Verifies the Access section UI elements are displayed correctly
   */
  async verifyAccessSectionIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Access section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.accessSectionHeading, {
        assertionMessage: 'Access section heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.makePrivateSubHeading, {
        assertionMessage: 'Make site private label should be visible',
      });
    });
  }

  /**
   * Verifies the private toggle is in the expected state (checked/unchecked)
   */
  async verifyPrivateToggleState(expectedState: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify private toggle is ${expectedState ? 'enabled' : 'disabled'}`, async () => {
      await this.privateToggle.waitFor();
      const actualState = await this.privateToggle.isChecked();
      
      if (actualState !== expectedState) {
        throw new Error(`Expected private toggle to be ${expectedState}, but it was ${actualState}`);
      }
    });
  }

  /**
   * Verifies the help text is visible beneath the private toggle
   */
  async verifyHelpTextIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify help text is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.helpText, {
        assertionMessage: 'Help text should be visible beneath private option',
      });
    });
  }

  // =============================================================================
  // FORM INTERACTION METHODS - Fill out the site creation form
  // =============================================================================

  /**
   * Fills in the basic site details (name, category, privacy setting)
   */
  async fillSiteDetails(options: {
    name: string;
    category?: string;
    isPrivate?: boolean;
    stepInfo?: string;
  }): Promise<void> {
    await test.step(options.stepInfo || `Fill site details: ${options.name}`, async () => {
      // Step 1: Enter site name
      await this.fillInElement(this.siteNameInput, options.name);
      console.log(`✅ Site name entered: ${options.name}`);
      
      // Step 2: Select category if provided
      if (options.category) {
        await this.clickOnElement(this.categoryInput);
        await this.clickOnElement(this.page.getByText(options.category, { exact: true }));
        console.log(`✅ Category selected: ${options.category}`);
      }
      
      // Step 3: Set privacy if specified
      if (options.isPrivate !== undefined) {
        await this.togglePrivateAccess(options.isPrivate);
      }
    });
  }

  /**
   * Toggles the private access setting and handles the confirmation flow
   * This method handles the complete private site flow:
   * 1. Click the private toggle switch
   * 2. Click the "Make private" confirmation button 
   * 3. Verify the state changed
   */
  async togglePrivateAccess(shouldBePrivate: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Set site privacy to ${shouldBePrivate ? 'private' : 'public'}`, async () => {
      const isCurrentlyPrivate = await this.privateToggle.isChecked();
      
      // Only toggle if we need to change the current state
      if (shouldBePrivate !== isCurrentlyPrivate) {
        console.log(`Changing site privacy from ${isCurrentlyPrivate} to ${shouldBePrivate}`);
        
        // Step 1: Click the private toggle switch (this opens confirmation dialog for private)
        await this.clickOnElement(this.privateToggleLabel);
        console.log(`Private toggle clicked`);
        
        // Step 2: If making private, handle the confirmation dialog
        if (shouldBePrivate) {
          await this.page.waitForTimeout(500); // Wait for confirmation dialog to appear
          await this.clickOnElement(this.makePrivateConfirmButton);
          console.log(`"Make private" confirmation clicked`);
        }
        
        // Step 3: Verify the state changed
        await this.page.waitForTimeout(1000); // Wait for state to update
        const newState = await this.privateToggle.isChecked();
        if (newState !== shouldBePrivate) {
          throw new Error(`Private toggle state did not change. Expected: ${shouldBePrivate}, Actual: ${newState}`);
        }
        console.log(`Site privacy successfully set to: ${shouldBePrivate ? 'private' : 'public'}`);
      } else {
        console.log(`Site privacy already set to: ${shouldBePrivate ? 'private' : 'public'}`);
      }
    });
  }

  /**
   * Sets up target audience by selecting "All organization"
   * This method handles the complete audience selection flow:
   * 1. Opens the target audience dropdown
   * 2. Clicks "Browse" to open audience modal
   * 3. Selects "All organization" option
   * 4. Enables the toggle switch
   * 5. Clicks "Done" to close modal
   * 6. Verifies selection appears in main form
   */
  async setupTargetAudience(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Setup target audience', async () => {
      console.log(`Setting up target audience...`);
      
      // Step 1: Open target audience dropdown
      await this.clickOnElement(this.targetAudienceDropdown);
      
      // Step 2: Click Browse to open audience selection modal
      await this.clickOnElement(this.browseAudiencesButton);
      await this.page.waitForTimeout(2000); // Wait for modal to load
      
      // Step 3: Verify audience modal opened
      await this.verifier.verifyTheElementIsVisible(this.audienceModalTitle, {
        assertionMessage: 'Audience selection modal should be visible',
      });
      
      // Step 4: Select "All organization" option
      await this.clickOnElement(this.allOrganizationOption);
      await this.page.waitForTimeout(1000); // Wait for selection to register
      
      // Step 5: Enable the "All organization" toggle if not already enabled
      const isToggleEnabled = await this.allOrganizationSwitch.isChecked();
      if (!isToggleEnabled) {
        await this.allOrganizationSwitch.click();
        console.log('Enabled "All organization" toggle');
      } else {
        console.log('"All organization" toggle already enabled');
      }
      
      // Step 6: Verify selection confirmation appears
      await this.verifier.verifyTheElementIsVisible(this.allOrgSelectionConfirmation, {
        assertionMessage: 'All organization selection confirmation should be visible',
      });
      
      await this.verifier.verifyTheElementIsVisible(this.allOrgDescription, {
        assertionMessage: 'All organization description should be visible',
      });
      
      // Step 7: Close the audience modal
      await this.page.waitForTimeout(1000); // Wait for selection to register
      await this.clickOnElement(this.audienceDoneButton);
      
      // Step 8: Verify selection appears in main form
      await this.page.waitForTimeout(1000); // Wait for modal to close and form to update
      
      await this.verifier.verifyTheElementIsVisible(this.selectedAudienceText, {
        assertionMessage: 'Selected audience should appear in main form',
      });
      
      await this.verifier.verifyTheElementIsVisible(this.everyoneInOrgText, {
        assertionMessage: 'Everyone in organization text should be visible',
      });
      
      await this.verifier.verifyTheElementIsVisible(this.userCountText, {
        assertionMessage: 'User count should be displayed',
      });
      
      await this.verifier.verifyTheElementIsVisible(this.basedOnAudiencesText, {
        assertionMessage: 'Based on audiences text should be visible',
      });
      
      console.log(`Target audience setup completed`);
    });
  }

  /**
   * Sets membership approval method
   * Note: Private sites automatically use manual approval (no UI interaction needed)
   * Public sites can choose between manual or automatic approval
   */
  async setMembershipApproval(
    approval: 'manual' | 'automatic', 
    isPrivateSite: boolean = false, 
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Set membership approval to ${approval}`, async () => {
      if (isPrivateSite) {
        console.log('Private site - membership approval automatically set to manual (no UI interaction needed)');
        return; // Private sites don't show membership approval UI - it's always manual
      }
      
      // For public sites only - select the approval method
      console.log(`🔧 Setting membership approval to: ${approval}`);
      if (approval === 'manual') {
        await this.clickOnElement(this.manuallyApproveOption);
      } else {
        await this.clickOnElement(this.automaticallyApproveOption);
      }
      console.log(`Membership approval set to: ${approval}`);
    });
  }

  // =============================================================================
  // MAIN ACTION METHODS - Complete workflows
  // =============================================================================

  /**
   * Creates a site with the complete flow
   * This is the main method that orchestrates the entire site creation process
   */
  async createSite(options: {
    name: string;
    category?: string;
    type: SiteType;
    stepInfo?: string;
    apiPayload?: Partial<SiteCreationPayload>;
  }): Promise<void> {
    await test.step(options.stepInfo || `Create ${options.type} site: ${options.name}`, async () => {
      console.log(`Starting ${options.type} site creation: ${options.name}`);
      
      // Step 1: Fill basic site details (name, category, privacy)
      await this.fillSiteDetails({
        name: options.name,
        category: options.category,
        isPrivate: options.type === SiteType.PRIVATE,
      });
      
      // Step 2: Setup target audience (required for all sites)
      await this.setupTargetAudience();
      
      // Step 3: Set membership approval (handles private vs public logic)
      const isPrivate = options.type === SiteType.PRIVATE;
      await this.setMembershipApproval('manual', isPrivate);
      
      // Step 4: Create the site
      console.log(`🎯 Creating site...`);
      await this.clickOnElement(this.addSiteButton);
      
      console.log(`Site creation process completed for: ${options.name}`);
    });
  }

  /**
   * Cancels site creation and closes the modal
   */
  async cancelSiteCreation(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Cancel site creation', async () => {
      await this.clickOnElement(this.cancelButton);
      console.log(`Site creation cancelled`);
    });
  }

  /**
   * Verifies that the site was created successfully
   */
  async verifySiteCreatedSuccessfully(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify site "${siteName}" created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.successMessage, {
        assertionMessage: `Site creation success message should be visible for ${siteName}`,
      });
      console.log(`Site "${siteName}" created successfully!`);
    });
  }

  // =============================================================================
  // DEPRECATED METHOD - Keep for backward compatibility
  // =============================================================================

  /**
   * @deprecated This method is now handled within togglePrivateAccess()
   * Confirms making the site private (handles confirmation modal)
   */
  async confirmMakePrivate(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Confirm make site private', async () => {
      await this.clickOnElement(this.makePrivateConfirmButton);
    });
  }
} 