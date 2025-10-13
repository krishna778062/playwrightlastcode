import { EventSyncDestination, EventSyncInvitees } from '@/src/core/types/contentManagement.types';

export const BASE_OUTLOOK_EVENT_SYNC_CONFIG = {
  enabled: true,
  destination: EventSyncDestination.OUTLOOK_CALENDAR,
  emailInvitationEnabled: true,
  invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
} as const;

export const BASE_OUTLOOK_RSVP_CONFIG = {
  hasMaybeOption: true,
  noteLabel: null,
} as const;

export const createOutlookEventBody = (description: string) => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
      content: [{ type: 'text', text: description }],
    },
  ],
});

export const createOutlookEventPayload = (params: {
  title: string;
  description: string;
  location: string;
  organizerId?: string;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  eventSyncConfig?: typeof BASE_OUTLOOK_EVENT_SYNC_CONFIG;
  rsvpConfig?: typeof BASE_OUTLOOK_RSVP_CONFIG;
}) => {
  const {
    title,
    description,
    location,
    organizerId,
    startDate = new Date(),
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    timezone = 'Asia/Kolkata',
    eventSyncConfig = BASE_OUTLOOK_EVENT_SYNC_CONFIG,
    rsvpConfig = BASE_OUTLOOK_RSVP_CONFIG,
  } = params;

  return {
    title,
    location,
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
    timezoneIso: timezone,
    contentType: 'event',
    bodyHtml: `<p>${description}</p>`,
    body: JSON.stringify(createOutlookEventBody(description)),
    eventSync: organizerId ? { ...eventSyncConfig, organizerId } : eventSyncConfig,
    rsvp: rsvpConfig,
  };
};

export const OUTLOOK_EVENT_CONFIGS = {
  RSVP_SYNC: {
    titleSuffix: 'API Event with Outlook Sync',
    description: 'Event created via API with Outlook Calendar sync for testing',
    location: 'API Test Location',
  },
  DELETE_TEST: {
    titleSuffix: 'Delete Test Event - Outlook',
    description: 'Event created for deletion testing with Outlook Calendar sync',
    location: 'Delete Test Location - Outlook',
  },
  UNPUBLISH_REPUBLISH: {
    titleSuffix: 'Unpublish-Republish Test Event - Outlook',
    description: 'Event created for unpublish/republish testing with Outlook Calendar sync',
    location: 'Unpublish-Republish Test Location - Outlook',
  },
  EDIT_TEST: {
    titleSuffix: 'Edit Test Event - Outlook',
    description: 'Original event description for edit testing - Outlook',
    location: 'Original Test Location - Outlook',
  },
  SITE_DEACTIVATION: {
    titleSuffix: 'Site Deactivation Test Event - Outlook',
    description: 'Event created to test Outlook Calendar sync behavior during site deactivation',
    location: 'Site Deactivation Test Location - Outlook',
  },
  SYNC_TOGGLE: {
    titleSuffix: 'Sync Toggle Test Event - Outlook',
    description: 'Event created to test Outlook Calendar sync toggle behavior',
    location: 'Sync Toggle Test Location - Outlook',
  },
  END_USER_SYNC: {
    titleSuffix: 'End User Sync Test Event - Outlook',
    description: 'Event created to test Outlook Calendar sync to end user calendar',
    location: 'End User Sync Test Location - Outlook',
  },
  MEMBER_FIRST_SYNC: {
    titleSuffix: 'Member First Sync Test Event - Outlook',
    description: 'Event created after user is already a site member to test Outlook Calendar sync',
    location: 'Member First Sync Test Location - Outlook',
  },
  NON_MEMBER_RSVP: {
    titleSuffix: 'Non-Member RSVP Test Event - Outlook',
    description: 'Event created to test Outlook Calendar sync when non-member RSVPs',
    location: 'Non-Member RSVP Test Location - Outlook',
  },
  SITE_ACCESS_CHANGE: {
    titleSuffix: 'Site Access Change Test Event - Outlook',
    description: 'Event created to test attendee retention when site changes from public to private - Outlook',
    location: 'Site Access Change Test Location - Outlook',
  },
} as const;

export const EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG = {
  eventSync: {
    enabled: true,
    destination: EventSyncDestination.OUTLOOK_CALENDAR,
    emailEnabled: true,
    invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
    syncStatus: 'initialized',
  },
  rsvp: {
    hasRsvp: true,
    hasMaybeOption: true,
    noteLabel: null,
  },
} as const;
