export const EMPLOYEE_LISTENING_TEST_DATA = {
  AWARENESS_CHECK: {
    QUESTIONS: {
      SINGLE: {
        question: 'What is the primary purpose of this awareness check?',
        answers: ['To ensure understanding', 'To test knowledge'],
        correctness: ['correct', 'incorrect'],
      },
      MULTIPLE: [
        {
          question: 'First Question - Safety Protocol',
          answers: ['Follow procedures', 'Ignore guidelines'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question - Compliance Requirements',
          answers: ['Always comply', 'Sometimes comply', 'Never comply'],
          correctness: ['correct', 'incorrect', 'incorrect'],
        },
        {
          question: 'Third Question - Best Practices',
          answers: ['Document everything', 'Skip documentation', 'Partial documentation', 'Complete documentation'],
          correctness: ['incorrect', 'incorrect', 'incorrect', 'correct'],
        },
      ],
    },
    UPDATED_QUESTIONS: {
      SINGLE: {
        question: 'Updated Question - What is the revised purpose?',
        answers: ['Updated understanding', 'Updated knowledge'],
        correctness: ['incorrect', 'correct'],
      },
      MULTIPLE: [
        {
          question: 'First Question Updated - Enhanced Safety Protocol',
          answers: ['Enhanced procedures', 'Updated guidelines'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question Updated - New Compliance Requirements',
          answers: ['Always comply updated', 'Sometimes comply updated', 'Never comply updated'],
          correctness: ['correct', 'incorrect', 'incorrect'],
        },
        {
          question: 'Third Question Updated - Improved Best Practices',
          answers: [
            'Document everything updated',
            'Skip documentation updated',
            'Partial documentation updated',
            'Complete documentation updated',
          ],
          correctness: ['incorrect', 'incorrect', 'incorrect', 'correct'],
        },
      ],
    },
    MESSAGES: {
      CONFIRMATION: "You've confirmed that you read and understood the content.",
      SUCCESS: 'Awareness check created successfully',
      UPDATED: 'Awareness check updated successfully',
      REMOVED: 'Awareness check removed successfully',
      PARTICIPATED: "You've confirmed that you read and understood the content.",
    },
    POPUP_TITLES: {
      MUST_READ_REPORT: 'Must read report',
      REMOVE_CONFIRMATION: 'Remove awareness check',
    },
    BUTTONS: {
      MAKE_MUST_READ: 'Make must read',
      UPDATE: 'Update',
      REMOVE: 'Remove',
      FINISH: 'Finish',
      VIEW_HISTORY: 'View history',
    },
  },
  PAGE_CONTENT: {
    TITLE_PREFIX: 'Test Page for Awareness Check',
    CONTENT_TYPE: 'news',
    DESCRIPTION: 'Test page content for awareness check functionality verification',
  },
};
