import { EventSyncDestination, EventSyncInvitees } from '@/src/core/types/contentManagement.types';

export const BASE_EVENT_SYNC_CONFIG = {
  enabled: true,
  destination: EventSyncDestination.GOOGLE_CALENDAR,
  emailInvitationEnabled: true,
  invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
} as const;

export const BASE_RSVP_CONFIG = {
  hasMaybeOption: true,
  noteLabel: null,
} as const;

export const createEventBody = (description: string) => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { indentation: 0, textAlign: 'left', className: '', 'data-sw-sid': null },
      content: [{ type: 'text', text: description }],
    },
  ],
});

export const createEventPayload = (params: {
  title: string;
  description: string;
  location: string;
  organizerId?: string;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  eventSyncConfig?: typeof BASE_EVENT_SYNC_CONFIG;
  rsvpConfig?: typeof BASE_RSVP_CONFIG;
}) => {
  const {
    title,
    description,
    location,
    organizerId,
    startDate = new Date(),
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    timezone = 'Asia/Kolkata',
    eventSyncConfig = BASE_EVENT_SYNC_CONFIG,
    rsvpConfig = BASE_RSVP_CONFIG,
  } = params;

  return {
    title,
    location,
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
    timezoneIso: timezone,
    contentType: 'event',
    bodyHtml: `<p>${description}</p>`,
    body: JSON.stringify(createEventBody(description)),
    eventSync: organizerId ? { ...eventSyncConfig, organizerId } : eventSyncConfig,
    rsvp: rsvpConfig,
  };
};

export const EVENT_CONFIGS = {
  RSVP_SYNC: {
    titleSuffix: 'API Event with Google Sync',
    description: 'Event created via API with Google Calendar sync for testing',
    location: 'API Test Location',
  },
  DELETE_TEST: {
    titleSuffix: 'Delete Test Event',
    description: 'Event created for deletion testing with Google Calendar sync',
    location: 'Delete Test Location',
  },
  UNPUBLISH_REPUBLISH: {
    titleSuffix: 'Unpublish-Republish Test Event',
    description: 'Event created for unpublish/republish testing with Google Calendar sync',
    location: 'Unpublish-Republish Test Location',
  },
  EDIT_TEST: {
    titleSuffix: 'Edit Test Event',
    description: 'Original event description for edit testing',
    location: 'Original Test Location',
  },
  SITE_DEACTIVATION: {
    titleSuffix: 'Site Deactivation Test Event',
    description: 'Event created to test Google Calendar sync behavior during site deactivation',
    location: 'Site Deactivation Test Location',
  },
  SYNC_TOGGLE: {
    titleSuffix: 'Sync Toggle Test Event',
    description: 'Event created to test Google Calendar sync toggle behavior',
    location: 'Sync Toggle Test Location',
  },
  END_USER_SYNC: {
    titleSuffix: 'End User Sync Test Event',
    description: 'Event created to test Google Calendar sync to end user calendar',
    location: 'End User Sync Test Location',
  },
  MEMBER_FIRST_SYNC: {
    titleSuffix: 'Member First Sync Test Event',
    description: 'Event created after user is already a site member to test Google Calendar sync',
    location: 'Member First Sync Test Location',
  },
  NON_MEMBER_RSVP: {
    titleSuffix: 'Non-Member RSVP Test Event',
    description: 'Event created to test Google Calendar sync when non-member RSVPs',
    location: 'Non-Member RSVP Test Location',
  },
  SITE_ACCESS_CHANGE: {
    titleSuffix: 'Site Access Change Test Event',
    description: 'Event created to test attendee retention when site changes from public to private',
    location: 'Site Access Change Test Location',
  },
} as const;

export const EXPECTED_EVENT_SYNC_CONFIG = {
  eventSync: {
    enabled: true,
    destination: EventSyncDestination.GOOGLE_CALENDAR,
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
