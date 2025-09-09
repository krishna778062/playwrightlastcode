import { BasePage } from '@/src/core/pages/basePage';
import { AdGroupComponent } from '../components/adGroupComponent';
import { Page } from '@playwright/test';

export class adGroupPage extends BasePage {
    async verifyThePageIsLoaded(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    readonly adGroupComponent: AdGroupComponent;
    constructor(page: Page) {
        super(page);
        this.adGroupComponent = new AdGroupComponent(page);
    }

    
    async clickOnSpanContainButtonText(text: string): Promise<void> {
        return this.adGroupComponent.clickOnSpanContainButtonText(text);
    }

    async verifyMicrosoftEntraIDGroupsVisibility(text: string): Promise<void> {
        return this.adGroupComponent.verifyMicrosoftEntraIDGroupsVisibility(text);
    }

    async clickOnButtonContainText(text: string): Promise<void> {
        return this.adGroupComponent.clickOnButtonContainText(text);
    }


    async adGroupsModalIsDisplayed(text: string): Promise<void> {
        return this.adGroupComponent.adGroupsModalIsDisplayed(text);
    }

    async selectADGroups(text: string): Promise<void> {
        return this.adGroupComponent.selectADGroups(text);
    }

    async validateMessage(text: string, number: string): Promise<void> {
        return this.adGroupComponent.validateMessage(text, number);
    }

    async divTextDisplayed(text: string): Promise<void> {
        return this.adGroupComponent.divTextDisplayed(text);
    }


    async verifyGroupType(text: string): Promise<void> {
        return this.adGroupComponent.verifyGroupType(text);
    }

    async verifyParagraphText(text: string): Promise<void> {
        return this.adGroupComponent.verifyParagraphText(text);
    }

    async clickOnDisconnectButton(text: string): Promise<void> {
        return this.adGroupComponent.clickOnDisconnectButton(text);
    }

    async headingIsPresent(text: string): Promise<void> {
        return this.adGroupComponent.headingIsPresent(text);
    }
    
}