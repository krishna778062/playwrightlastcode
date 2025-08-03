import { BasePage } from '@core/pages/basePage';
import { Page } from '@playwright/test';
import { AccessControlGroupsPage } from './abacPage/acgPage/accessControlGroupsPage'

export class PlatformsBasePage extends BasePage {
    readonly accessControlGroupsPage: AccessControlGroupsPage;

    constructor(page: Page) {
        super(page);
        this.accessControlGroupsPage = new AccessControlGroupsPage(page);
    }

    async verifyThePageIsLoaded(): Promise<void> {}
}