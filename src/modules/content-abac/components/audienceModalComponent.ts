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
}
