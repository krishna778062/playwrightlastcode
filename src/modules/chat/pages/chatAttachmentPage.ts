import { expect, Locator, test } from '@playwright/test';
import { Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { ChatAttachmentHelper } from '../helpers/chatAttachmentHelper';

export class ChatAttachmentPage extends BasePage {
    verifyThePageIsLoaded(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    constructor(page: Page) {
        super(page);
    }

    async isAttachmentButtonVisible(options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.isAttachmentButtonVisible(options);
    }

    async attachFile(filePath: string, options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.attachFile(filePath, options);
    }

    async sendButton(options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.sendButton(options);
    }

    async unsupportedFileMessaege(options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.unsupportedFile(options);
    }

    async sendSameFileMultipleTimes(filePath: string, numberOfFiles: number, options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.sendSameFileMultipleTimes(filePath, numberOfFiles, options);
    }

    async MaximumFilesLimitError(options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.MaximumFilesLimitError(options);
    }

    async viewImageAttachment(options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.viewImageAttachment(options);
    }

    async deleteAttachmentInEditor(options?: { stepInfo?: string }): Promise<void> {
        return await ChatAttachmentHelper.deleteAttachmentInEditor(options);
    }

    async sendAttachment(filePath: string, options?: { stepInfo?: string }): Promise<void> {
        await this.isAttachmentButtonVisible(options);
        await this.attachFile(filePath);
        await this.sendButton(options);
    }   

    async sendUnsupportedFile(filePath: string, options?: { stepInfo?: string }): Promise<void> {
        await this.isAttachmentButtonVisible(options);
        await this.attachFile(filePath);
        await this.unsupportedFileMessaege(options);
    }   

        async sendMultipleFiles(filePath: string, numberOfFiles: number, options?: { stepInfo?: string }): Promise<void> {
            await this.isAttachmentButtonVisible(options);
            await this.sendSameFileMultipleTimes(filePath, numberOfFiles);
            await this.sendButton(options);
        }  

        async sendFileExceedLimit(filePath: string, numberOfFiles: number, options?: { stepInfo?: string }): Promise<void> {
            await this.isAttachmentButtonVisible(options);
            await this.sendSameFileMultipleTimes(filePath, numberOfFiles);
            await this.MaximumFilesLimitError(options);
        }  

        async sendImageAndViewAttachment(filePath: string, options?: { stepInfo?: string }): Promise<void> {
            await this.sendAttachment(filePath);
            await this.viewImageAttachment(options);
        }  
        async deleteAttachmentBeforeSending(filePath: string, options?: { stepInfo?: string }): Promise<void> {
            await this.isAttachmentButtonVisible(options);
            await this.attachFile(filePath);
            await this.deleteAttachmentInEditor(options);
        }  
}