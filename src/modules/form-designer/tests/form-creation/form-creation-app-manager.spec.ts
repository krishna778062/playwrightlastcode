import { test } from '@form-designer-fixtures/formFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FormSuiteTags } from '../../constants/formTestTags';
import { FormCreationPage } from '../../ui/pages/formCreation/FormPage';
test.describe(
  `form basic functionality by Application Manager`,
  {
    tag: [FormSuiteTags.FORM_CREATION],
  },
  () => {
    test.beforeEach(async ({ appManagerPage }) => {
      const formCreationPage = new FormCreationPage(appManagerPage);
      await formCreationPage.loadPage();
      await formCreationPage.verifyThePageIsLoaded();
    });

    test(
      'verfiy app manager able to save form in draft',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verfiy app manager able to save form in draft',
          zephyrTestId: 'ELF-518',
          storyId: 'ELF-518',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('title & description');
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.clickOnSaveDraftButton();
        await formCreationPage.enterFormName('Automation Form ');
        await formCreationPage.clickOnSaveButton();
        await formCreationPage.verifyDraftToastMessageIsVisible();
      }
    );

    test(
      'verify App Manager should be able to view the Homepage on clicking Forms tab',
      {
        tag: [TestPriority.P3, TestGroupType.REGRESSION, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
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
    test(
      'blocks Intro Section: Verify the presence of the Intro section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager should be able to view the Homepage on clicking Forms tab',
          zephyrTestId: 'ELF-9',
          storyId: 'ELF-9',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.verifyTitleAndDescriptionSectionIsVisible();
        await formCreationPage.verifyHeadingSectionIsVisible();
        await formCreationPage.verifyParagraphSectionIsVisible();
      }
    );

    test(
      'blocks Text Input Section: Verify the presence of the Input field section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Blocks Content Section: Verify the presence of the Content section of the Blocks tab',
          zephyrTestId: 'ELF-10',
          storyId: 'ELF-10',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.verifyShortTextSectionIsVisible();
        await formCreationPage.verifyLongTextSectionIsVisible();
        await formCreationPage.verifyNumberSectionIsVisible();
        await formCreationPage.verifyEmailSectionIsVisible();
        await formCreationPage.verifyDateAndTimeSectionIsVisible();
        await formCreationPage.verifyAddressSectionIsVisible();
        await formCreationPage.verifyLegalSectionIsVisible();
      }
    );
    test(
      'blocks Multiple Choice Section: Verify the presence of the Multiple Choice field section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Blocks Multiple Choice Section: Verify the presence of the Multiple Choice field section of the Blocks tab',
          zephyrTestId: 'ELF-11',
          storyId: 'ELF-11',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.verifyMultiSelectSectionIsVisible();
        await formCreationPage.verifySingleSelectSectionIsVisible();
        await formCreationPage.verifyDropDownSectionIsVisible();
      }
    );
    test(
      'block Media Section: Verify the presence of the Media field section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Block Media Section: Verify the presence of the Media field section of the Blocks tab',
          zephyrTestId: 'ELF-12',
          storyId: 'ELF-12',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.verifyFileUploadSectionIsVisible();
        await formCreationPage.verifyImageSectionIsVisible();
      }
    );
    test(
      'blocks Rating and opinion fields Section: Verify the presence of the Rating and opinion fields section of the Blocks tab',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Blocks Rating and opinion fields Section: Verify the presence of the Rating and opinion fields section of the Blocks tab',
          zephyrTestId: 'ELF-13',
          storyId: 'ELF-13',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.verifyRatingSectionIsVisible();
        await formCreationPage.verifyOpinionSectionIsVisible();
      }
    );

    test(
      'title and Description: Drag and Drop Title and Description component into the Canvas and verify the presence of the component',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Title and Description: Drag and Drop Title and Description component into the Canvas and verify the presence of the component',
          zephyrTestId: 'ELF-18',
          storyId: 'ELF-18',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Title & description');
        await formCreationPage.addHeadingIntoTitleAndDescription('Automation Test - Title & description Heading');
        await formCreationPage.addDescriptionIntoTitleAndDescription(
          'Automation Test - Title & description Description'
        );
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedTitleAndDescriptionIsVisible();
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyTitleAndDescriptionComponentIsDeleted();
        // await formCreationPage.clickOnSettingsIcon();
      }
    );
    test(
      'short Text: Drag and Drop Short Text component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Short Text: Drag and Drop Short Text component into the Canvas',
          zephyrTestId: 'ELF-22',
          storyId: 'ELF-22',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.addHeadingIntoComponent('Short Text', 'Automation Test - Short Text Description');
        // await formCreationPage.addDescriptionIntoComponent("Short Text","Automation Test - Short Text Description");
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Short Text');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Short Text');
      }
    );

    test(
      'long Text: Drag and Drop Long Text component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Long Text: Drag and Drop Long Text component into the Canvas',
          zephyrTestId: 'ELF-23',
          storyId: 'ELF-23',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Long text');
        await formCreationPage.addHeadingIntoComponent('Long Text', 'Automation Test - Long Text Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Long Text');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Long Text');
      }
    );

    test(
      'number: Drag and Drop Number component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Number: Drag and Drop Number component into the Canvas',
          zephyrTestId: 'ELF-24',
          storyId: 'ELF-24',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Number');
        await formCreationPage.addHeadingIntoComponent('Number', 'Automation Test - Number Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Number');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Number');
      }
    );

    test(
      'email: Drag and Drop Email component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Email: Drag and Drop Email component into the Canvas',
          zephyrTestId: 'ELF-25',
          storyId: 'ELF-25',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Email');
        await formCreationPage.addHeadingIntoComponent('Email', 'Automation Test - Email Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Email');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Email');
      }
    );
    test(
      'date and Time: Drag and Drop Date and Time component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Date and Time: Drag and Drop Date and Time component into the Canvas',
          zephyrTestId: 'ELF-26',
          storyId: 'ELF-26',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Date and time');
        await formCreationPage.addHeadingIntoComponent('Date and Time', 'Automation Test - Date and Time Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Date and Time');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Date and Time');
      }
    );
    test(
      'address: Drag and Drop Address component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Address: Drag and Drop Address component into the Canvas',
          zephyrTestId: 'ELF-27',
          storyId: 'ELF-27',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Address');
        await formCreationPage.addHeadingIntoComponent('Address', 'Automation Test - Address Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Address');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Address');
      }
    );
    test(
      'legal: Drag and Drop Legal component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Legal: Drag and Drop Legal component into the Canvas',
          zephyrTestId: 'ELF-28',
          storyId: 'ELF-28',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Legal');
        await formCreationPage.addHeadingIntoComponent('Legal', 'Automation Test - Legal Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Legal');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Legal');
      }
    );
    test(
      'multi Select: Drag and Drop Multi Select component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Multi Select: Drag and Drop Multi Select component into the Canvas',
          zephyrTestId: 'ELF-29',
          storyId: 'ELF-29',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('multi select');
        await formCreationPage.addHeadingIntoComponent('Multi select', 'Automation Test - Multi Select Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Multi select');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Multi select');
      }
    );
    test(
      'single Select: Drag and Drop Single Select component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Single Select: Drag and Drop Single Select component into the Canvas',
          zephyrTestId: 'ELF-30',
          storyId: 'ELF-30',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('single select');
        await formCreationPage.addHeadingIntoComponent('Single select', 'Automation Test - Single Select Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Single select');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Single select');
      }
    );
    test(
      'dropdown: Drag and Drop Dropdown component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Dropdown: Drag and Drop Dropdown component into the Canvas',
          zephyrTestId: 'ELF-31',
          storyId: 'ELF-31',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('dropdown');
        await formCreationPage.addHeadingIntoComponent('Dropdown', 'Automation Test - Dropdown Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Dropdown');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Dropdown');
      }
    );
    test(
      'file Upload: Drag and Drop File Upload component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'File Upload: Drag and Drop File Upload component into the Canvas',
          zephyrTestId: 'ELF-33',
          storyId: 'ELF-33',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('File upload');
        await formCreationPage.addHeadingIntoComponent('File Upload', 'Automation Test - File Upload Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('File Upload');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('File Upload');
      }
    );
    test(
      'image: Drag and Drop Image component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Image: Drag and Drop Image component into the Canvas',
          zephyrTestId: 'ELF-34',
          storyId: 'ELF-34',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Image');
        await formCreationPage.addHeadingIntoComponent('Image', 'Automation Test - Image Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Image');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Image');
      }
    );
    test(
      'rating: Drag and Drop Rating component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Rating: Drag and Drop Rating component into the Canvas',
          zephyrTestId: 'ELF-35',
          storyId: 'ELF-35',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Rating');
        await formCreationPage.addHeadingIntoComponent('Rating', 'Automation Test - Rating Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Rating');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Rating');
      }
    );
    test(
      'opinion: Drag and Drop Opinion component into the Canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, FormSuiteTags.FORM_CREATION],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Opinion: Drag and Drop Opinion component into the Canvas',
          zephyrTestId: 'ELF-36',
          storyId: 'ELF-36',
        });
        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.verifyBlockSectionIsVisible();
        await formCreationPage.dragAndDropElement('Opinion');
        await formCreationPage.addHeadingIntoComponent('Opinion', 'Automation Test - Opinion Description');
        await formCreationPage.clickOnCopyIcon();
        await formCreationPage.verifyCopiedComponentIsVisible('Opinion');
        await formCreationPage.clickOnDeleteIcon();
        await formCreationPage.verifyComponentIsDeleted('Opinion');
      }
    );
  }
);
