import { Locator, Page ,test, expect} from "@playwright/test";
import { TIMEOUTS } from '@core/constants/timeouts'
import { BasePage } from "@/src/core/pages/basePage";
import { BaseActionUtil } from "@/src/core/utils/baseActionUtil";

export class AccessControlGroupsPage extends BasePage {
    readonly acgDropdownButton: Locator;
    readonly acgCreateButtonSingle: Locator;
    readonly acgCreateButtonMultiple: Locator;
    readonly acgCreatePopupCloseButton: Locator;
    readonly acgAlertFeatureButton: Locator;
             baseActionUtil: BaseActionUtil;
             page: Page;
    readonly acgSearchField: Locator; 
    readonly acgCheckBoxes: Locator;   
    readonly acgAudiencesName: Locator;     
    readonly acgMenuOptions: Locator;
    readonly acgDeleteButton: Locator;
    readonly toastMessages: Locator;
    readonly iUnderstand: Locator;
    

    constructor(page: Page) {
        super(page);
        this.acgCreatePopupCloseButton = page.getByRole('button', { name: 'Close' });
        this.acgDropdownButton = page.getByRole('button',{ name: 'Open menu' });
        this.acgCreateButtonSingle = page.getByRole('button', { name: 'Create' }).nth(1);
        this.acgCreateButtonMultiple = page.getByRole('menuitem', { name: 'Bulk create control groups'});
        this.acgAlertFeatureButton = page.locator('#feature-ALERTS');
        this.baseActionUtil = new BaseActionUtil(page);
        this.page = page;
        this.acgSearchField = page.locator('#search');
        this.acgCheckBoxes = page.locator("[type='checkbox']");
        this.acgAudiencesName = page.locator('.NameWithDescription-module-nameInnerContainer___lEDYS p');
        this.acgMenuOptions = page.locator('[aria-haspopup="menu"]');
        this.acgDeleteButton = page.locator("text='Delete'");
        this.toastMessages = page.locator('.Toast-module__inner__QUfNu div p');
        this.iUnderstand = page.locator('#confirmDelete');
    }

    getByRole(param1: any, name: string){
        return this.page.getByRole(param1, { name: name });
    }


    async verifyThePageIsLoaded(): Promise<void> {
        await test.step(`Verifying the access control groups page is loaded`, async () => {
            await expect(this.acgCreateButtonSingle, `expecting create single ACG button to be visible`).toBeVisible({
                timeout: TIMEOUTS.MEDIUM,
            });
        });
    }

    async clickOnCreateButton(buttonType: string ,options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Click on dropdown button for ACG button`, async () => {
            await this.clickOnElement(this.acgDropdownButton, {
                timeout: options?.timeout ?? 10_000,
            });
        });
            await test.step(options?.stepInfo ?? `Click on create ${buttonType}ACG button`, async () => {
                (buttonType == 'Single')?await this.clickOnElement(this.acgCreateButtonSingle, {
                timeout: options?.timeout ?? 10_000,
            }):await this.clickOnElement(this.acgCreateButtonMultiple, {
                timeout: options?.timeout ?? 10_000,
               });
            });
    }

    async clickOnCloseButtonForACGCreatePopup(options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Click on close button for ACG create popup`, async () => {
            await this.clickOnElement(this.acgCreatePopupCloseButton, {
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async clickFeatureButton(featureName: string, options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Click on ${featureName} feature button`, async () => {
            var loc: Locator;
            switch(featureName){
                case "Alerts":
                    loc = this.acgAlertFeatureButton;
                    break;
                    default:
                        loc = this.acgAlertFeatureButton;
            }
            await this.checkElement(loc, {
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async clickOnButtonWithName(text: string,options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Click on ${text} button`, async () => {
            await this.clickOnElement(this.getByRole('button',text), {
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async SearchForValues(searchValue: string,options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Click on ${searchValue} button`, async () => {
            await this.fillInElement(this.acgSearchField,searchValue, {
                timeout: options?.timeout ?? 10_000,
            });
            await this.clickOnButtonWithName('Search', {
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async waitForAudiencesToLoad(options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Waiting for audiences page to load`, async () => {
            await this.acgCheckBoxes.nth(0).waitFor({
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async clickOnAudience(audienceValue: string,options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        let loc: Locator;
        for(let i = 0; i < await this.acgCheckBoxes.count(); i++){
            if(await this.acgAudiencesName.nth(i).textContent() == audienceValue){
                loc = this.acgCheckBoxes.nth(i);
                break;
            } 
        }
        await test.step(options?.stepInfo ?? `Check ${audienceValue} audience`, async () => {
            await this.checkElement(loc, {
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async deleteFirstACG(options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Click on menu options button for first ACG in the list`, async () => {
            await this.clickOnElement(this.acgMenuOptions.first(), {
                timeout: options?.timeout ?? 10_000,
            });
        });
        await test.step(options?.stepInfo ?? `Click on Delete option for first ACG in the list`, async () => {
            await this.clickOnElement(this.acgDeleteButton, {
                timeout: options?.timeout ?? 10_000,
            });
        });
        await test.step(options?.stepInfo ?? `Check the I understand checkbox on Delete ACG popup`, async () => { 
            await this.clickOnElement(this.iUnderstand, {
                timeout: options?.timeout ?? 10_000,
            });
        });
        await test.step(options?.stepInfo ?? `Click on Delete button on Delet ACG popup`, async () => { 
            await this.clickOnElement(this.acgDeleteButton, {
                timeout: options?.timeout ?? 10_000,
            });
        });
    }

    async verifyAcgToastMessage(toastMessage: string,numberOfAttempts: number,options?: { stepInfo?: string, timeout?: number }): Promise<void> {
        await test.step(options?.stepInfo ?? `Verifying ${toastMessage} toast message`, async () => {
                var i: number;
                let count: number = await this.toastMessages.count();
                let flag: boolean = false;
                for(i = 0; i < count; i++){
                    if(await this.toastMessages.nth(i).textContent() == toastMessage.trim()){
                        expect(true,'Toast message found').toBeTruthy();
                        flag = true;
                        break;
                    }
                }
                if(i == count){
                    await this.page.waitForTimeout(2000);
                    if(numberOfAttempts > 0 && !flag){
                        await this.verifyAcgToastMessage(toastMessage, numberOfAttempts--);
                    } else {
                    expect(false,'Toast message not found').toBeTruthy();
                    }
                }
        });
    }
}