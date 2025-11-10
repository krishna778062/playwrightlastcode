import { FormCreationPage } from '@form-designer/ui/pages/formCreation/formPage';
import { formTestFixture } from '@form-designer-fixtures/formFixture';

import { tagTest } from '@core/utils/testDecorator';

import { FormSuiteTags } from '../../constants/formTestTags';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';

formTestFixture.describe(
  `form basic functionality by Application Manager`,
  {
    tag: [FormSuiteTags.FORM_CREATION],
  },
  () => {
    formTestFixture.beforeEach(async ({ appManagerPage }) => {
      const formCreationPage = new FormCreationPage(appManagerPage);
      await formCreationPage.loadPage();
      await formCreationPage.verifyThePageIsLoaded();
    });

    formTestFixture(
      'verfiy app manager able to save form in draft',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Verfiy app manager able to save form in draft',
          zephyrTestId: 'ELF-518',
          storyId: 'ELF-518',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Tile & description');
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.clickOnSaveDraftButton();
        await formCreationPage.enterFormName('Automation Form ');
        await formCreationPage.clickOnSaveButton();
        await formCreationPage.verifyDraftToastMessageIsVisible();
      }
    );

    formTestFixture(
      'verify App Manager should be able to view the Homepage on clicking Forms tab',
      {
        tag: [TestPriority.P3, TestGroupType.REGRESSION],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Verify App Manager should be able to view the Homepage on clicking Forms tab',
          zephyrTestId: 'ELF-1',
          storyId: 'ELF-1',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);

        await formCreationPage.verifyTabOnFormDashboard('Draft');
        await formCreationPage.verifyTabOnFormDashboard('Published');
        await formCreationPage.verifyTabOnFormDashboard('Archived');
        await formCreationPage.verifyTabOnFormDashboard('All');
      }
    );
    formTestFixture(
      'blocks Intro Section: Verify the presence of the Intro section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Verify App Manager should be able to view the Homepage on clicking Forms tab',
          zephyrTestId: 'ELF-9',
          storyId: 'ELF-9',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.veriftTitleAndDescriptionSectionIsVisible();
        await formCreationPage.verifyHeadingSectionIsVisible();
        await formCreationPage.verifyParagraphSectionIsVisible();
      }
    );

    formTestFixture(
      'blocks Text Input Section: Verify the presence of the Input field section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Blocks Content Section: Verify the presence of the Content section of the Blocks tab',
          zephyrTestId: 'ELF-10',
          storyId: 'ELF-10',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.verifyShortTextSectionIsVisible();
        await formCreationPage.verifyLongTextSectionIsVisible();
        await formCreationPage.verifyNumberSectionIsVisible();
        await formCreationPage.verifyEmailSectionIsVisible();
        await formCreationPage.verifyDateAndTimeSectionIsVisible();
        await formCreationPage.verifyAddressSectionIsVisible();
        await formCreationPage.verifyLegalSectionIsVisible();
      }
    );
    formTestFixture(
      'blocks Multiple Choice Section: Verify the presence of the Multiple Choice field section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description:
            'Blocks Multiple Choice Section: Verify the presence of the Multiple Choice field section of the Blocks tab',
          zephyrTestId: 'ELF-11',
          storyId: 'ELF-11',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.verifyMultiSelectSectionIsVisible();
        await formCreationPage.verifySingleSelectSectionIsVisible();
        await formCreationPage.verifyDropDownSectionIsVisible();
      }
    );
    formTestFixture(
      'block Media Section: Verify the presence of the Media field section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Block Media Section: Verify the presence of the Media field section of the Blocks tab',
          zephyrTestId: 'ELF-12',
          storyId: 'ELF-12',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.verifyFileUploadSectionIsVisible();
        await formCreationPage.verifyImageSectionIsVisible();
      }
    );
    formTestFixture(
      'blocks Rating and opinion fields Section: Verify the presence of the Rating and opinion fields section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description:
            'Blocks Rating and opinion fields Section: Verify the presence of the Rating and opinion fields section of the Blocks tab',
          zephyrTestId: 'ELF-13',
          storyId: 'ELF-13',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.verifyRatingSectionIsVisible();
        await formCreationPage.verifyOpinionSectionIsVisible();
      }
    );

    formTestFixture(
      'title and Description: Drag and Drop Title and Description component into the Canvas and verify the presence of the component',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description:
            'Title and Description: Drag and Drop Title and Description component into the Canvas and verify the presence of the component',
          zephyrTestId: 'ELF-18',
          storyId: 'ELF-18',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Title & description');
        await formCreationPage.addHeadingIntoTitleAndDescription('Automation Test - Title & description Heading');
        await formCreationPage.addDescriptionIntoTitleAndDescription(
          'Automation Test - Title & description Description'
        );
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verfiyCopiedTitleAndDescriptionIsVisible();
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyTitleAndDescriptionComponentIsDeleted();
        // await formCreationPage.clickOnSettingsIcon();
      }
    );
    formTestFixture(
      'short Text: Drag and Drop Short Text component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Short Text: Drag and Drop Short Text component into the Canvas',
          zephyrTestId: 'ELF-22',
          storyId: 'ELF-22',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.addHeadingIntoComponent('Short Text', 'Automation Test - Short Text Description');
        // await formCreationPage.addDescriptionIntoComponent("Short Text","Automation Test - Short Text Description");
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verfiyCopiedComponentIsVisible('Short Text');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Short Text');
      }
    );

    formTestFixture(
      'long Text: Drag and Drop Long Text component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        tagTest(formTestFixture.info(), {
          description: 'Long Text: Drag and Drop Long Text component into the Canvas',
          zephyrTestId: 'ELF-23',
          storyId: 'ELF-23',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verfiyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Long text');
        await formCreationPage.addHeadingIntoComponent('Long Text', 'Automation Test - Long Text Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verfiyCopiedComponentIsVisible('Long Text');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Long Text');
      }
    );
  }
);
