import test, { Locator, Page } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { SURVEY_QUESTION_BANK } from '@/src/modules/employee-listening/test-data/surveyQuestions';
import { getAlternativeAudienceCheckbox, getExactAudienceCheckbox } from '@/src/modules/employee-listening/utils/polls';

export class SurveyCreationPage extends BasePage {
  readonly manageFeaturesMenuItem: Locator;
  readonly surveysButton: Locator;
  readonly createSurveyMenuButton: Locator;
  readonly closeButton: Locator;
  readonly createSurveyButton: Locator;
  readonly allPurposeSurveyOption: Locator;
  readonly createButton: Locator;
  readonly surveyNameInput: Locator;
  readonly introDropdown: Locator;
  readonly thanksMessageDropdown: Locator;
  readonly formAddressDropdown: Locator;
  readonly sendDateRadio: Locator;
  readonly sendDateButton: Locator;
  readonly calendarGridCells: Locator;
  readonly nextButton: Locator;
  readonly configureSurveyNextButton: Locator;
  readonly defaultIntroOption: Locator;
  readonly defaultThanksMessageOption: Locator;
  readonly createYourOwnButton: Locator;
  readonly freeTextQuestionType: Locator;
  readonly questionTitleInput: Locator;
  readonly addButton: Locator;
  readonly addQuestionNextButton: Locator;
  readonly scheduleSurveyButton: Locator;
  readonly surveyScheduledMessage: Locator;
  readonly anyQuestionButton: Locator;
  readonly browseAudiencesButton: Locator;
  readonly allOrganizationSwitch: Locator;
  readonly doneButton: Locator;
  readonly audienceText: Locator;
  readonly searchTextbox: Locator;
  readonly customIntroOption: Locator;
  readonly customThanksMessageOption: Locator;
  readonly contentEditor: Locator;
  readonly customParticipationRadio: Locator;
  readonly participationWindowDropdown: Locator;
  readonly browseQuestionBankButton: Locator;
  readonly questionBankDropdownArrow: Locator;
  readonly businessAgilityMenuItem: Locator;
  readonly businessAgilityQuestionCheckbox: Locator;
  readonly browseSitesButton: Locator;
  readonly siteSearchTextbox: Locator;
  readonly siteText: Locator;
  readonly siteCheckbox: Locator;
  readonly multipleChoiceTab: Locator;
  readonly scaleQuestionType: Locator;
  readonly emojiAnswerScale: Locator;
  readonly themeDropdown: Locator;
  readonly lastResortDateCell: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly backToSurveysLink: Locator;
  readonly firstSurveyManageButton: Locator;
  readonly secondSurveyManageButton: Locator;
  readonly configureOption: Locator;
  readonly validationSelectors: string[];
  readonly addNewSectionButton: Locator;
  readonly sectionNameInput: Locator;
  readonly sectionNumberButton: (sectionNumber: number) => Locator;
  readonly multipleChoiceQuestionType: Locator;
  readonly sentimentAnswerScale: Locator;
  readonly awarenessAnswerScale: Locator;
  readonly previewLabel: Locator;
  readonly previewWindow: Locator;
  readonly sectionRegion: (sectionNumber: number) => Locator;
  readonly sectionInput: (sectionNumber: number) => Locator;
  readonly multipleChoiceRadio: Locator;
  readonly firstAnswerTextbox: Locator;
  readonly secondAnswerTextbox: Locator;
  readonly deleteFifthAnswerButton: Locator;
  readonly deleteFourthAnswerButton: Locator;
  readonly previewDialog: Locator;
  readonly duplicateOption: Locator;
  readonly completeOption: Locator;
  readonly completeButton: Locator;
  readonly resetButton: Locator;
  readonly typeFilter: Locator;
  readonly statusFilter: Locator;
  readonly completedTag: Locator;
  readonly alternativeQuestionLocators: Locator[];
  readonly mcqThemeDropdown: Locator;
  readonly sectionCreateButton: (sectionNumber: number) => Locator;
  readonly notYetRadio: Locator;
  readonly addNewRecipientsText: Locator;
  readonly configurationDetailsContainer: Locator;
  readonly searchSurveysTextbox: Locator;
  readonly browseQuestionBankButtonAlt1: Locator;
  readonly browseQuestionBankButtonAlt2: Locator;
  readonly browseQuestionBankButtonAlt3: Locator;
  readonly browseQuestionBankButtonAlt4: Locator;
  readonly browseQuestionBankButtonAlt5: Locator;
  readonly completedTagAlt1: Locator;
  readonly completedTagAlt2: Locator;
  readonly completedTagAlt3: Locator;
  readonly previewNextSectionButtons: Locator[];

  readonly debugQuestionButtonLocators: Locator[];

  readonly draftAlertLocator: Locator;

  readonly recipientsButton: Locator;
  readonly noText: Locator;
  readonly introText: Locator;
  readonly thanksText: Locator;
  readonly notScheduledText: Locator;
  readonly participationWindowText: Locator;
  readonly freeTextQuestionText: Locator;

  readonly previewSectionLocators: ((section: string) => Locator)[] = [
    (section: string) => this.previewDialog.getByText(section, { exact: true }),
    (section: string) => this.previewDialog.getByText(section),
    (section: string) => this.previewDialog.locator(`text="${section}"`),
    (section: string) =>
      this.previewDialog.locator(`h1:has-text("${section}"), h2:has-text("${section}"), h3:has-text("${section}")`),
  ];

  readonly previewQuestionLocators: ((question: string) => Locator)[] = [
    (question: string) => this.previewDialog.getByText(question, { exact: true }),
    (question: string) => this.previewDialog.getByText(question),
    (question: string) => this.previewDialog.locator(`text="${question}"`),
    (question: string) =>
      this.previewDialog.locator(`[data-testid*="question"]:has-text("${question.replace('*', '')}")`),
    (question: string) => this.previewDialog.getByText(question.replace('*', '')),
  ];

  readonly getMultipleChoiceQuestionByIndex = (index: number): Locator => {
    const zeroBasedIndex = index - 1;
    return this.page.getByRole('checkbox').nth(zeroBasedIndex);
  };

  readonly getDynamicQuestionButton = (namePattern: string): Locator => {
    const exactMatch = this.page.getByRole('button', { name: namePattern });
    const baseNamePattern = namePattern.replace(/-\d+\*$/, '*');
    if (baseNamePattern !== namePattern) {
      return exactMatch.or(this.page.getByRole('button', { name: baseNamePattern }));
    }
    return exactMatch;
  };

  readonly getQuestionByText = (questionTitle: string): Locator[] => {
    const baseTitle = questionTitle.replace(/-\d+$/, '');
    const locators = [
      this.page.getByRole('button', { name: new RegExp(questionTitle, 'i') }),
      this.page.getByRole('button').filter({ hasText: new RegExp(questionTitle, 'i') }),
      this.page.locator('button').filter({ hasText: new RegExp(questionTitle, 'i') }),
      this.page.locator(`[data-testid*="question"]:has-text("${questionTitle}")`),
      this.page.locator(`button[aria-label*="${questionTitle}"]`),
      this.page.getByText(questionTitle),
      this.page.locator(`.question-item:has-text("${questionTitle}")`),
    ];
    if (baseTitle !== questionTitle) {
      locators.push(
        this.page.getByRole('button', { name: new RegExp(baseTitle, 'i') }),
        this.page.getByRole('button').filter({ hasText: new RegExp(baseTitle, 'i') }),
        this.page.locator('button').filter({ hasText: new RegExp(baseTitle, 'i') }),
        this.page.locator(`[data-testid*="question"]:has-text("${baseTitle}")`),
        this.page.locator(`button[aria-label*="${baseTitle}"]`),
        this.page.getByText(baseTitle),
        this.page.locator(`.question-item:has-text("${baseTitle}")`)
      );
    }
    return locators;
  };

  readonly getFallbackDateCell = (dateString: string): Locator => {
    return this.page.getByRole('gridcell', { name: dateString, exact: true });
  };

  getQuestionButtonByText(questionText: string): Locator {
    return this.page.getByRole('button', { name: questionText });
  }

  async waitForQuestionButtonVisible(questionText: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.getByRole('button', { name: questionText }), {
      assertionMessage: `Question button '${questionText}' should be visible`,
      timeout: TIMEOUTS.LONG,
    });
  }

  readonly introEditorLocator: Locator;
  readonly thanksEditorLocator: Locator;
  readonly contentEditorLocator: Locator;
  readonly editorsLocator: Locator;

  constructor(page: Page) {
    super(page, '/home');
    this.manageFeaturesMenuItem = this.page.getByRole('menuitem', { name: 'Manage features', exact: true });
    this.surveysButton = this.page.getByRole('button', { name: 'Surveys' });
    this.createSurveyMenuButton = this.page.getByRole('button', { name: 'Create survey' });
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
    this.createSurveyButton = this.page.getByRole('button', { name: 'Create Survey' });
    this.allPurposeSurveyOption = this.page.getByRole('radio', { name: 'All-purpose A survey to' });
    this.createButton = this.page.getByRole('button', { name: 'Create' });
    this.surveyNameInput = this.page
      .getByRole('textbox', { name: 'Survey name' })
      .or(this.page.getByPlaceholder('Survey name'));
    this.introDropdown = this.page.getByTestId('field-Introduction message');
    this.thanksMessageDropdown = this.page.getByTestId('field-Thank you message');
    this.formAddressDropdown = this.page.getByTestId('field-From address').getByTestId('SelectInput');
    this.sendDateRadio = this.page.getByRole('radio', { name: 'Schedule date and time' });
    this.sendDateButton = this.page.getByRole('button', { name: 'Send date' });
    this.calendarGridCells = this.page.getByRole('gridcell');
    this.nextButton = this.page.getByRole('button', { name: 'Next' });
    this.configureSurveyNextButton = this.page
      .getByRole('button', { name: 'Next' })
      .filter({
        hasText: 'Configure Survey',
      })
      .or(this.nextButton);
    this.defaultIntroOption = this.page
      .getByTestId('field-Introduction message')
      .getByRole('radio', { name: 'Default' });
    this.defaultThanksMessageOption = this.page
      .getByTestId('field-Thank you message')
      .getByRole('radio', { name: 'Default' });
    this.createYourOwnButton = this.page.getByRole('button', { name: 'Create your own' });
    this.freeTextQuestionType = this.page.getByRole('radio', { name: 'Free text Open text area for' });
    this.questionTitleInput = this.page.getByRole('textbox', { name: 'Enter your question' });
    this.addButton = this.page
      .getByRole('button', { name: 'Add', exact: true })
      .and(this.page.locator('button:not([aria-label*="answer"])'));
    this.addQuestionNextButton = this.page
      .getByRole('button', { name: 'Next' })
      .filter({
        hasText: /Add question/i,
      })
      .or(this.nextButton);
    this.scheduleSurveyButton = this.page.getByRole('button', { name: 'Schedule Survey' });
    this.surveyScheduledMessage = this.page
      .getByText('Survey scheduled')
      .or(this.page.locator('text="Survey scheduled"'));
    this.anyQuestionButton = this.page.getByRole('button').filter({ hasText: /Free|Multiple|Scale/i });
    this.browseAudiencesButton = this.page.getByRole('button', { name: 'Browse' });
    this.allOrganizationSwitch = this.page.getByRole('switch', { name: 'All organization' });
    this.doneButton = this.page.getByRole('button', { name: 'Done' });
    this.audienceText = this.page.getByText('Audience', { exact: true });
    this.searchTextbox = this.page.getByRole('textbox', { name: 'Search…' });
    this.customIntroOption = this.page.getByTestId('field-Introduction message').getByRole('radio', { name: 'Custom' });
    this.customThanksMessageOption = this.page
      .getByTestId('field-Thank you message')
      .getByRole('radio', { name: 'Custom' });
    this.contentEditor = this.page.getByRole('textbox', { name: 'You are in the content editor' });
    this.customParticipationRadio = this.page
      .getByTestId('field-Participation window')
      .getByRole('radio', { name: 'Custom' });
    this.participationWindowDropdown = this.page.getByLabel('Participation window', { exact: true });
    this.browseQuestionBankButton = this.page.getByRole('button', { name: 'Browse question bank' });
    this.questionBankDropdownArrow = this.page.locator(
      '.DropdownIndicator-module__arrow__HzctA > .Icon-module__icon__NKvko > svg'
    );
    this.businessAgilityMenuItem = this.page.getByRole('menuitem', { name: 'Business agility' });
    this.businessAgilityQuestionCheckbox = this.page.getByRole('checkbox', {
      name: 'Business agility Do you feel proud to work here? Scale (Strongly disagree to',
    });
    this.browseSitesButton = this.page
      .getByRole('button', { name: 'Browse Sites' })
      .or(this.page.getByRole('button', { name: 'Browse' }));
    this.siteSearchTextbox = this.page
      .getByRole('textbox', { name: 'Search sites' })
      .or(this.page.getByRole('textbox', { name: 'Search…' }));
    this.siteText = this.page.getByText('Sites', { exact: true });
    this.siteCheckbox = this.page.getByLabel('EL-Site').getByRole('checkbox');
    this.multipleChoiceTab = this.page
      .locator('div')
      .filter({ hasText: /^Multiple choice$/ })
      .nth(1);
    this.scaleQuestionType = this.page.getByRole('radio', { name: 'Scale Answers on a pre-' });
    this.emojiAnswerScale = this.page.getByRole('radio', { name: 'Emoji 😩 to 😃 Help image' });
    this.themeDropdown = this.page.getByTestId('SelectInput');
    this.lastResortDateCell = this.page.getByRole('gridcell', { name: '18', exact: true });
    this.deleteButton = this.page.getByRole('menuitem', { name: 'Delete' });
    this.confirmDeleteButton = this.page
      .getByRole('button', { name: 'Delete' })
      .or(this.page.getByRole('button', { name: 'Confirm' }));
    this.backToSurveysLink = this.page
      .getByRole('link', { name: 'Back to surveys' })
      .or(this.page.getByRole('link', { name: 'Back' }))
      .or(this.page.getByText('Back to surveys'))
      .or(this.page.locator('a:has-text("Back")'))
      .or(this.page.locator('[data-testid*="back"]'));
    this.firstSurveyManageButton = this.page.getByRole('button', { name: 'manage survey' }).first();
    this.secondSurveyManageButton = this.page.getByRole('button', { name: 'manage survey' }).nth(1);
    this.configureOption = this.page
      .locator('[role="menuitem"]:has-text("Configure")')
      .or(this.page.getByRole('menuitem', { name: 'Configure' }))
      .or(this.page.locator('a[role="menuitem"]:has-text("Configure")'))
      .or(this.page.locator('button:has-text("Configure")'))
      .or(this.page.getByText('Configure').and(this.page.locator('[role="menuitem"], button, a')));
    this.validationSelectors = [
      '[role="alert"]',
      '.error',
      '.warning',
      '.validation-message',
      '[data-testid*="error"]',
      '[data-testid*="validation"]',
      'text*="required"',
      'text*="Please"',
    ];
    this.addNewSectionButton = this.page.getByRole('button', { name: 'Add new section' });
    this.sectionNameInput = this.page.getByPlaceholder('Title…');
    this.sectionNumberButton = (sectionNumber: number) =>
      this.page
        .getByRole('tab', { name: `${sectionNumber}` })
        .or(this.page.locator(`[role="tablist"] button:has-text("${sectionNumber}")`))
        .or(this.page.locator(`[data-testid="section-${sectionNumber}"]`))
        .or(this.page.locator(`button[aria-label*="section ${sectionNumber}"]`))
        .or(this.page.getByRole('button', { name: new RegExp(`^${sectionNumber}$`) }));
    this.multipleChoiceQuestionType = this.page.getByRole('radio', { name: 'Multiple Choice' });
    this.sentimentAnswerScale = this.page.getByRole('radio', { name: 'Sentiment' });
    this.awarenessAnswerScale = this.page.getByRole('radio', { name: 'Awareness' });
    this.previewLabel = this.page.getByRole('button', { name: 'Preview', exact: true });
    this.previewWindow = this.page.getByRole('dialog').getByText('Preview');
    this.sectionRegion = (sectionNumber: number) => this.page.getByRole('region', { name: `section ${sectionNumber}` });
    this.sectionInput = (sectionNumber: number) => this.sectionRegion(sectionNumber).getByPlaceholder('Title…');
    this.multipleChoiceRadio = this.page.getByRole('radio', { name: 'Multiple choice Choose from a' });
    this.firstAnswerTextbox = this.page.getByRole('textbox', { name: 'First question First answer' });
    this.secondAnswerTextbox = this.page.getByRole('textbox', { name: 'First question Second answer' });
    this.deleteFifthAnswerButton = this.page.getByRole('button', { name: 'delete First question Fifth' });
    this.deleteFourthAnswerButton = this.page.getByRole('button', { name: 'delete First question Fourth' });
    this.previewDialog = this.page.getByRole('dialog');
    this.duplicateOption = this.page.getByRole('menuitem', { name: 'Duplicate' });
    this.completeOption = this.page.getByRole('menuitem', { name: 'Complete' });
    this.completeButton = this.page.getByRole('button', { name: 'Complete' });
    this.resetButton = this.page.getByRole('button', { name: 'Reset' });
    this.typeFilter = this.page.getByTestId('type-filter').or(this.page.locator('[data-testid*="type"]'));
    this.statusFilter = this.page.getByTestId('status-filter').or(this.page.locator('[data-testid*="status"]'));
    this.completedTag = this.page.getByText('Completed').or(this.page.locator('[data-testid*="completed"]'));
    this.notYetRadio = this.page.getByRole('radio', { name: 'Not yet' });
    this.addNewRecipientsText = this.page.getByText('Add new recipients while');
    this.configurationDetailsContainer = this.page.locator(
      '.configuration-details, [data-testid*="config"], .preview-section'
    );
    this.alternativeQuestionLocators = [
      this.page.locator('[data-testid*="question"]'),
      this.page.locator('button[aria-label*="question"]'),
      this.page.locator('.question-item'),
      this.page.locator('button').filter({ hasText: /question/i }),
      this.page.getByRole('button').filter({ hasText: /Free|Multiple|Scale|Text|Choice/i }),
    ];
    this.mcqThemeDropdown = this.page.getByTestId('SelectInput');
    this.sectionCreateButton = (sectionNumber: number) =>
      this.sectionRegion(sectionNumber)
        .getByRole('button', { name: 'Create your own' })
        .or(this.page.locator(`[data-section="${sectionNumber}"] button:has-text("Create your own")`))
        .or(this.page.getByRole('button', { name: 'Create your own' }).nth(sectionNumber - 1));
    this.searchSurveysTextbox = this.page.getByRole('textbox', { name: 'Search surveys' });
    this.browseQuestionBankButtonAlt1 = this.page.getByRole('button', { name: /browse question bank/i });
    this.browseQuestionBankButtonAlt2 = this.page.getByText('Browse question bank', { exact: false });
    this.browseQuestionBankButtonAlt3 = this.page.locator('button:has-text("Browse question bank")');
    this.browseQuestionBankButtonAlt4 = this.page.locator('[data-testid*="browse-question-bank"]');
    this.browseQuestionBankButtonAlt5 = this.page.getByRole('button').filter({ hasText: /browse question/i });
    this.completedTagAlt1 = this.page.locator(
      '[data-testid*="completed"], [data-status="completed"], [class*="completed"]'
    );
    this.completedTagAlt2 = this.page.locator('td, div, span').filter({ hasText: 'Completed' });
    this.completedTagAlt3 = this.page.locator('tr, .survey-row, .list-item').filter({ hasText: 'Completed' });
    this.previewNextSectionButtons = [
      this.previewDialog.getByRole('button', { name: /next section/i }),
      this.previewDialog.getByRole('button', { name: /next/i }),
      this.previewDialog.getByRole('button', { name: /continue/i }),
      this.previewDialog.locator('button:has-text("Next")'),
      this.previewDialog.locator('[data-testid*="next"]'),
      this.previewDialog.locator('button[aria-label*="next"]'),
    ];
    this.debugQuestionButtonLocators = [
      this.page.getByRole('button'),
      this.page.locator('[data-testid*="question"]'),
      this.page.locator('button[aria-label*="question"]'),
      this.page.locator('.question-item'),
      this.page.locator('button').filter({ hasText: /question/i }),
      this.page.getByRole('button').filter({ hasText: /Free|Multiple|Scale|Text|Choice/i }),
    ];

    this.introEditorLocator = this.page.getByRole('textbox', { name: 'You are in the content editor' }).first();
    this.thanksEditorLocator = this.page.getByRole('textbox', { name: 'You are in the content editor' }).nth(1);
    this.contentEditorLocator = this.page.getByRole('textbox', { name: 'You are in the content editor' });
    this.editorsLocator = this.page.getByRole('textbox', { name: 'You are in the content editor' });

    this.draftAlertLocator = this.page.getByRole('alert').filter({ hasText: 'Survey draft was saved' });

    this.recipientsButton = this.page.getByRole('button', { name: '(all organization)' });
    this.noText = this.page.getByText('No').first();
    this.introText = this.page.getByText('As a valued employee, we');
    this.thanksText = this.page.getByText('We really appreciate your');
    this.notScheduledText = this.page.getByText('Not scheduled yet');
    this.participationWindowText = this.page.getByText('days');
    this.freeTextQuestionText = this.page.getByText('What could have been improved');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.createSurveyButton, {
      assertionMessage: 'Create Survey button should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async navigateToHome(): Promise<void> {
    await test.step('Navigate to home page', async () => {
      const envConfig = getEnvConfig();
      const homeUrl = `${envConfig.frontendBaseUrl}/home`;
      await this.page.goto(homeUrl);
    });
  }

  async clickManageFeaturesMenuItem(): Promise<void> {
    await test.step('Click Manage features menu item', async () => {
      await this.clickOnElement(this.manageFeaturesMenuItem, {
        stepInfo: 'Click Manage features menu item',
      });
    });
  }

  async clickSurveysButton(): Promise<void> {
    await test.step('Click Surveys button', async () => {
      await this.clickOnElement(this.surveysButton, {
        stepInfo: 'Click Surveys button',
      });
    });
  }

  async clickCreateSurveyMenuButton(): Promise<void> {
    await test.step('Click Create survey menu button', async () => {
      await this.clickOnElement(this.createSurveyMenuButton, {
        stepInfo: 'Click Create survey menu button',
      });
    });
  }

  async clickCloseButton(): Promise<void> {
    await test.step('Click Close button', async () => {
      await this.clickOnElement(this.closeButton, {
        stepInfo: 'Click Close button',
      });
    });
  }

  async navigateToSurveysViaMenu(): Promise<void> {
    await test.step('Navigate to Surveys via menu flow', async () => {
      await this.navigateToHome();
      await this.clickManageFeaturesMenuItem();
      await this.clickSurveysButton();
      await this.clickCreateSurveyMenuButton();
      await this.clickCloseButton();
    });
  }

  async clickCreateSurveyButton(): Promise<void> {
    await test.step('Click Create Survey button', async () => {
      await this.clickOnElement(this.createSurveyButton, {
        stepInfo: 'Click Create Survey button',
        timeout: TIMEOUTS.VERY_VERY_LONG,
      });
    });
  }

  async clickAllPurposeSurvey(): Promise<void> {
    await test.step('Click All-purpose survey radio button', async () => {
      await this.clickOnElement(this.allPurposeSurveyOption, {
        stepInfo: 'Click All-purpose survey radio button',
        timeout: TIMEOUTS.VERY_VERY_LONG,
      });
    });
  }

  async clickCreateButton(): Promise<void> {
    await test.step('Click Create button', async () => {
      await this.clickOnElement(this.createButton, {
        stepInfo: 'Click Create button',
        timeout: TIMEOUTS.VERY_VERY_LONG,
      });
      await this.verifier.verifyTheElementIsVisible(this.surveyNameInput, {
        assertionMessage: 'Survey name input should be visible after clicking Create button',
        timeout: TIMEOUTS.VERY_VERY_LONG,
      });
    });
  }

  async enterSurveyName(surveyName: string): Promise<void> {
    await test.step(`Enter survey name: ${surveyName}`, async () => {
      const timestamp = new Date()
        .toISOString()
        .split('-')
        .join('')
        .split(':')
        .join('')
        .split('.')
        .join('')
        .split('T')
        .join('')
        .split('Z')
        .join('');
      const uniqueSurveyName = `${surveyName} ${timestamp}`;
      await this.fillInElement(this.surveyNameInput, uniqueSurveyName, {
        stepInfo: `Enter survey name: ${uniqueSurveyName}`,
      });
    });
  }

  async selectAudiences(audienceNames: string[]): Promise<void> {
    await test.step(`Select desired audiences: ${audienceNames.join(', ')}`, async () => {
      await this.clickOnElement(this.browseAudiencesButton, {
        stepInfo: 'Click Browse button to open audience selection',
      });
      if (audienceNames.includes('All Employees')) {
        await this.clickOnElement(this.allOrganizationSwitch, {
          stepInfo: 'Select all employees',
        });
      } else {
        for (const audienceName of audienceNames) {
          await this.searchTextbox.fill(audienceName);
          await this.searchTextbox.press('Enter');
          let audienceCheckbox = getExactAudienceCheckbox(this.page, audienceName);
          if ((await audienceCheckbox.count()) !== 1) {
            audienceCheckbox = getAlternativeAudienceCheckbox(this.page, audienceName);
          }
          await this.clickOnElement(audienceCheckbox, {
            stepInfo: `Select audience: ${audienceName}`,
          });
        }
      }
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Confirm audience selection',
      });
      await this.clickOnElement(this.audienceText, {
        stepInfo: 'Finalize selection',
      });
    });
  }

  async selectDefaultFormAddress(): Promise<void> {
    await test.step('Select DEFAULT form address', async () => {
      await this.formAddressDropdown.selectOption('DEFAULT');
    });
  }

  async selectSendDate(): Promise<void> {
    await test.step('Select send date', async () => {
      await this.sendDateRadio.check();
      await this.clickOnElement(this.sendDateButton, {
        stepInfo: 'Click on Send date button',
      });
      await this.selectFirstAvailableDate();
    });
  }

  async selectCustomParticipationWindow(days: string): Promise<void> {
    await test.step(`Select participation window for ${days} days`, async () => {
      await this.clickOnElement(this.customParticipationRadio, {
        stepInfo: 'Click Custom participation radio button',
      });
      await this.verifier.verifyTheElementIsVisible(this.participationWindowDropdown, {
        assertionMessage: 'Participation window dropdown should be visible after selecting Custom',
        timeout: TIMEOUTS.MEDIUM,
      });
      const optionText = days === '1' ? '1 day' : `${days} days`;
      await this.participationWindowDropdown.selectOption({ label: optionText });
    });
  }

  async clickConfigureSurveyNextButton(): Promise<void> {
    await test.step('Click Next button on Configure Survey page', async () => {
      await this.clickOnElement(this.configureSurveyNextButton, {
        stepInfo: 'Click Next button on Configure Survey page',
      });
    });
  }

  async createFreeTextQuestion(questionTitle: string): Promise<void> {
    await test.step(`Create free text question: ${questionTitle}`, async () => {
      await this.clickCreateYourOwnButton();
      await this.selectFreeTextQuestionType();
      await this.enterQuestionTitle(questionTitle);
      await this.clickAddButton();
      await this.validateQuestionAddedPopup();
      await this.validateQuestionAddedSuccessfully(questionTitle);
    });
  }

  async clickCreateYourOwnButton(): Promise<void> {
    await test.step('Click Create your own button', async () => {
      await this.createYourOwnButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.createYourOwnButton, {
        stepInfo: 'Click Create your own button',
      });
    });
  }

  async selectFreeTextQuestionType(): Promise<void> {
    await test.step('Select Free Text question type', async () => {
      await this.clickOnElement(this.freeTextQuestionType, {
        stepInfo: 'Select Free Text question type radio button',
      });
    });
  }

  async enterQuestionTitle(questionTitle: string): Promise<void> {
    await test.step(`Enter question title: ${questionTitle}`, async () => {
      await this.fillInElement(this.questionTitleInput, questionTitle, {
        stepInfo: `Enter question title: ${questionTitle}`,
      });
    });
  }

  async clickAddButton(): Promise<void> {
    await test.step('Click Add button', async () => {
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Click Add button',
      });
    });
  }

  async validateQuestionAddedPopup(): Promise<void> {
    await test.step('Wait for question to be added to the list', async () => {
      await this.verifier.verifyTheElementIsVisible(this.anyQuestionButton.first(), {
        assertionMessage: 'At least one question should be visible in the list after adding',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async validateQuestionAddedSuccessfully(questionTitle: string): Promise<void> {
    await test.step(`Validate "${questionTitle}" added successfully`, async () => {
      const addedQuestionButton = this.getDynamicQuestionButton(`${questionTitle}*`);
      await this.verifier.verifyTheElementIsVisible(addedQuestionButton, {
        assertionMessage: `Question button "${questionTitle}" should be visible in the list`,
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  async clickAddQuestionNextButton(): Promise<void> {
    await test.step('Click Next button on Add question page', async () => {
      await this.clickOnElement(this.addQuestionNextButton, {
        stepInfo: 'Click Next button on Add question page',
      });
    });
  }

  async addBusinessAgilityScaleQuestionFromBank(): Promise<void> {
    await test.step('Add Business agility scale question from bank', async () => {
      await this.clickBrowseQuestionBankButton();
      await this.clickOnElement(this.questionBankDropdownArrow, {
        stepInfo: 'Click dropdown arrow to show question categories',
      });
      await this.clickOnElement(this.businessAgilityMenuItem, {
        stepInfo: 'Select Business agility category',
      });
      await this.clickOnElement(this.businessAgilityQuestionCheckbox, {
        stepInfo: 'Select Business agility question',
      });
      await this.clickDoneButton();
    });
  }

  async clickBrowseQuestionBankButton(): Promise<void> {
    await test.step('Click Browse question bank button', async () => {
      try {
        await this.verifier.verifyTheElementIsVisible(this.browseQuestionBankButton, {
          assertionMessage: 'Browse question bank button should be visible',
          timeout: TIMEOUTS.LONG,
        });
        if (await this.browseQuestionBankButton.isEnabled()) {
          await this.clickOnElement(this.browseQuestionBankButton, {
            stepInfo: 'Click Browse question bank button',
          });
          return;
        } else {
          console.warn('Browse question bank button is not enabled after visible.');
        }
      } catch (e) {
        console.warn('Browse question bank button not found or not visible with main locator. Trying alternatives.', e);
      }
      const altLocators = [
        this.browseQuestionBankButtonAlt1,
        this.browseQuestionBankButtonAlt2,
        this.browseQuestionBankButtonAlt3,
        this.browseQuestionBankButtonAlt4,
        this.browseQuestionBankButtonAlt5,
      ];
      for (const locator of altLocators) {
        try {
          await this.verifier.verifyTheElementIsVisible(locator, {
            assertionMessage: 'Browse question bank button (alternative) should be visible',
            timeout: TIMEOUTS.MEDIUM,
          });
          if (await locator.isEnabled()) {
            await this.clickOnElement(locator, {
              stepInfo: 'Click Browse question bank button (alternative)',
            });
            return;
          }
        } catch {
          continue;
        }
      }
      const allButtons = this.page.getByRole('button');
      const buttonCount = await allButtons.count();
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        const buttonName =
          (await button.getAttribute('aria-label')) || (await button.getAttribute('name')) || 'no-name';
        console.warn(`Button ${i}: text="${buttonText}", name="${buttonName}"`);
      }
      throw new Error('Could not find or click Browse question bank button using any locator strategy.');
    });
  }

  async clickDoneButton(): Promise<void> {
    await test.step('Click Done button', async () => {
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Click Done button',
      });
    });
  }

  async selectSites(siteNames: string[]): Promise<void> {
    await test.step(`Select desired sites: ${siteNames.join(', ')}`, async () => {
      await this.clickOnElement(this.browseSitesButton, {
        stepInfo: 'Click Browse Sites button to open site selection',
      });
      for (const siteName of siteNames) {
        await this.siteSearchTextbox.fill(siteName);
        await this.siteSearchTextbox.press('Enter');
        await this.clickOnElement(this.siteCheckbox, {
          stepInfo: `Select site: ${siteName}`,
        });
      }
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Click Done button to confirm site selection',
      });
      await this.verifier.verifyTheElementIsVisible(this.siteText, {
        assertionMessage: 'Verify site selection modal is closed and sites are selected',
        timeout: 10000,
      });
    });
  }

  async addMultipleChoiceQuestionFromBank(questionIndex: number = 1): Promise<void> {
    await test.step(`Add Multiple choice question from bank (index: ${questionIndex})`, async () => {
      await this.clickBrowseQuestionBankButton();
      await this.clickOnElement(this.multipleChoiceTab, {
        stepInfo: 'Click Multiple choice tab',
      });
      const questionCheckbox = this.getMultipleChoiceQuestionByIndex(questionIndex);
      await this.clickOnElement(questionCheckbox, {
        stepInfo: `Select multiple choice question at index ${questionIndex}`,
      });
      await this.clickDoneButton();
    });
  }

  async clickScheduleSurveyButton(): Promise<void> {
    await test.step('Click Schedule Survey button', async () => {
      await this.clickOnElement(this.scheduleSurveyButton, {
        stepInfo: 'Click Schedule Survey button',
      });
    });
  }

  async verifySurveyScheduledMessage(): Promise<void> {
    await test.step('Verify Survey scheduled message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.surveyScheduledMessage, {
        assertionMessage: 'Survey scheduled message should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickBackToSurveysLink(): Promise<void> {
    await test.step('Click Back to surveys link', async () => {
      await this.clickOnElement(this.backToSurveysLink, {
        stepInfo: 'Click Back to surveys link',
      });
    });
  }

  async clickFirstSurveyManageButton(): Promise<void> {
    await test.step('Click first survey manage button', async () => {
      await this.clickOnElement(this.firstSurveyManageButton, {
        stepInfo: 'Click first survey manage button in the list',
      });

      await this.deleteButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    });
  }

  async clickDeleteButton(): Promise<void> {
    await test.step('Click Delete button', async () => {
      await this.clickOnElement(this.deleteButton, {
        stepInfo: 'Click Delete button',
      });
    });
  }

  async clickConfirmDeleteButton(): Promise<void> {
    await test.step('Click Confirm Delete button', async () => {
      await this.clickOnElement(this.confirmDeleteButton, {
        stepInfo: 'Click Confirm Delete button',
      });
    });
  }

  async clickDuplicateOption(): Promise<void> {
    await test.step('Click Duplicate option', async () => {
      await this.clickOnElement(this.duplicateOption, {
        stepInfo: 'Click Duplicate option',
      });
    });
  }

  async clickCompleteOption(): Promise<void> {
    await test.step('Find and complete active All-purpose survey', async () => {
      await this.applyTypeFilter('All-purpose');
      await this.applyStatusFilter('Active');
      const manageSurveyButtons = this.page.getByRole('button', { name: 'manage survey' });
      await this.verifier.verifyTheElementIsVisible(manageSurveyButtons.first(), {
        assertionMessage: 'First manage survey button should be visible',
        timeout: TIMEOUTS.LONG,
      });
      await manageSurveyButtons.first().click();
      const completeButton = this.page.getByText('Complete', { exact: true });
      await this.verifier.verifyTheElementIsVisible(completeButton, {
        assertionMessage: 'Complete button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await completeButton.click();
    });
  }

  async clickCompleteButton(): Promise<void> {
    await test.step('Click Complete button in confirmation dialog', async () => {
      const confirmationStrategies = [
        () => this.page.getByRole('button', { name: 'Complete', exact: true }),
        () =>
          this.page
            .locator('div')
            .filter({ hasText: 'Complete surveyAre you sure' })
            .getByRole('button', { name: 'Complete' }),
        () =>
          this.page.locator('[role="dialog"], .modal, .confirmation-dialog').getByRole('button', { name: 'Complete' }),
        () => this.page.locator('button:has-text("Complete")').filter({ hasText: /complete|sure|confirm/i }),
      ];
      let buttonClicked = false;
      for (const strategy of confirmationStrategies) {
        try {
          const button = strategy();
          await this.verifier.verifyTheElementIsVisible(button, {
            assertionMessage: 'Complete confirmation button should be visible',
            timeout: TIMEOUTS.MEDIUM,
          });
          await button.click();
          buttonClicked = true;
          break;
        } catch {
          continue;
        }
      }
      if (!buttonClicked) {
        throw new Error('Could not find or click Complete confirmation button');
      }
    });
  }

  async clickResetButton(): Promise<void> {
    await test.step('Click Reset button', async () => {
      await this.clickOnElement(this.resetButton, {
        stepInfo: 'Click Reset button',
      });
    });
  }

  async applyTypeFilter(filterType: string): Promise<void> {
    await test.step(`Apply type filter: ${filterType}`, async () => {
      await this.clickOnElement(this.page.getByRole('button', { name: 'Type' }), {
        stepInfo: 'Click Type filter button',
      });
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('checkbox', { name: filterType }), {
        assertionMessage: `Checkbox for type filter '${filterType}' should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.page.getByRole('checkbox', { name: filterType }).check();
    });
  }

  async applyStatusFilter(filterStatus: string): Promise<void> {
    await test.step(`Apply status filter: ${filterStatus}`, async () => {
      await this.clickOnElement(this.page.getByRole('button', { name: 'Status' }), {
        stepInfo: 'Click Status filter button',
      });
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('checkbox', { name: filterStatus }), {
        assertionMessage: `Checkbox for status filter '${filterStatus}' should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.page.getByRole('checkbox', { name: filterStatus }).check();
    });
  }

  async verifyCompletedTag(): Promise<void> {
    await test.step('Verify Completed tag is visible after survey completion', async () => {
      const completedStrategies = [
        () => this.completedTag,
        () => this.completedTag.first(),
        () => this.completedTag,
        () => this.completedTagAlt1,
        () => this.completedTagAlt2,
        () => this.completedTagAlt3,
      ];
      let completedTagFound = false;
      for (const strategy of completedStrategies) {
        const locator = strategy();
        try {
          await this.verifier.verifyTheElementIsVisible(locator, {
            assertionMessage: 'Completed tag should be visible',
            timeout: TIMEOUTS.LONG,
          });
          if (await locator.isVisible()) {
            completedTagFound = true;
            break;
          }
        } catch {
          continue;
        }
      }
      if (!completedTagFound) {
        throw new Error('Could not find "Completed" tag/status for the survey after completion');
      }
    });
  }

  async waitForAndVerifyCompletedStatus(): Promise<void> {
    await test.step('Wait for and verify completed status appears', async () => {
      const completedLocator = this.completedTag;
      await this.verifier.verifyTheElementIsVisible(completedLocator, {
        assertionMessage: 'Completed status should be visible',
        timeout: TIMEOUTS.VERY_VERY_LONG,
      });
      if (await completedLocator.isVisible()) {
        return;
      }
      const alternativeLocators = [
        this.completedTag.first(),
        this.completedTag,
        this.completedTagAlt2,
        this.completedTagAlt1,
        this.completedTagAlt3,
      ];
      for (const locator of alternativeLocators) {
        try {
          await this.verifier.verifyTheElementIsVisible(locator, {
            assertionMessage: 'Completed status should be visible (alternative)',
            timeout: TIMEOUTS.LONG,
          });
          if (await locator.isVisible()) {
            return;
          }
        } catch {
          continue;
        }
      }
      throw new Error('Could not verify completed status after waiting and checking multiple locators');
    });
  }

  async validateDraftPopupOnNext(): Promise<void> {
    await test.step('Click Next button and validate draft behavior', async () => {
      const currentUrl = this.page.url();
      await this.clickOnElement(this.configureSurveyNextButton, {
        stepInfo: 'Click Configure Survey Next button',
      });
      await this.verifier.verifyTheElementIsVisible(this.draftAlertLocator, {
        assertionMessage: `Validation selector for alert 'Survey draft was saved' should be visible after clicking next`,
        timeout: TIMEOUTS.MEDIUM,
      });
      const newUrl = this.page.url();
      const navigationOccurred = currentUrl !== newUrl;
      if (navigationOccurred) {
        throw new Error('Unexpected behavior: Survey proceeded to next step without required send date configuration');
      }
      for (const selector of this.validationSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (
            await this.verifier.verifyTheElementIsVisible(element, {
              assertionMessage: `Validation selector ${selector} should be visible`,
              timeout: TIMEOUTS.SHORT,
            })
          ) {
            break;
          }
        } catch {
          continue;
        }
      }
    });
  }

  async clickConfigureOption(): Promise<void> {
    await test.step('Click Configure option with filter strategy', async () => {
      const isConfigureVisible = await this.configureOption.isVisible({ timeout: TIMEOUTS.MEDIUM });

      if (isConfigureVisible) {
        await this.clickOnElement(this.configureOption, {
          stepInfo: 'Click Configure option from survey menu',
        });
        return;
      }
      await this.page.getByRole('button', { name: 'Type' }).click();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('checkbox', { name: 'All-purpose' }), {
        assertionMessage: "Checkbox for type filter 'All-purpose' should be visible",
        timeout: TIMEOUTS.SHORT,
      });
      await this.page.getByRole('checkbox', { name: 'All-purpose' }).check();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('button', { name: 'Status' }), {
        assertionMessage: 'Status filter button should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.page.getByRole('button', { name: 'Status' }).click();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('checkbox', { name: 'Draft' }), {
        assertionMessage: "Checkbox for status filter 'Draft' should be visible",
        timeout: TIMEOUTS.SHORT,
      });
      await this.page.getByRole('checkbox', { name: 'Draft' }).check();
      await this.verifier.verifyTheElementIsVisible(this.page.getByLabel('manage survey').first(), {
        assertionMessage: 'First manage survey button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.page.getByLabel('manage survey').first().click();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('menuitem', { name: 'Configure' }), {
        assertionMessage: 'Configure menu item should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.page.getByRole('menuitem', { name: 'Configure' }).click();
    });
  }

  private async selectFirstAvailableDate(): Promise<void> {
    await test.step('Select first available date from calendar', async () => {
      await this.calendarGridCells.first().waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      const cellCount = await this.calendarGridCells.count();
      const cells = [];
      for (let i = 0; i < cellCount; i++) {
        cells.push(this.calendarGridCells.nth(i));
      }
      for (const cell of cells) {
        const isDisabled = await cell.getAttribute('aria-disabled');
        const isClickable = await cell.isEnabled();
        const cellText = await cell.textContent();
        if (isDisabled === 'true' || !isClickable || !cellText?.trim() || !/^\d+$/.test(cellText.trim())) {
          continue;
        }
        await this.clickOnElement(cell, {
          stepInfo: `Select available date: ${cellText.trim()}`,
        });
        return;
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.getDate().toString();
      const fallbackDate = this.getFallbackDateCell(tomorrowDate);
      if ((await fallbackDate.isVisible()) && (await fallbackDate.isEnabled())) {
        await this.clickOnElement(fallbackDate, {
          stepInfo: `Fallback: Select tomorrow's date: ${tomorrowDate}`,
        });
      } else {
        await this.verifier.verifyTheElementIsVisible(this.lastResortDateCell, {
          assertionMessage: 'Last resort: Select date 18 should be visible',
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.clickOnElement(this.lastResortDateCell, {
          stepInfo: 'Last resort: Select date 18',
        });
      }
    });
  }

  async configureDefaultSurveySettings(surveyName: string): Promise<void> {
    await test.step('Configure survey with default settings', async () => {
      await this.enterSurveyName(surveyName);
      await this.selectDefaultIntroMessage();
      await this.selectDefaultThanksMessage();
      await this.selectAudiences(['India']);
      await this.selectDefaultFormAddress();
      await this.selectSendDate();
    });
  }

  async clickAddNewSectionButton(): Promise<void> {
    await test.step('Click Add new section button', async () => {
      await this.clickOnElement(this.addNewSectionButton, {
        stepInfo: 'Click Add new section button',
      });
    });
  }

  async enterSectionName(sectionName: string, sectionNumber?: number): Promise<void> {
    await test.step(`Enter section name: ${sectionName}`, async () => {
      let sectionInput: Locator;
      if (sectionNumber) {
        sectionInput = this.sectionInput(sectionNumber);
      } else {
        sectionInput = this.sectionNameInput;
      }
      const stepInfo = sectionNumber
        ? `Enter section name: ${sectionName} for section ${sectionNumber}`
        : `Enter section name: ${sectionName}`;
      await this.fillInElement(sectionInput, sectionName, {
        stepInfo,
      });
    });
  }

  async enterSectionNames(sectionNames: string[]): Promise<void> {
    await test.step(`Enter section names: ${sectionNames.join(', ')}`, async () => {
      let sectionNumber = 1;
      for (const sectionName of sectionNames) {
        const sectionInput = this.sectionInput(sectionNumber);
        await this.fillInElement(sectionInput, sectionName, {
          stepInfo: `Enter section name: ${sectionName} for section ${sectionNumber}`,
        });
        await sectionInput.press('Enter');
        sectionNumber++;
      }
    });
  }

  async clickCreateYourOwnButtonInSection(sectionNumber: number): Promise<void> {
    await test.step(`Click Create your own button in section ${sectionNumber}`, async () => {
      if (this.page.isClosed()) {
        throw new Error('Page has been closed unexpectedly');
      }
      const createButton = this.sectionCreateButton(sectionNumber);
      await createButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(createButton, {
        stepInfo: `Click Create your own button in section ${sectionNumber}`,
      });
    });
  }

  async selectScaleQuestionType(): Promise<void> {
    await test.step('Select Scale question type', async () => {
      await this.clickOnElement(this.scaleQuestionType, {
        stepInfo: 'Select Scale question type radio button',
      });
    });
  }

  async createMultipleChoiceQuestion(questionTitle: string, answers: string[], theme?: string): Promise<void> {
    await test.step(`Create multiple choice question: ${questionTitle}`, async () => {
      if (this.page.isClosed()) {
        throw new Error('Page has been closed unexpectedly');
      }
      await this.verifier.verifyTheElementIsVisible(this.multipleChoiceRadio, {
        assertionMessage: 'Multiple choice radio should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.multipleChoiceRadio, {
        stepInfo: 'Select Multiple choice question type',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.questionTitleInput, {
        assertionMessage: 'Question title input should be visible after selecting multiple choice radio',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.questionTitleInput.fill(questionTitle);
      await this.verifier.verifyTheElementIsVisible(this.firstAnswerTextbox, {
        assertionMessage: 'First answer textbox should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.firstAnswerTextbox.click();
      await this.firstAnswerTextbox.fill(answers[0] || 'Yes');
      await this.verifier.verifyTheElementIsVisible(this.secondAnswerTextbox, {
        assertionMessage: 'Second answer textbox should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.secondAnswerTextbox.click();
      await this.secondAnswerTextbox.fill(answers[1] || 'No');
      if (theme) {
        await this.selectTheme(theme);
      } else {
        await this.verifier.verifyTheElementIsVisible(this.mcqThemeDropdown, {
          assertionMessage: 'MCQ theme dropdown should be visible',
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.mcqThemeDropdown.selectOption('b76dd86e-2921-11ed-a261-0242ac120002');
      }
      await this.verifier.verifyTheElementIsVisible(this.addButton, {
        assertionMessage: 'Add button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Click Add button to add multiple choice question',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.anyQuestionButton.first(), {
        assertionMessage:
          'At least one question should be visible in the list after adding the multiple choice question',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async selectSentimentAnswerScale(): Promise<void> {
    await test.step('Select Sentiment answer scale', async () => {
      await this.clickOnElement(this.sentimentAnswerScale, {
        stepInfo: 'Select Sentiment answer scale',
      });
    });
  }

  async selectEmojiAnswerScale(): Promise<void> {
    await test.step('Select Emoji answer scale', async () => {
      await this.clickOnElement(this.emojiAnswerScale, {
        stepInfo: 'Select Emoji answer scale',
      });
    });
  }

  async selectAwarenessAnswerScale(): Promise<void> {
    await test.step('Select Awareness answer scale', async () => {
      await this.clickOnElement(this.awarenessAnswerScale, {
        stepInfo: 'Select Awareness answer scale',
      });
    });
  }

  async selectTheme(theme: string): Promise<void> {
    await test.step(`Select theme: ${theme}`, async () => {
      const themeValueMap: { [key: string]: string } = {
        'Business agility': '7131a646-2921-11ed-a261-0242ac120002',
        'Employee engagement': '',
        'UI-Automation': '',
      };

      const themeValue = themeValueMap[theme];

      if (themeValue) {
        await this.themeDropdown.selectOption(themeValue);
      } else {
        await this.themeDropdown.selectOption({ label: theme });
      }
    });
  }

  async createScaleQuestion(questionTitle: string, answerScale: string, theme: string): Promise<void> {
    await test.step(`Create scale question: ${questionTitle}`, async () => {
      await this.clickCreateYourOwnButton();
      await this.clickOnElement(this.scaleQuestionType, {
        stepInfo: 'Select Scale question type radio button',
      });
      await this.fillInElement(this.questionTitleInput, questionTitle, {
        stepInfo: `Enter question title: ${questionTitle}`,
      });

      if (answerScale === 'Sentiment') {
        await this.selectSentimentAnswerScale();
      } else {
        await this.clickOnElement(this.emojiAnswerScale, {
          stepInfo: `Select ${answerScale} answer scale`,
        });
      }
      await this.selectTheme(theme);
      await this.clickAddButton();
      await this.validateQuestionAddedPopup();
      await this.validateQuestionAddedSuccessfully(questionTitle);
    });
  }

  async clickPreviewLabel(): Promise<void> {
    await test.step('Click Preview label', async () => {
      await this.clickOnElement(this.previewLabel, {
        stepInfo: 'Click Preview label',
      });
    });
  }

  async validateQuestionsAndSectionsOnPreview(data: Array<{ section: string; question: string }>): Promise<void> {
    await test.step('Validate questions and sections on preview window', async () => {
      await this.verifier.verifyTheElementIsVisible(this.previewDialog, {
        assertionMessage: 'Preview dialog should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.previewWindow, {
        assertionMessage: 'Preview window should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      const sectionMap = new Map<string, string[]>();
      for (const item of data) {
        if (!sectionMap.has(item.section)) sectionMap.set(item.section, []);
        sectionMap.get(item.section)!.push(item.question);
      }
      const sections = Array.from(sectionMap.keys());
      for (const [sectionIndex, section] of sections.entries()) {
        if (sectionIndex > 0) await this.clickNextSectionButton();
        await this.verifySectionVisible(section);
        for (const question of sectionMap.get(section)!) {
          await this.verifyQuestionVisibleInPreview(question);
        }
      }
    });
  }

  private async clickNextSectionButton(): Promise<void> {
    for (const nextButton of this.previewNextSectionButtons) {
      if (
        await this.verifier.verifyTheElementIsVisible(nextButton, {
          assertionMessage: 'Next button in preview dialog should be visible',
          timeout: TIMEOUTS.SHORT,
        })
      ) {
        await nextButton.click();
        break;
      }
    }
  }

  private async verifySectionVisible(section: string): Promise<void> {
    for (const getLocator of this.previewSectionLocators) {
      const sectionLocator = getLocator(section);
      if (
        await this.verifier.verifyTheElementIsVisible(sectionLocator, {
          assertionMessage: `Section ${section} should be visible in preview`,
          timeout: TIMEOUTS.MEDIUM,
        })
      )
        return;
    }
    console.error(`✗ Section "${section}" not found in preview window`);
  }

  private async verifyQuestionVisibleInPreview(question: string): Promise<void> {
    for (const getLocator of this.previewQuestionLocators) {
      const questionLocator = getLocator(question);
      if (
        await this.verifier.verifyTheElementIsVisible(questionLocator, {
          assertionMessage: `Question ${question} should be visible in preview`,
          timeout: TIMEOUTS.MEDIUM,
        })
      )
        return;
    }
    console.error(`  ✗ Question "${question}" not found in current view`);
  }

  async closePreviewDialog(): Promise<void> {
    await test.step('Close preview dialog', async () => {
      const closeButton = this.previewDialog.getByRole('button', { name: /close|×/i }).first();
      if (
        await this.verifier.verifyTheElementIsVisible(closeButton, {
          assertionMessage: 'Close button in preview dialog should be visible',
          timeout: TIMEOUTS.SHORT,
        })
      ) {
        await closeButton.click();
        return;
      }
      await this.page.keyboard.press('Escape');
      await this.verifier.verifyTheElementIsNotVisible(this.previewDialog, {
        assertionMessage: 'Preview dialog should be closed after pressing Escape',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async validateAddedQuestions(expectedQuestions: string[]): Promise<void> {
    await test.step(`Validate added questions: ${expectedQuestions.join(', ')}`, async () => {
      for (const questionTitle of expectedQuestions) {
        await this.verifyQuestionAdded(questionTitle);
      }
    });
  }

  private async verifyQuestionAdded(questionTitle: string): Promise<void> {
    const questionButton = this.getDynamicQuestionButton(`${questionTitle}*`);
    try {
      await this.verifier.verifyTheElementIsVisible(questionButton, {
        assertionMessage: `Question "${questionTitle}" should be visible in the questions list`,
        timeout: TIMEOUTS.LONG,
      });
      return;
    } catch {}
    await this.debugQuestionButtons();
    const questionLocators = this.getQuestionByText(questionTitle);
    for (const locator of questionLocators) {
      if (
        await this.verifier.verifyTheElementIsVisible(locator.first(), {
          assertionMessage: `Question "${questionTitle}" should be visible in the questions list (alternative)`,
          timeout: TIMEOUTS.MEDIUM,
        })
      )
        return;
    }
    for (const altLocator of this.alternativeQuestionLocators) {
      try {
        const matchingQuestions = altLocator.filter({ hasText: new RegExp(questionTitle, 'i') });
        if (
          await this.verifier.verifyTheElementIsVisible(matchingQuestions.first(), {
            assertionMessage: `Question "${questionTitle}" should be visible in the questions list (fallback)`,
            timeout: TIMEOUTS.SHORT,
          })
        )
          return;
      } catch {}
    }
    console.error(`Question "${questionTitle}" not found using any locator strategy`);
    throw new Error(`Question "${questionTitle}" could not be found in the questions list`);
  }

  private async debugQuestionButtons(): Promise<void> {
    try {
      for (const allButtons of this.debugQuestionButtonLocators) {
        const buttonCount = await allButtons.count();
        for (let i = 0; i < Math.min(buttonCount, 20); i++) {
          const button = allButtons.nth(i);
          const buttonText = await button.textContent();
          const buttonName =
            (await button.getAttribute('aria-label')) || (await button.getAttribute('name')) || 'no-name';
          if (buttonText && (buttonText.toLowerCase().includes('question') || buttonText.includes('*'))) {
            console.warn(`Question-related button ${i}: text="${buttonText}", name="${buttonName}"`);
          }
        }
      }
    } catch (error) {
      console.error(`Debug failed: ${error}`);
    }
  }

  async verifySendDateOptions(): Promise<void> {
    await test.step('Verify "Not yet" and "Schedule date and time" options are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.notYetRadio, {
        assertionMessage: '"Not yet" radio button should be visible on configuration page',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.sendDateRadio, {
        assertionMessage: '"Schedule date and time" radio button should be visible on configuration page',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifySurveyNameOnConfigPage(expectedName: string): Promise<void> {
    await test.step(`Verify we are on the edit survey configuration page`, async () => {
      const editSurveyHeading = this.page.getByRole('heading', { name: 'Edit all-purpose survey' });
      await this.verifier.verifyTheElementIsVisible(editSurveyHeading, {
        assertionMessage: '"Edit all-purpose survey" heading should be visible on configuration page',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAddNewRecipientsText(): Promise<void> {
    await test.step('Verify "Add new recipients while" text is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addNewRecipientsText, {
        assertionMessage: '"Add new recipients while" text should be visible on preview and confirm page',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyConfigurationDetails(): Promise<void> {
    await test.step('Verify all configuration details are preserved', async () => {
      await this.verifier.verifyTheElementIsVisible(this.recipientsButton, {
        assertionMessage: 'Recipients button (all organization) should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsVisible(this.noText, {
        assertionMessage: 'No text should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsVisible(this.introText, {
        assertionMessage: 'Introduction message should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsVisible(this.thanksText, {
        assertionMessage: 'Thank you message should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsVisible(this.notScheduledText, {
        assertionMessage: 'Not scheduled yet text should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsVisible(this.participationWindowText, {
        assertionMessage: 'Participation window (days) should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsVisible(this.freeTextQuestionText, {
        assertionMessage: 'Free Text question should be visible',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async selectDefaultIntroMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.defaultIntroOption, {
      assertionMessage: 'Default intro option should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await this.defaultIntroOption.check();
  }

  async selectDefaultThanksMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.defaultThanksMessageOption, {
      assertionMessage: 'Default thanks message option should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await this.defaultThanksMessageOption.check();
  }

  async selectCustomIntroMessage(message: string = 'This is a custom intro message'): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.customIntroOption, {
      assertionMessage: 'Custom intro option should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await this.customIntroOption.check();
    await this.verifier.verifyTheElementIsVisible(this.introEditorLocator, {
      assertionMessage: 'Intro editor should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await this.introEditorLocator.fill(message);
  }

  async selectCustomThanksMessage(message: string = 'Thank you for participating!'): Promise<void> {
    await this.customThanksMessageOption.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await this.customThanksMessageOption.check();
    const count = await this.editorsLocator.count();
    const thanksEditor = count === 1 ? this.editorsLocator : this.editorsLocator.nth(1);
    await thanksEditor.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await thanksEditor.fill(message);
  }

  async prepareLongSurveyCreation(testObj: any, ms: number) {
    testObj.setTimeout(ms);
  }

  async createSectionScaleQuestion(sectionNumber: number, index: number, scaleType: string): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.SCALE[index];
    await this.clickCreateYourOwnButtonInSection(sectionNumber);
    await this.selectScaleQuestionType();
    await this.enterQuestionTitle(questionData.question);
    if (scaleType === 'Sentiment') await this.selectSentimentAnswerScale();
    if (scaleType === 'Emoji') await this.selectEmojiAnswerScale();
    if (scaleType === 'Awareness') await this.selectAwarenessAnswerScale();
    await this.selectTheme(questionData.theme);
    await this.clickAddButton();
    await this.validateQuestionAddedPopup();
  }

  async createSectionFreeTextQuestion(sectionNumber: number, index: number): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.FREE_TEXT[index];
    await this.clickCreateYourOwnButtonInSection(sectionNumber);
    await this.selectFreeTextQuestionType();
    await this.enterQuestionTitle(questionData.question);
    await this.clickAddButton();
    await this.validateQuestionAddedPopup();
  }

  async createSectionMultipleChoiceQuestion(
    sectionNumber: number,
    index: number,
    options?: string[],
    theme?: string
  ): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.MCQ[index];
    await this.clickCreateYourOwnButtonInSection(sectionNumber);
    await this.createMultipleChoiceQuestion(
      questionData.question,
      options || ['Yes', 'No'],
      theme || questionData.theme
    );
    await this.validateQuestionAddedPopup();
  }

  async searchSurveyByName(surveyName: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Search surveys' }).fill(surveyName);
  }

  async addScaleQuestionFromData(index: number, scaleType: string): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.SCALE[index];
    await this.clickCreateYourOwnButton();
    await this.selectScaleQuestionType();
    await this.enterQuestionTitle(questionData.question);
    if (scaleType === 'Sentiment') await this.selectSentimentAnswerScale();
    if (scaleType === 'Emoji') await this.selectEmojiAnswerScale();
    if (scaleType === 'Awareness') await this.selectAwarenessAnswerScale();
    await this.selectTheme(questionData.theme);
    await this.clickAddButton();
    await this.validateQuestionAddedPopup();
  }

  async addFreeTextQuestionFromData(index: number): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.FREE_TEXT[index];
    await this.clickCreateYourOwnButton();
    await this.selectFreeTextQuestionType();
    await this.enterQuestionTitle(questionData.question);
    await this.clickAddButton();
    await this.validateQuestionAddedPopup();
  }

  async addMultipleChoiceQuestionFromData(index: number, options?: string[], theme?: string): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.MCQ[index];
    await this.verifier.verifyTheElementIsVisible(this.createYourOwnButton, {
      assertionMessage: 'Create your own button should be visible before clicking',
      timeout: TIMEOUTS.LONG,
    });
    await this.clickCreateYourOwnButton();
    await this.createMultipleChoiceQuestion(
      questionData.question,
      options || ['Yes', 'No'],
      theme || questionData.theme
    );
    await this.validateQuestionAddedPopup();
  }
}
