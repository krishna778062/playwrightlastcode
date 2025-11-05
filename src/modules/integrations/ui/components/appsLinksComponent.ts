import { expect, Locator, Page } from '@playwright/test';

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
    this.linkURLInputField = this.page.getByPlaceholder('Link URL');
    this.linkLabelInputField = this.page.getByPlaceholder('Link label');
    this.crossButton = this.page
      .getByTestId('remove-link-button')
      .or(this.page.getByLabel(/remove|delete|close/i))
      .or(this.page.locator('.AdditionalFieldList button').first());
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

  async getHeaderLocator(headerName: string): Promise<Locator> {
    return this.page.getByRole('button', { name: headerName }).first();
  }

  async getTabLocator(tabName: string): Promise<Locator> {
    return this.page.getByRole('button', { name: tabName }).first();
  }

  async getAppLocator(appName: string): Promise<Locator> {
    return this.page
      .getByTitle(appName)
      .or(this.page.getByRole('link', { name: appName }))
      .or(this.page.locator(`a[title="${appName}"]`));
  }

  async aTitleLocator(appName: string): Promise<Locator> {
    return this.page
      .locator(`a[title="${appName}"]`)
      .getByRole('button', { name: /favorite/i })
      .or(this.page.locator(`a[title="${appName}"] + button[class*="favoriteIcon"]`));
  }

  async getLinkLocator(linkName: string): Promise<Locator> {
    return this.page
      .getByText(linkName, { exact: true })
      .or(this.page.locator(`p:has-text("${linkName}")`))
      .or(this.page.locator(`div p:text("${linkName}")`));
  }

  async pTextLocator(text: string): Promise<Locator> {
    return this.page.getByRole('tab', { name: `${text}` });
  }

  async pHasTextLocator(text: string): Promise<Locator> {
    return this.page.locator(`p:has-text("${text}")`);
  }

  async spanTextLocator(text: string): Promise<Locator> {
    return this.page.locator(`span:has-text("${text}")`);
  }

  async buttonTextLocator(text: string): Promise<Locator> {
    return this.page.locator(`button:has-text("${text}")`);
  }

  async starIconLocatorApp(app: string): Promise<Locator> {
    return this.page.getByTitle(`${app}`).locator('button');
  }

  async starIconLocatorLink(link: string): Promise<Locator> {
    return this.page.locator(`//p[text()='${link}']/..//button[@aria-label="Favorite"]`);
  }

  async addedLinksLocator(linkName: string): Promise<Locator> {
    return this.page.locator(`//p[text()='${linkName}']/../../..`);
  }

  async h3TextLocator(message: string): Promise<Locator> {
    return this.page.locator('h3', { hasText: `${message}` });
  }

  async clickOnCustomJsonInputField(): Promise<void> {
    await this.customJsonInputField.clear();
    await this.clickOnElement(this.customJsonInputField);
  }

  async clickOnAppsIntegrationDropdown(integrationName: string): Promise<void> {
    await this.appsIntegrationDropdown.selectOption({ label: integrationName });
  }

  async clickOnSaveButton(): Promise<void> {
    await this.clickOnElement(this.saveButton);
  }

  async clickOnHomePageHeader(headerName: string): Promise<void> {
    const headerLocator = await this.getHeaderLocator(headerName);
    await expect(headerLocator, `${headerName} tab not visible`).toBeVisible();
    await headerLocator.click();
  }

  async verifySubTabsInsideAppsLinksTabIsVisible(headerName: string): Promise<void> {
    const appsTab = await this.buttonTextLocator(headerName);
    await expect(appsTab, `${headerName} tab not visible`).toBeVisible();
  }

  async markAppsFavorite(appName: string): Promise<void> {
    const locator = await this.starIconLocatorApp(appName);
    await locator.click();
  }

  async markLinksFavorite(linkName: string): Promise<void> {
    await (await this.addedLinksLocator(linkName)).hover();
    const starIconLocator = await this.starIconLocatorLink(linkName);
    await starIconLocator.waitFor({ state: 'visible' });
    await starIconLocator.click({ force: true });
  }

  async verifyAppsAreMarkedAsFavorite(appName: string): Promise<void> {
    const appLocator = await this.getAppLocator(appName);
    await appLocator.hover();
    await expect(appLocator, `${appName} not visible`).toBeVisible();
  }

  async verifyLinksAreMarkedAsFavorite(linkName: string): Promise<void> {
    const favoriteLink = await this.pHasTextLocator(linkName);
    await favoriteLink.waitFor({ state: 'visible' });
    await expect(favoriteLink, `${linkName} not visible`).toBeVisible();
  }

  async getLinksCount(): Promise<number> {
    const count = await this.crossButton.count();
    return count;
  }

  async verifyURL(type: string, name: string, url: string): Promise<void> {
    if (type.includes('link')) {
      const linkURL = await this.pHasTextLocator(name);
      await linkURL.click();
    } else if (type.includes('app')) {
      const appURL = await this.getAppLocator(name);
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
    const savedOrgLink = await this.pHasTextLocator(name);
    await expect(savedOrgLink, 'expecting this to be visible').toBeVisible();
  }

  async verifyApps(name: string): Promise<void> {
    await this.verifyAppsAreMarkedAsFavorite(name);
  }

  async customLinkCheckBox(status: string): Promise<void> {
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
  }

  async appsLinksLaunchpadButtons(button: string): Promise<void> {
    await (await this.buttonTextLocator(button)).first().click();
  }

  async verifyCustomLinkVisibility(status: string): Promise<void> {
    const customLink = this.page.locator("p:has-text('Custom links')");
    if (status.includes('visible')) {
      await expect(customLink, 'expecting this to be visible').toBeVisible();
    } else {
      await expect(customLink, 'expecting this to be not visible').not.toBeVisible();
    }
  }

  async addAndVerifyCustomLinks(name: string, url: string): Promise<void> {
    await this.addCustomLinkButton.click();
    await this.addLinkLabel.click();
    await this.addLinkLabel.fill(name);
    await this.addLinkUrl.fill(url);
    await this.addButton.click();
  }

  async clickOnSubButtonsInsideFavorite(name: string): Promise<void> {
    const subButtons = (await this.pTextLocator(name)).nth(1);
    await subButtons.click();
  }

  async deleteCustomLink(name: string): Promise<void> {
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
  }

  async verifyOrgLinkVisibility(status: string): Promise<void> {
    const orgLink = this.page.locator("p:has-text('Org links')");
    if (status.includes('visible')) {
      await expect(orgLink, 'expecting this to be visible').toBeVisible();
    } else {
      await expect(orgLink, 'expecting this to be visible').not.toBeVisible();
    }
  }

  async verifyZeroStateMessageOfFavoritesTab(message: string, subMessage: string): Promise<void> {
    const appsMessage = await this.h3TextLocator(message);
    const text = await this.pHasTextLocator(subMessage);
    await expect(appsMessage, `${appsMessage} not visible`).toBeVisible();
    await expect(text, `${subMessage} not visible`).toBeVisible();
  }

  async verifyHomePageHeaderNonVisibility(button: string): Promise<void> {
    const name = this.page.getByLabel(`'${button}'`);
    await expect(name, 'expecting this to be not visible').not.toBeVisible();
  }

  async verifyButtonInsideCustomLinks(button: string): Promise<void> {
    const name = this.addLinksButton;
    await expect(name, 'expecting this to be visible').toBeVisible();
  }

  async verifySearchBoxVisibilityAndCountInsideLaunchpad(): Promise<void> {
    const searchBox = this.page.getByLabel('Search links...');
    await expect(searchBox, 'expecting this to be visible').toBeVisible();
    const linksCount = this.page.locator('p:has-text("Saved links")');
    await expect(linksCount, 'expecting this to be visible').toBeVisible();
  }

  async clickOnSubButtonsInsideLinksTab(name: string): Promise<void> {
    const linksTab = (await this.pTextLocator(name)).first();
    await linksTab.first().click();
  }

  async verifyEndUserCustomLinks(message: string): Promise<void> {
    const statement = await this.pTextLocator(message);
    await expect(statement, 'expecting this to be visible').toBeVisible();
  }

  async addDuplicateLinks(label: string, url: string): Promise<void> {
    const urlInput = this.page.getByPlaceholder('Link URL');
    await urlInput.click();
    await urlInput.fill(url);
    const labelInput = this.page.getByPlaceholder('Link label');
    await urlInput.click();
    await labelInput.fill(label);
    await this.addLink.click({ force: true });
  }

  async verifyLinksDuplicate(label: string, _url: string): Promise<void> {
    await this.urlInput.fill('https://www.google.com/');
    await this.labelInput.fill('Google');
    const sameURL = await this.spanTextLocator(label);
    const message = await this.spanTextLocator(label);
    await expect(sameURL, 'expecting this to be visible').toBeVisible();
    await expect(message, 'expecting this to be visible').toBeVisible();
  }

  async verifyAppsDuplicate(message: string): Promise<void> {
    await this.customJsonInputField.clear();
    await this.customJsonInputField.fill(JSON.stringify(this.apps_json));
    await this.saveButton.click();
    const error = await this.pTextLocator(message);
    await expect(error, 'expecting this to be visible').toBeVisible();
  }

  async cancelAllLinksPresent(): Promise<void> {
    const linkCount = await this.getLinksCount();
    for (let i = 0; i < linkCount; i++) {
      const close = this.crossButton.first();
      await close.click();
    }
  }

  async enterLinkLabel(label: string): Promise<void> {
    await this.linkLabelInputField.fill(label);
  }

  async enterLinkUrl(url: string): Promise<void> {
    await this.linkURLInputField.fill(url);
  }

  async clickAddButton(): Promise<void> {
    await this.addLink.click();
  }

  async clickSaveButton(): Promise<void> {
    await this.saveButton.click();
  }

  async addLinks(linkData: Array<{ Link_URL: string; Link_Label: string }>): Promise<void> {
    for (const links of linkData) {
      const linkURL = links.Link_URL;
      const linkLabel = links.Link_Label;
      await this.enterLinkLabel(linkLabel);
      await this.enterLinkUrl(linkURL);
      await this.clickAddButton();
    }
    await this.clickSaveButton();
  }

  async addAppsFromCustomJson(customJsonOption: string): Promise<void> {
    await this.appsIntegrationDropdown.selectOption({ label: customJsonOption });
    await this.customJsonInputField.clear();
    await this.customJsonInputField.click();
    await this.customJsonInputField.fill(JSON.stringify(this.jsonData, null, 2));
  }

  async verifySubTabsInsideLinksVisibility(header: string, subTab: string, status: string): Promise<void> {
    await (await this.pTextLocator(header)).click();
    const visiblility = (await this.pHasTextLocator(subTab)).first();
    if (status.includes('false')) {
      await expect(visiblility, `${subTab} is visible`).not.toBeVisible();
    } else {
      await expect(visiblility, `${subTab} is not visible`).toBeVisible();
    }
  }

  async addDuplicateCustomApps(): Promise<void> {
    await this.customJsonInputField.clear();
    await this.customJsonInputField.click();
    await this.customJsonInputField.fill(JSON.stringify(this.apps_json, null, 2));
    await this.saveButton.click();
    await this.page.waitForTimeout(3000);
  }
}
