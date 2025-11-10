import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AppsLinksComponents extends BaseComponent {
  readonly viewExampleButton: Locator;
  readonly copyButton: Locator;
  readonly customJsonInputField: Locator;
  readonly appsIntegrationDropdown: Locator;
  readonly saveButton: Locator;
  readonly starIcon: Locator;
  readonly linkButton: Locator;
  readonly customLinkBox: Locator;
  readonly confirmButton: Locator;
  readonly addLinkLabel: Locator;
  readonly addCustomLinkButton: Locator;
  readonly addLinkUrl: Locator;
  readonly addButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly addLink: Locator;
  readonly addLinksButton: Locator;
  readonly getHeaderLocatorFn: (headerName: string) => Locator;
  readonly getAppLocatorFn: (appName: string) => Locator;
  readonly pTextLocatorFn: (text: string) => Locator;
  readonly pHasTextLocatorFn: (text: string) => Locator;
  readonly spanTextLocatorFn: (text: string) => Locator;
  readonly buttonTextLocatorFn: (text: string) => Locator;
  readonly starIconLocatorAppFn: (app: string) => Locator;
  readonly starIconLocatorLinkFn: (link: string) => Locator;
  readonly addedLinksLocatorFn: (linkName: string) => Locator;
  readonly h3TextLocatorFn: (message: string) => Locator;
  readonly apps_json: { name: string; url: string; img: string }[];
  readonly linkURLInputField: Locator;
  readonly linkLabelInputField: Locator;
  readonly crossButton: Locator;
  readonly linksButton: Locator;
  readonly urlInput: Locator;
  readonly labelInput: Locator;
  readonly jsonData: { name: string; url: string; img: string }[];
  constructor(page: Page) {
    super(page);
    this.viewExampleButton = this.page.getByText('View example');
    this.copyButton = this.page.locator('span', { hasText: 'Copy' });
    this.customJsonInputField = this.page.getByPlaceholder('Custom JSON *');
    this.appsIntegrationDropdown = this.page.locator('select[id="appsIntegrationProvider"]');
    this.saveButton = this.page.locator('span', { hasText: 'Save' });
    this.starIcon = this.page.locator("span[aria-label='Mark as favorite']");
    this.linkButton = this.page.getByRole('button', { name: 'Links' });
    this.customLinkBox = this.page.locator('input[id="myLinksEnabled"]');
    this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    this.addLinkLabel = this.page.locator('input[id="url_label"]');
    this.addCustomLinkButton = this.page.getByRole('button', { name: 'Add link' });
    this.addLinkUrl = this.page.locator('input[id="url_value"]');
    this.addButton = this.page.getByRole('button', { name: 'Add' });
    this.editButton = this.page.getByRole('button', { name: 'Edit links' });
    this.deleteButton = this.page.getByRole('button', { name: 'delete' });
    this.addLink = this.page.getByRole('button', { name: 'Add' });
    this.addLinksButton = this.page.getByRole('button', { name: 'Add links' });
    this.getHeaderLocatorFn = (headerName: string) => this.page.getByRole('button', { name: headerName });
    this.getAppLocatorFn = (appName: string) =>
      this.page
        .getByTitle(appName)
        .or(this.page.getByRole('link', { name: appName }))
        .or(this.page.locator(`a[title="${appName}"]`));
    this.pTextLocatorFn = (text: string) => this.page.getByRole('tab', { name: `${text}` });
    this.pHasTextLocatorFn = (text: string) => this.page.locator(`p:has-text("${text}")`);
    this.spanTextLocatorFn = (text: string) => this.page.locator(`span:has-text("${text}")`);
    this.buttonTextLocatorFn = (text: string) => this.page.locator(`button:has-text("${text}")`);
    this.starIconLocatorAppFn = (app: string) => this.page.getByTitle(`${app}`).locator('button');
    this.starIconLocatorLinkFn = (link: string) =>
      this.page.locator(`//p[text()='${link}']/..//button[@aria-label="Favorite"]`);
    this.addedLinksLocatorFn = (linkName: string) => this.page.locator(`//p[text()='${linkName}']/../../..`);
    this.h3TextLocatorFn = (message: string) => this.page.locator('h3', { hasText: `${message}` });
    this.linkURLInputField = this.page.getByPlaceholder('Link URL');
    this.linkLabelInputField = this.page.getByPlaceholder('Link label');
    this.crossButton = this.page.locator("//i[@class = 'Icon Icon--cross Icon--line']");
    this.apps_json = [
      {
        name: 'Google Drive',
        url: 'http://google.com/drive',
        img: 'https://www.gstatic.com/images/branding/product/1x/drive_96dp.png',
      },
      {
        name: 'Microsoft 365',
        url: 'https://office.com',
        img: 'https://affinityit.co.uk/uploads/images/content/_large/Microsoft_365_-_New_Website.png',
      },
      {
        name: 'Google Drive',
        url: 'http://google.com/drive',
        img: 'https://www.gstatic.com/images/branding/product/1x/drive_96dp.png',
      },
    ];
    this.customJsonInputField = this.page.locator('textarea[name="customJson"]');
    this.linksButton = this.page.locator('p', { hasText: 'Links' });
    this.urlInput = this.page.getByPlaceholder('Link URL');
    this.labelInput = this.page.getByPlaceholder('Link label');
    this.jsonData = [
      {
        name: 'Google Drive',
        url: 'http://google.com/drive',
        img: 'https://www.gstatic.com/images/branding/product/1x/drive_96dp.png',
      },
      {
        name: 'Microsoft 365',
        url: 'https://office.com',
        img: 'https://affinityit.co.uk/uploads/images/content/_large/Microsoft_365_-_New_Website.png',
      },
    ];
  }

  async clickOnCustomJsonInputField(): Promise<void> {
    await test.step(`Clicking on custom JSON input field`, async () => {
      await this.customJsonInputField.clear();
      await this.clickOnElement(this.customJsonInputField);
    });
  }

  async clickOnAppsIntegrationDropdown(integrationName: string): Promise<void> {
    await test.step(`Clicking on apps integration dropdown`, async () => {
      await this.appsIntegrationDropdown.selectOption({ label: integrationName });
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step(`Clicking on save button`, async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  async clickOnHomePageHeader(headerName: string): Promise<void> {
    await test.step(`Clicking on home page header`, async () => {
      const headerLocator = this.getHeaderLocatorFn(headerName).first();
      await expect(headerLocator, `${headerName} tab not visible`).toBeVisible();
      await headerLocator.click();
    });
  }

  async verifySubTabsInsideAppsLinksTabIsVisible(headerName: string): Promise<void> {
    await test.step(`Verifying sub tabs inside apps links tab is visible`, async () => {
      const appsTab = this.buttonTextLocatorFn(headerName).first();
      await expect(appsTab, `${headerName} tab not visible`).toBeVisible();
    });
  }

  async markAppsFavorite(appName: string): Promise<void> {
    await test.step(`Marking apps favorite`, async () => {
      const locator = this.starIconLocatorAppFn(appName);
      await locator.click();
    });
  }

  async markLinksFavorite(linkName: string): Promise<void> {
    await test.step(`Marking links favorite`, async () => {
      await this.addedLinksLocatorFn(linkName).hover();
      const starIconLocator = this.starIconLocatorLinkFn(linkName);
      await starIconLocator.waitFor({ state: 'visible' });
      await starIconLocator.click({ force: true });
    });
  }

  async verifyAppsAreMarkedAsFavorite(appName: string): Promise<void> {
    await test.step(`Verifying apps are marked as favorite`, async () => {
      const appLocator = this.getAppLocatorFn(appName);
      await appLocator.hover();
      await expect(appLocator, `${appName} not visible`).toBeVisible();
    });
  }

  async verifyLinksAreMarkedAsFavorite(linkName: string): Promise<void> {
    await test.step(`Verifying links are marked as favorite`, async () => {
      const favoriteLink = this.pHasTextLocatorFn(linkName);
      await favoriteLink.waitFor({ state: 'visible' });
      await expect(favoriteLink, `${linkName} not visible`).toBeVisible();
    });
  }

  /*
  It returns the count of links present in the apps links tab.
  */
  async getLinksCount(): Promise<number> {
    const count = await this.crossButton.count();
    return count;
  }

  async verifyURL(type: string, name: string, url: string): Promise<void> {
    if (type.includes('link')) {
      const linkURL = this.pHasTextLocatorFn(name);
      await linkURL.click();
    } else if (type.includes('app')) {
      const appURL = this.getAppLocatorFn(name);
      await appURL.click();
    }

    // Wait for new tab to open
    await this.page.waitForTimeout(2000);

    // Get the new tab (index 1)
    const pages = this.page.context().pages();
    const newTab = pages[pages.length - 1];

    const newTabURL = newTab.url();
    expect(newTabURL, 'expecting to contain').toContain(url);
    await newTab.close();
    await this.page.waitForTimeout(10000);
  }

  async verifyOrgLinks(name: string): Promise<void> {
    await test.step(`Verifying org links`, async () => {
      const savedOrgLink = this.pHasTextLocatorFn(name);
      await expect(savedOrgLink, 'expecting this to be visible').toBeVisible();
    });
  }

  async verifyApps(name: string): Promise<void> {
    await test.step(`Verifying apps`, async () => {
      await this.verifyAppsAreMarkedAsFavorite(name);
    });
  }

  async customLinkCheckBox(status: string): Promise<void> {
    await test.step(`Verifying custom link check box`, async () => {
      const value: string = (await this.customLinkBox.getAttribute('value')) ?? '';
      if (status.includes('true') && value.includes('false')) {
        //checkbox Check
        await this.customLinkBox.click();
        await this.saveButton.click();
      }
      //checkbox Uncheck
      else {
        await this.customLinkBox.click();
        await this.saveButton.click();
        await this.confirmButton.click();
      }
    });
  }

  async appsLinksLaunchpadButtons(button: string): Promise<void> {
    await test.step(`Clicking on apps links launchpad buttons`, async () => {
      await this.buttonTextLocatorFn(button).first().click();
    });
  }

  async verifyCustomLinkVisibility(status: string): Promise<void> {
    await test.step(`Verifying custom link visibility`, async () => {
      const customLink = this.page.locator("p:has-text('Custom links')");
      if (status.includes('visible')) {
        await expect(customLink, 'expecting this to be visible').toBeVisible();
      } else {
        await expect(customLink, 'expecting this to be not visible').not.toBeVisible();
      }
    });
  }

  async addAndVerifyCustomLinks(name: string, url: string): Promise<void> {
    await test.step(`Adding and verifying custom links`, async () => {
      await this.addCustomLinkButton.click();
      await this.addLinkLabel.click();
      await this.addLinkLabel.fill(name);
      await this.addLinkUrl.fill(url);
      await this.addButton.click();
    });
  }

  async clickOnSubButtonsInsideFavorite(name: string): Promise<void> {
    await test.step(`Clicking on sub buttons inside favorite`, async () => {
      const subButtons = this.pTextLocatorFn(name).nth(1);
      await subButtons.click();
    });
  }

  async deleteCustomLink(name: string): Promise<void> {
    await test.step(`Deleting custom link`, async () => {
      const deleteLink = this.page
        .getByRole('heading', { name: name, level: 3 })
        .locator('..')
        .locator('..')
        .locator('..')
        .getByLabel('Delete');
      await this.editButton.click();
      await deleteLink.click();
      const saveButton = this.page.locator("button:has-text('Save')");
      await saveButton.nth(1).click();
    });
  }

  async verifyOrgLinkVisibility(status: string): Promise<void> {
    await test.step(`Verifying org link visibility`, async () => {
      const orgLink = this.page.locator("p:has-text('Org links')");
      if (status.includes('visible')) {
        await expect(orgLink, 'expecting this to be visible').toBeVisible();
      } else {
        await expect(orgLink, 'expecting this to be visible').not.toBeVisible();
      }
    });
  }

  async verifyZeroStateMessageOfFavoritesTab(message: string, subMessage: string): Promise<void> {
    await test.step(`Verifying zero state message of favorites tab`, async () => {
      const appsMessage = this.h3TextLocatorFn(message);
      const text = this.pHasTextLocatorFn(subMessage);
      await expect(appsMessage, `${appsMessage} not visible`).toBeVisible();
      await expect(text, `${subMessage} not visible`).toBeVisible();
    });
  }

  async verifyHomePageHeaderNonVisibility(button: string): Promise<void> {
    await test.step(`Verifying home page header non visibility`, async () => {
      const name = this.page.getByLabel(`'${button}'`);
      await expect(name, 'expecting this to be not visible').not.toBeVisible();
    });
  }

  async verifyButtonInsideCustomLinks(_button: string): Promise<void> {
    await test.step(`Verifying button inside custom links`, async () => {
      const name = this.addLinksButton;
      await expect(name, 'expecting this to be visible').toBeVisible();
    });
  }

  async verifySearchBoxVisibilityAndCountInsideLaunchpad(): Promise<void> {
    await test.step(`Verifying search box visibility and count inside launchpad`, async () => {
      const searchBox = this.page.getByLabel('Search links...');
      await expect(searchBox, 'expecting this to be visible').toBeVisible();
      const linksCount = this.page.locator('p:has-text("Saved links")');
      await expect(linksCount, 'expecting this to be visible').toBeVisible();
    });
  }

  async clickOnSubButtonsInsideLinksTab(name: string): Promise<void> {
    await test.step(`Clicking on sub buttons inside links tab`, async () => {
      const linksTab = this.pTextLocatorFn(name).first();
      await linksTab.first().click();
    });
  }

  async verifyEndUserCustomLinks(message: string): Promise<void> {
    await test.step(`Verifying end user custom links`, async () => {
      const statement = this.pTextLocatorFn(message);
      await expect(statement, 'expecting this to be visible').toBeVisible();
    });
  }

  async addDuplicateLinks(label: string, url: string): Promise<void> {
    await test.step(`Adding duplicate links`, async () => {
      const urlInput = this.page.getByPlaceholder('Link URL');
      await urlInput.click();
      await urlInput.fill(url);
      const labelInput = this.page.getByPlaceholder('Link label');
      await urlInput.click();
      await labelInput.fill(label);
      await this.addLink.click({ force: true });
    });
  }

  async verifyLinksDuplicate(label: string, _url: string): Promise<void> {
    await test.step(`Verifying links duplicate`, async () => {
      await this.urlInput.fill('https://www.google.com/');
      await this.labelInput.fill('Google');
      const sameURL = this.spanTextLocatorFn(label);
      const message = this.spanTextLocatorFn(label);
      await expect(sameURL, 'expecting this to be visible').toBeVisible();
      await expect(message, 'expecting this to be visible').toBeVisible();
    });
  }

  async verifyAppsDuplicate(message: string): Promise<void> {
    await test.step(`Verifying apps duplicate`, async () => {
      await this.customJsonInputField.clear();
      await this.customJsonInputField.fill(JSON.stringify(this.apps_json));
      await this.saveButton.click();
      const error = this.pTextLocatorFn(message);
      await expect(error, 'expecting this to be visible').toBeVisible();
    });
  }

  async cancelAllLinksPresent(): Promise<void> {
    await test.step(`Cancelling all links present`, async () => {
      let linkCount = await this.getLinksCount();
      while (linkCount > 0) {
        const close = this.crossButton.first();
        await close.click();
        linkCount = linkCount - 1;
      }
    });
  }

  async enterLinkLabel(label: string): Promise<void> {
    await test.step(`Entering link label`, async () => {
      await this.linkLabelInputField.fill(label);
    });
  }

  async enterLinkUrl(url: string): Promise<void> {
    await test.step(`Entering link url`, async () => {
      await this.linkURLInputField.fill(url);
    });
  }

  async clickAddButton(): Promise<void> {
    await test.step(`Clicking add button`, async () => {
      await this.addLink.click();
    });
  }

  async clickSaveButton(): Promise<void> {
    await test.step(`Clicking save button`, async () => {
      await this.saveButton.click();
    });
  }

  async addLinks(linkData: Array<{ Link_URL: string; Link_Label: string }>): Promise<void> {
    await test.step(`Adding links`, async () => {
      for (const links of linkData) {
        const linkURL = links.Link_URL;
        const linkLabel = links.Link_Label;
        await this.enterLinkLabel(linkLabel);
        await this.enterLinkUrl(linkURL);
        await this.clickAddButton();
      }
      await this.clickSaveButton();
    });
  }

  async addAppsFromCustomJson(customJsonOption: string): Promise<void> {
    await test.step(`Adding apps from custom JSON`, async () => {
      await this.appsIntegrationDropdown.selectOption({ label: customJsonOption });
      await this.customJsonInputField.clear();
      await this.customJsonInputField.click();
      await this.customJsonInputField.fill(JSON.stringify(this.jsonData, null, 2));
    });
  }

  async verifySubTabsInsideLinksVisibility(header: string, subTab: string, status: string): Promise<void> {
    await test.step(`Verifying sub tabs inside links visibility`, async () => {
      await this.pTextLocatorFn(header).click();
      const visiblility = this.pHasTextLocatorFn(subTab).first();
      if (status.includes('false')) {
        await expect(visiblility, `${subTab} is visible`).not.toBeVisible();
      } else {
        await expect(visiblility, `${subTab} is not visible`).toBeVisible();
      }
    });
  }

  async addDuplicateCustomApps(): Promise<void> {
    await test.step(`Adding duplicate custom apps`, async () => {
      await this.customJsonInputField.clear();
      await this.customJsonInputField.click();
      await this.customJsonInputField.fill(JSON.stringify(this.apps_json, null, 2));
      await this.saveButton.click();
      await this.page.waitForTimeout(3000);
    });
  }
}
