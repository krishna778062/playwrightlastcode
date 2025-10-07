import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AudienceModalComponent extends BaseComponent {
  readonly audienceModalHeading: Locator;
  readonly allOrganizationToggle: Locator;
  readonly allOrganizationMessage: Locator;
  readonly openParentContainer: Locator;
  readonly selectingAudienceGroup: Locator;
  readonly clickingOnDoneButton: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.audienceModalHeading = page.getByText('Audiences', { exact: true });
    this.allOrganizationToggle = page.getByRole('switch', { name: 'All organization' });
    this.allOrganizationMessage = page.getByText("You've selected 'All organization'");
    this.openParentContainer = page.getByTestId('i-arrowRight').first();
    this.selectingAudienceGroup = page
      .locator(
        '.FirstColumn-module-firstColumnNameSectionContainer___CHCQ6.FirstColumn-module-firstColumnNameSectionContainerInsidePicker___W7fG6 > .FirstColumn-module-firstColumnNameContainer___qPuUp > .FirstColumn-module-checkboxContainer___cVWLA > .CheckboxInput-module__wrapper__6OBBL > .u-ignoreLegacyStyle'
      )
      .first();
    this.clickingOnDoneButton = page.getByRole('button', { name: 'Done' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.audienceModalHeading, {
      assertionMessage: 'Audience modal heading should be visible on audience modal page',
    });
  }

  async verifyingAudienceModalHeading(): Promise<void> {
    await test.step('Verifying audience modal heading', async () => {
      await this.verifier.verifyTheElementIsVisible(this.audienceModalHeading, {
        assertionMessage: 'Audience modal heading should be visible on audience modal page',
      });
    });
  }

  async clickOnAllOrganizationOption(): Promise<void> {
    await test.step('Clicking on all organization option', async () => {
      await this.clickOnElement(this.allOrganizationToggle);
      await this.verifier.verifyTheElementIsVisible(this.allOrganizationMessage, {
        assertionMessage: 'All organization switch should be visible on audience modal page',
      });
      await this.clickOnElement(this.allOrganizationToggle);
    });
  }

  async selectingAudience(): Promise<void> {
    await test.step('Selecting audience', async () => {
      await this.clickOnElement(this.openParentContainer);
      await this.clickOnElement(this.selectingAudienceGroup);
      await this.clickOnElement(this.clickingOnDoneButton);
    });
  }
}
