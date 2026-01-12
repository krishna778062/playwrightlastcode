export enum RecognitionTabNames {
  RENAMING = 'Naming',
  SPOT_AWARDS = 'Spot awards',
  MILESTONES = 'Milestones',
  RECURRING_AWARDS = 'Recurring awards',
}

export enum ManagePageType {
  MANAGE = 'manage',
  PEER = 'peer',
}

// Nomination instance statuses used in DB validations
export enum NominationInstanceStatus {
  PREOPEN = 'PREOPEN',
  OPEN = 'OPEN',
  DRAFT = 'DRAFT',
  CLOSED = 'CLOSED',
}

// UI statuses shown in recurring awards table
export enum RecurringAwardTableStatus {
  SCHEDULED = 'Scheduled',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft',
}
