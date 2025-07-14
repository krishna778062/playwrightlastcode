import { BasePage } from "@/src/core/pages/basePage";
import { Page } from "@playwright/test";

export class EventCreationPage extends BasePage<any, any> {
    verifyThePageIsLoaded(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    constructor(page: Page) {
        super(page);
    }

    get actions() {
        return undefined;
    }

    get assertions() {
        return undefined;
    }
}