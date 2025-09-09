import { BasePage } from '@/src/core/pages/basePage';
import { adGroupComponent } from '../components/adGroupComponent';
import { Page } from '@playwright/test';

export class adGroupPage extends BasePage {
    async verifyThePageIsLoaded(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    readonly adGroupComponent: adGroupComponent;
    constructor(page: Page) {
        super(page);
        this.adGroupComponent = new adGroupComponent(page);
    }

    
    async clickOnSpanContainText(text: string): Promise<void> {
        return this.adGroupComponent.clickOnSpanContainButtonText(text);
    }

    async verifyMicrosoftEntraIDGroupsVisibility(text: string): Promise<void> {
        return this.adGroupComponent.verifyMicrosoftEntraIDGroupsVisibility(text);
    }

    async clickOnButtonContainText(text: string): Promise<void> {
        return this.adGroupComponent.clickOnButtonContainText(text);
    }


    async ADGroupsModalIsDisplayed(text: string): Promise<void> {
        return this.adGroupComponent.ADGroupsModalIsDisplayed(text);
    }

    async selectADGroups(text: string): Promise<void> {
        return this.adGroupComponent.selectADGroups(text);
    }

    async validateMessage(text: string, number: string): Promise<void> {
        return this.adGroupComponent.validateMessage(text, number);
    }

    async SpanTextDisplayed(text: string): Promise<void> {
        return this.adGroupComponent.SpanTextDisplayed(text);
    }


    async verifyGroupType(text: string): Promise<void> {
        return this.adGroupComponent.verifyGroupType(text);
    }

    async verifyParagraphText(text: string): Promise<void> {
        return this.adGroupComponent.verifyParagraphText(text);
    }

    async ClickOnDisconnectButton(text: string): Promise<void> {
        return this.adGroupComponent.ClickOnDisconnectButton(text);
    }

    async headingisPresent(text: string): Promise<void> {
        return this.adGroupComponent.headingisPresent(text);
    }

    async clickOnSaveButton(text: string): Promise<void> {
        return this.adGroupComponent.clickOnSaveButton(text);
      }
    
}