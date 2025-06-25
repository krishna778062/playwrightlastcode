import { ElementHandle, expect, Page, test } from '@playwright/test';
import { ChatAppPage } from '../pages/chatsPage';

export class ChatAttachmentHelper {
  static page: any;
  public static init(page: Page): void {
    ChatAttachmentHelper.page = page;
  }
  public static async isAttachmentButtonVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying the chat attachment page is loaded', async () => {
        const attachmentButton = await ChatAttachmentHelper.page?.waitForSelector('[data-testid="Add Media Attachment"]');
        await attachmentButton.isVisible();
    });

  }

  public static async attachFile(filePath: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Attaching a file', async () => {
        const fileInput = await ChatAttachmentHelper.getFileInputElement();
        if (fileInput) {
          await fileInput.setInputFiles(filePath);
          await ChatAttachmentHelper.page?.waitForTimeout(5000);
          console.log('Attempted to upload a single file.');
        }
    });
  }

  public static async getFileInputElement(): Promise<ElementHandle<HTMLInputElement> | null> {
    const element = await ChatAttachmentHelper.page?.$('input[type="file"]');
    return element as ElementHandle<HTMLInputElement> | null;
  }

  public static async sendButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking the send button', async () => {
        await ChatAttachmentHelper.page?.waitForTimeout(20000);
      const sendButton = await ChatAttachmentHelper.page?.waitForSelector('[aria-label="Send message"]');
      await sendButton.click();
    });
  }

  public static async unsupportedFile(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying the unsupported file message', async () => {
        const unsupportedFileMessage = await ChatAttachmentHelper.page?.locator('span', { hasText: 'File unsupported' });
        await unsupportedFileMessage.isVisible();
    });
  }
    public static async MaximumFilesLimitError(options?: { stepInfo?: string }): Promise<void> {
        await test.step(options?.stepInfo || 'Verifying the maximum files limit error message', async () => {
            const maximumFilesLimitError = await ChatAttachmentHelper.page?.locator('span', { hasText: 'Maximum attachments limit reached' });
            await maximumFilesLimitError.isVisible();
        });



  }
  public static async sendSameFileMultipleTimes(filePath: string, numberOfFiles: number, options?: { stepInfo?: string }): Promise<void> {
    try {
      const fileInput = await ChatAttachmentHelper.getFileInputElement();
      if (!fileInput) throw new Error('Hidden file input element not found.');
  
      // Loop through and attach the file multiple times
      for (let i = 0; i < numberOfFiles; i++) {
        await fileInput.setInputFiles(filePath); // Attach the same file each time
        console.log(`Attempted to upload file #${i + 1} of ${numberOfFiles}`);
        
        // Optionally, wait between file uploads to avoid rapid succession
        await ChatAttachmentHelper.page?.waitForTimeout(500); 
        
        // Clear the input before re-uploading (reset for next iteration)
        await fileInput.setInputFiles([]);
      }
  
      // Wait for a little while after uploading all files
      await ChatAttachmentHelper.page?.waitForTimeout(5000);
    } catch (error) {
      console.error('Error during the file attachment process:', error);
      throw error;
    }
  }

  public static async sendFileExceedLimit(filePath: string, numberOfFiles: number, options?: { stepInfo?: string }): Promise<void> {
    try {
      const fileInput = await ChatAttachmentHelper.getFileInputElement();
      if (!fileInput) throw new Error('Hidden file input element not found.');
  
      // Loop through and attach the file multiple times
      for (let i = 0; i < numberOfFiles; i++) {
        await fileInput.setInputFiles(filePath); // Attach the same file each time
        console.log(`Attempted to upload file #${i + 1} of ${numberOfFiles}`);
        
        // Optionally, wait between file uploads to avoid rapid succession
        await ChatAttachmentHelper.page?.waitForTimeout(500); 
        
        // Clear the input before re-uploading (reset for next iteration)
        await fileInput.setInputFiles([]);
      }
  
      // Wait for a little while after uploading all files
      await ChatAttachmentHelper.page?.waitForTimeout(5000);
        await ChatAttachmentHelper.MaximumFilesLimitError(options);
    } catch (error) {
      console.error('Error during the file attachment process:', error);
      throw error;
    }
  }

  public static async viewImageAttachment(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verifying the image attachment', async () => {
        await ChatAttachmentHelper.page?.waitForTimeout(5000);
        const imageAttachment = await ChatAttachmentHelper.page?.locator('[aria-label="Image preview"]').last();
        await imageAttachment.isVisible();
        await imageAttachment.click();
    });
  }

  public static async deleteAttachmentInEditor(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Deleting the attachment', async () => {
        const deleteAttachmentButton = await ChatAttachmentHelper.page?.getByTestId('delete-button').first();
        await deleteAttachmentButton.isVisible();
        await deleteAttachmentButton.click();
        await ChatAttachmentHelper.page?.waitForTimeout(5000);
    });
  }
    }