import { EventSyncDestination, EventSyncInvitees } from '@/src/core/types/contentManagement.types';

/**
 * Factory function to create event sync configuration for any calendar provider
 */
export const createEventSyncConfig = (destination: EventSyncDestination) =>
  ({
    enabled: true,
    destination,
    emailInvitationEnabled: true,
    invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
  }) as const;

/**
 * Base RSVP configuration (same for all calendar providers)
 */
export const BASE_RSVP_CONFIG = {
  hasMaybeOption: true,
  noteLabel: null,
} as const;

/**
 * Creates event body in the required format
 */
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

/**
 * Factory function to create event payload for any calendar provider
 */
export const createCalendarEventPayload = (params: {
  title: string;
  description: string;
  location: string;
  destination: EventSyncDestination;
  organizerId?: string;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  rsvpConfig?: typeof BASE_RSVP_CONFIG;
}) => {
  const {
    title,
    description,
    location,
    destination,
    organizerId,
    startDate = new Date(),
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    timezone = 'Asia/Kolkata',
    rsvpConfig = BASE_RSVP_CONFIG,
  } = params;

  const eventSyncConfig = createEventSyncConfig(destination);

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

/**
 * Helper function to get calendar provider name for display
 */
const getCalendarProviderName = (destination: EventSyncDestination): string => {
  switch (destination) {
    case EventSyncDestination.GOOGLE_CALENDAR:
      return 'Google Calendar';
    case EventSyncDestination.OUTLOOK_CALENDAR:
      return 'Outlook Calendar';
    default:
      return 'Calendar';
  }
};

/**
 * Helper function to get calendar provider suffix for titles
 */
const getCalendarProviderSuffix = (destination: EventSyncDestination): string => {
  switch (destination) {
    case EventSyncDestination.GOOGLE_CALENDAR:
      return '';
    case EventSyncDestination.OUTLOOK_CALENDAR:
      return ' - Outlook';
    default:
      return '';
  }
};

/**
 * Factory function to create event configurations for any calendar provider
 */
export const createEventConfigs = (destination: EventSyncDestination) => {
  const providerName = getCalendarProviderName(destination);
  const providerSuffix = getCalendarProviderSuffix(destination);

  return {
    RSVP_SYNC: {
      titleSuffix: `API Event with ${destination === EventSyncDestination.GOOGLE_CALENDAR ? 'Google' : 'Outlook'} Sync`,
      description: `Event created via API with ${providerName} sync for testing`,
      location: 'API Test Location',
    },
    DELETE_TEST: {
      titleSuffix: `Delete Test Event${providerSuffix}`,
      description: `Event created for deletion testing with ${providerName} sync`,
      location: `Delete Test Location${providerSuffix}`,
    },
    UNPUBLISH_REPUBLISH: {
      titleSuffix: `Unpublish-Republish Test Event${providerSuffix}`,
      description: `Event created for unpublish/republish testing with ${providerName} sync`,
      location: `Unpublish-Republish Test Location${providerSuffix}`,
    },
    EDIT_TEST: {
      titleSuffix: `Edit Test Event${providerSuffix}`,
      description: `Original event description for edit testing${providerSuffix === '' ? '' : ' - ' + providerName}`,
      location: `Original Test Location${providerSuffix}`,
    },
    SITE_DEACTIVATION: {
      titleSuffix: `Site Deactivation Test Event${providerSuffix}`,
      description: `Event created to test ${providerName} sync behavior during site deactivation`,
      location: `Site Deactivation Test Location${providerSuffix}`,
    },
    SYNC_TOGGLE: {
      titleSuffix: `Sync Toggle Test Event${providerSuffix}`,
      description: `Event created to test ${providerName} sync toggle behavior`,
      location: `Sync Toggle Test Location${providerSuffix}`,
    },
    END_USER_SYNC: {
      titleSuffix: `End User Sync Test Event${providerSuffix}`,
      description: `Event created to test ${providerName} sync to end user calendar`,
      location: `End User Sync Test Location${providerSuffix}`,
    },
    MEMBER_FIRST_SYNC: {
      titleSuffix: `Member First Sync Test Event${providerSuffix}`,
      description: `Event created after user is already a site member to test ${providerName} sync`,
      location: `Member First Sync Test Location${providerSuffix}`,
    },
    NON_MEMBER_RSVP: {
      titleSuffix: `Non-Member RSVP Test Event${providerSuffix}`,
      description: `Event created to test ${providerName} sync when non-member RSVPs`,
      location: `Non-Member RSVP Test Location${providerSuffix}`,
    },
    SITE_ACCESS_CHANGE: {
      titleSuffix: `Site Access Change Test Event${providerSuffix}`,
      description: `Event created to test attendee retention when site changes from public to private${providerSuffix === '' ? '' : ' - ' + providerName}`,
      location: `Site Access Change Test Location${providerSuffix}`,
    },
  } as const;
};

/**
 * Factory function to create expected event sync configuration for validation
 */
export const createExpectedEventSyncConfig = (destination: EventSyncDestination) =>
  ({
    eventSync: {
      enabled: true,
      destination,
      emailEnabled: true,
      invitees: EventSyncInvitees.SITE_MEMBERS_FOLLOWERS,
      syncStatus: 'initialized',
    },
    rsvp: {
      hasRsvp: true,
      hasMaybeOption: true,
      noteLabel: null,
    },
  }) as const;

// Convenience exports for Google Calendar
export const GOOGLE_EVENT_CONFIGS = createEventConfigs(EventSyncDestination.GOOGLE_CALENDAR);
export const EXPECTED_GOOGLE_EVENT_SYNC_CONFIG = createExpectedEventSyncConfig(EventSyncDestination.GOOGLE_CALENDAR);
export const createGoogleEventPayload = (
  params: Omit<Parameters<typeof createCalendarEventPayload>[0], 'destination'>
) => createCalendarEventPayload({ ...params, destination: EventSyncDestination.GOOGLE_CALENDAR });

// Convenience exports for Outlook Calendar
export const OUTLOOK_EVENT_CONFIGS = createEventConfigs(EventSyncDestination.OUTLOOK_CALENDAR);
export const EXPECTED_OUTLOOK_EVENT_SYNC_CONFIG = createExpectedEventSyncConfig(EventSyncDestination.OUTLOOK_CALENDAR);
export const createOutlookEventPayload = (
  params: Omit<Parameters<typeof createCalendarEventPayload>[0], 'destination'>
) => createCalendarEventPayload({ ...params, destination: EventSyncDestination.OUTLOOK_CALENDAR });

// Legacy exports for backward compatibility (can be removed after migration)
export const EVENT_CONFIGS = GOOGLE_EVENT_CONFIGS;
export const EXPECTED_EVENT_SYNC_CONFIG = EXPECTED_GOOGLE_EVENT_SYNC_CONFIG;
export const createEventPayload = createGoogleEventPayload;
