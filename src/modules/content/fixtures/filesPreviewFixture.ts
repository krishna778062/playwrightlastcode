import {
  FilesPreviewDeleteModal,
  FilesPreviewIcon,
  FilesPreviewMoreActionsOption,
  FilesPreviewToasterMessage,
} from '../constants/filesPreviewEnums';

import { contentTestFixture } from './contentFixture';

/*
 *  This fixture to be used only if the Final End to End testing is for the files preview modal component specifically only.
 *  It extends the contentTestFixture to include the filesPreviewModalComponent.
 * Use contentTestFixture for access to filesPreviewModalComponent.
 */
export const filesPreviewTestFixture = contentTestFixture.extend<{
  /*
   * To be used only if the current user have Delete permission.
   */
  _cleanupByDeletingTheFileFromFilesPreviewModal?: Promise<void>;
}>({
  _cleanupByDeletingTheFileFromFilesPreviewModal: [
    async ({ filesPreviewModalComponent }, use) => {
      await filesPreviewModalComponent.clickOnIcon(FilesPreviewIcon.More_actions);
      await filesPreviewModalComponent.clickOnShowMoreActionsOption(FilesPreviewMoreActionsOption.Delete);
      await filesPreviewModalComponent.confirmDeleteOrCancelFromDeleteFileModal(FilesPreviewDeleteModal.Delete);
      await filesPreviewModalComponent.verifyFilesPreviewToastMessage(
        FilesPreviewToasterMessage.DeletedFileSuccessfully
      );
      await use(undefined);
    },
    { scope: 'test' },
  ],
});
