/**
 * Test Data for Service Desk Module
 *
 * Contains test data for ticket creation, categories, priorities, and other
 * service desk related test scenarios.
 */

export const ServiceDeskTestData = {
  // Ticket Categories
  categories: {
    hr: 'HR',
    finance: 'Finance',
    it: 'IT Support',
    facilities: 'Facilities',
    legal: 'Legal',
  },

  // Priority Levels
  priorities: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  },

  // Sample Ticket Data
  sampleTickets: {
    hrTicket: {
      category: 'HR',
      subject: 'Test Ticket HR Request',
      description:
        'This is a test ticket for HR category to verify ticket creation functionality with all mandatory fields filled.',
      priority: 'Low',
    },

    itTicket: {
      category: 'IT Support',
      subject: 'Test Ticket IT Support Request',
      description:
        'This is a test ticket for IT Support category to verify system functionality and ticket processing workflow.',
      priority: 'Medium',
    },

    urgentTicket: {
      category: 'IT Support',
      subject: 'Urgent System Down',
      description:
        'Critical system outage affecting multiple users. Immediate attention required for business continuity.',
      priority: 'Critical',
    },
  },

  // Test Files for Attachments
  testFiles: {
    validImage: 'c2a51efbaa889f5b2d5a18ada41b1548.jpg',
    validDocument: 'test-document.pdf',
    validSpreadsheet: 'test-data.xlsx',
  },

  // Expected Validation Messages
  validationMessages: {
    descriptionRequired: 'Description is required',
    categoryRequired: 'Category is required',
    subjectRequired: 'Subject is required',
    requesterRequired: 'Requester is required',
  },

  // Expected Success Messages
  successMessages: {
    ticketCreated: /Ticket created successfully/i,
    ticketUpdated: /Ticket updated successfully/i,
    ticketClosed: /Ticket closed successfully/i,
  },

  // Ticket ID Patterns
  ticketIdPatterns: {
    general: /[A-Z]+-\d+/,
    incident: /INC-\d+/,
    request: /REQ-\d+/,
    change: /CHG-\d+/,
  },

  // User Roles and Permissions
  userRoles: {
    requester: 'Requester',
    agent: 'Agent',
    admin: 'Admin',
  },

  // Ticket States
  ticketStates: {
    new: 'New',
    inProgress: 'In Progress',
    pending: 'Pending',
    resolved: 'Resolved',
    closed: 'Closed',
    cancelled: 'Cancelled',
  },

  // Settings Page
  settingsPage: {
    featureName: 'Service desk',
    enableCheckboxLabel: 'Enable Service desk',
    settingsPath: '/manage/app/setup/service-desk',
    radioOptions: {
      supportTeamsOnly: 'support-teams' as const,
      everyone: 'everyone' as const,
    },
    headings: {
      manageApplication: 'Manage application',
      enableDisableServiceDesk: 'Enable/Disable Service desk',
    },
    descriptions: {
      main: 'Service desk allows employees to raise requests and allow assigned agents to manage these tickets directly within Simpplr.',
      helpText:
        'Turn on Service desk to let support teams manage service requests, incidents, and approvals directly within Simpplr.',
      supportTeamsOnly:
        'Only support teams and admins will have access to the Service desk feature to manage requests and incidents.',
      everyone:
        'All employees will see the Support option to raise requests and track tickets, while support teams continue managing them through Service desk.',
    },
    radioLabels: {
      supportTeamsOnly: 'Enable Service desk (for support teams only)',
      everyone: 'Enable Service desk with Support (for everyone)',
    },
    successToastMessage: 'Saved changes successfully',
  },
};

export default ServiceDeskTestData;
