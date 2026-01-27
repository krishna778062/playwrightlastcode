import { FileUtil } from '@core/utils/fileUtil';

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
    it: 'IT',
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
      category: 'IT',
      subject: 'Test Ticket IT Support Request',
      description:
        'This is a test ticket for IT Support category to verify system functionality and ticket processing workflow.',
      priority: 'Medium',
    },

    urgentTicket: {
      category: 'IT',
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

  // Image files for ticket attachments
  getImageFilePaths: (testFileDir: string) => {
    return {
      image1: FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'image1.jpg'),
      image3: FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'image3.jpg'),
      image4: FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'image4.jpg'),
      favicon: FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'favicon.png'),
      all: [
        FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'image1.jpg'),
        FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'image3.jpg'),
        FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'image4.jpg'),
        FileUtil.getFilePath(testFileDir, '..', '..', 'test-data', 'static-files', 'images', 'favicon.png'),
      ],
    };
  },

  // Image file names for verification (without paths)
  imageFileNames: ['image1.jpg', 'image3.jpg', 'image4.jpg', 'favicon.png'],

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

  // Workspaces
  workspaces: {
    finance: 'Finance',
    hr: 'HR',
    it: 'IT',
  },

  // Workspace Settings
  workspaceSettings: {
    tabs: {
      workspaceManagement: 0,
      userManagement: 1,
      serviceManagement: 2,
      automationAndProductivity: 3,
    },
    workspaceManagement: {
      workspace: 'Workspace',
      emailNotification: 'Email notification',
    },
    userManagement: {
      agentGroups: 'Agent groups',
    },
    serviceManagement: {
      serviceCatalog: 'Service catalog',
      businessHoursSetup: 'Business hours setup',
      slaAndOlaPolicy: 'SLA and OLA policy',
    },
    automationAndProductivity: {
      messageTemplate: 'Message template',
    },
    serviceCatalogs: {
      finance: ['Finance Applications'],
      hr: [
        'Employee Records and Documents',
        'Employee Relations',
        'Hardware Requests',
        'Employee Benefits',
        'Payroll',
        'Invoicing and Billing',
        'Finance Applications',
        'Software Installation',
      ],
      it: ['Hardware Requests Managing'],
    },
  },

  // Agent Management
  agents: {
    roles: {
      agent: 'Agent',
      accountAdmin: 'Account Admin',
      workspaceAdmin: 'Workspace Admin',
      hrAgent: 'HR Agent',
    },
  },

  // Custom Workspace Data
  customWorkspace: {
    sampleWorkspace: {
      name: 'Auto Test Workspace',
      type: 'IT',
      description: 'Automated test workspace for verification',
    },
    editedWorkspace: {
      name: 'Edited Auto Workspace',
      type: 'HR',
      description: 'Updated workspace description',
    },
    successMessages: {
      created: /Workspace created successfully|Successfully created/i,
      updated: /Workspace updated successfully|Changes saved|Saved successfully/i,
      deleted: /Workspace deleted successfully|Successfully deleted/i,
    },
  },

  // Comments and Attachments
  comments: {
    agentComment: 'This is a test comment from the agent. We are working on your request.',
    agentPublicComment: 'Hello! Thank you for reaching out. Your ticket has been received and is being processed.',
    requesterReply: 'Thank you for the update. Looking forward to resolution.',
  },

  // Message Templates
  messageTemplates: {
    sampleTemplate: {
      name: 'Auto Test Template',
      description: 'This is an automated test message template for agents',
      messageContent:
        'Hello, thank you for contacting support. We are looking into your request and will get back to you shortly.',
    },
    successMessages: {
      templateCreated: /Template created successfully|Template saved successfully|Successfully created/i,
    },
    visibilityOptions: {
      allAgents: 'All agents',
      onlyMe: 'Only me',
    },
  },
};

export default ServiceDeskTestData;
