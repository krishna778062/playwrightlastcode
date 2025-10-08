import {
  createAppManagerGoogleCalendarHelper,
  createEndUserGoogleCalendarHelper,
  GoogleCalendarEvent,
  GoogleCalendarHelper,
} from './googleCalendarHelper';
import {
  createAppManagerOutlookCalendarHelper,
  createEndUserOutlookCalendarHelper,
  OutlookCalendarEvent,
  OutlookCalendarHelper,
} from './outlookCalendarHelper';

import { EventSyncDestination } from '@/src/core/types/contentManagement.types';

// Generic calendar event interface
export interface CalendarEvent {
  id?: string;
  title?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  description?: string;
  attendees?: Array<{
    email: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction' | 'tentativelyAccepted' | 'notResponded';
  }>;
}

// Generic calendar helper interface
export interface ICalendarHelper {
  getAccessToken(): Promise<string>;
  findEvents(eventTitle: string, calendarId?: string): Promise<CalendarEvent[]>;
  rsvpToEvent(calendarId: string, eventId: string, email: string, status: string): Promise<any>;
  verifyEventSyncWithRetry(
    eventTitle: string,
    options?: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
      expectFound?: boolean;
    }
  ): Promise<{ found: boolean; event?: CalendarEvent; attempts: number }>;
  verifyEventDetailsWithRetry(
    eventTitle: string,
    expectedDetails: {
      title?: string;
      description?: string;
      location?: string;
    },
    options?: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
    }
  ): Promise<{
    found: boolean;
    detailsMatched: boolean;
    event?: CalendarEvent;
    attempts: number;
    mismatches?: string[];
  }>;
}

// Adapter classes to make Google and Outlook helpers conform to the generic interface
class GoogleCalendarAdapter implements ICalendarHelper {
  constructor(private helper: GoogleCalendarHelper) {}

  async getAccessToken(): Promise<string> {
    return this.helper.getAccessToken();
  }

  async findEvents(eventTitle: string, calendarId?: string): Promise<CalendarEvent[]> {
    const events = await this.helper.findEvents(eventTitle, calendarId);
    return events.map(this.convertGoogleEvent);
  }

  async rsvpToEvent(calendarId: string, eventId: string, email: string, status: string): Promise<any> {
    const googleStatus = status as 'accepted' | 'declined' | 'tentative';
    return this.helper.rsvpToEvent(calendarId, eventId, email, googleStatus);
  }

  async verifyEventSyncWithRetry(
    eventTitle: string,
    options?: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
      expectFound?: boolean;
    }
  ): Promise<{ found: boolean; event?: CalendarEvent; attempts: number }> {
    const result = await this.helper.verifyEventSyncWithRetry(eventTitle, options);
    return {
      ...result,
      event: result.event ? this.convertGoogleEvent(result.event) : undefined,
    };
  }

  async verifyEventDetailsWithRetry(
    eventTitle: string,
    expectedDetails: {
      title?: string;
      description?: string;
      location?: string;
    },
    options?: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
    }
  ): Promise<{
    found: boolean;
    detailsMatched: boolean;
    event?: CalendarEvent;
    attempts: number;
    mismatches?: string[];
  }> {
    const result = await this.helper.verifyEventDetailsWithRetry(eventTitle, expectedDetails, options);
    return {
      ...result,
      event: result.event ? this.convertGoogleEvent(result.event) : undefined,
    };
  }

  private convertGoogleEvent(event: GoogleCalendarEvent): CalendarEvent {
    return {
      id: event.id,
      title: event.summary,
      start: event.start,
      end: event.end,
      location: event.location,
      description: event.description,
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email,
        responseStatus: attendee.responseStatus,
      })),
    };
  }
}

class OutlookCalendarAdapter implements ICalendarHelper {
  constructor(private helper: OutlookCalendarHelper) {}

  async getAccessToken(): Promise<string> {
    return this.helper.getAccessToken();
  }

  async findEvents(eventTitle: string, calendarId?: string): Promise<CalendarEvent[]> {
    const events = await this.helper.findEvents(eventTitle, calendarId);
    return events.map(this.convertOutlookEvent);
  }

  async rsvpToEvent(calendarId: string, eventId: string, email: string, status: string): Promise<any> {
    const outlookStatus = status as 'accepted' | 'declined' | 'tentativelyAccepted';
    return this.helper.rsvpToEvent(calendarId, eventId, email, outlookStatus);
  }

  async verifyEventSyncWithRetry(
    eventTitle: string,
    options?: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
      expectFound?: boolean;
    }
  ): Promise<{ found: boolean; event?: CalendarEvent; attempts: number }> {
    const result = await this.helper.verifyEventSyncWithRetry(eventTitle, options);
    return {
      ...result,
      event: result.event ? this.convertOutlookEvent(result.event) : undefined,
    };
  }

  async verifyEventDetailsWithRetry(
    eventTitle: string,
    expectedDetails: {
      title?: string;
      description?: string;
      location?: string;
    },
    options?: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
    }
  ): Promise<{
    found: boolean;
    detailsMatched: boolean;
    event?: CalendarEvent;
    attempts: number;
    mismatches?: string[];
  }> {
    const result = await this.helper.verifyEventDetailsWithRetry(eventTitle, expectedDetails, options);
    return {
      ...result,
      event: result.event ? this.convertOutlookEvent(result.event) : undefined,
    };
  }

  private convertOutlookEvent(event: OutlookCalendarEvent): CalendarEvent {
    return {
      id: event.id,
      title: event.subject,
      start: {
        dateTime: event.start?.dateTime,
        timeZone: event.start?.timeZone,
      },
      end: {
        dateTime: event.end?.dateTime,
        timeZone: event.end?.timeZone,
      },
      location: event.location?.displayName,
      description: event.body?.content,
      attendees: event.attendees?.map(attendee => ({
        email: attendee.emailAddress.address,
        responseStatus: attendee.status.response,
      })),
    };
  }
}

// Factory function to create calendar helpers based on destination
export function createCalendarHelper(
  destination: EventSyncDestination,
  userType: 'APP_MANAGER' | 'END_USER' = 'APP_MANAGER'
): ICalendarHelper {
  switch (destination) {
    case EventSyncDestination.GOOGLE_CALENDAR:
      const googleHelper =
        userType === 'APP_MANAGER' ? createAppManagerGoogleCalendarHelper() : createEndUserGoogleCalendarHelper();
      return new GoogleCalendarAdapter(googleHelper);

    case EventSyncDestination.OUTLOOK_CALENDAR:
      const outlookHelper =
        userType === 'APP_MANAGER' ? createAppManagerOutlookCalendarHelper() : createEndUserOutlookCalendarHelper();
      return new OutlookCalendarAdapter(outlookHelper);

    default:
      throw new Error(`Unsupported calendar destination: ${destination}`);
  }
}

// Generic assertion functions
export function assertEventSyncConfiguration(
  eventResult: any,
  expectedConfig: {
    enabled: boolean;
    destination: EventSyncDestination;
    emailEnabled: boolean;
    invitees: string;
    syncStatus?: string;
  }
): void {
  const { expect } = require('@playwright/test');

  expect(eventResult.eventSyncDetails, 'Event sync details should be defined').toBeDefined();
  expect(eventResult.eventSyncDetails.enabled, 'Event sync should be enabled as expected').toBe(expectedConfig.enabled);
  expect(eventResult.eventSyncDetails.destination, 'Event sync destination should match expected').toBe(
    expectedConfig.destination
  );
  expect(eventResult.eventSyncDetails.emailEnabled, 'Email invitation should be enabled as expected').toBe(
    expectedConfig.emailEnabled
  );
  expect(eventResult.eventSyncDetails.invitees, 'Event sync invitees should match expected').toBe(
    expectedConfig.invitees
  );

  if (expectedConfig.syncStatus) {
    expect(eventResult.eventSyncDetails.syncStatus, 'Sync status should match expected').toBe(
      expectedConfig.syncStatus
    );
  }
}

export function assertRsvpConfiguration(
  eventResult: any,
  expectedConfig: {
    hasRsvp: boolean;
    hasMaybeOption?: boolean;
    noteLabel?: string | null;
  }
): void {
  const { expect } = require('@playwright/test');

  expect(eventResult.hasRsvp, 'Event should have RSVP as expected').toBe(expectedConfig.hasRsvp);

  if (expectedConfig.hasRsvp) {
    expect(eventResult.rsvpDetails, 'RSVP details should be defined when RSVP is enabled').toBeDefined();

    if (expectedConfig.hasMaybeOption !== undefined) {
      expect(eventResult.rsvpDetails.hasMaybeOption, 'RSVP maybe option should match expected').toBe(
        expectedConfig.hasMaybeOption
      );
    }

    if (expectedConfig.noteLabel !== undefined) {
      expect(eventResult.rsvpDetails.noteLabel, 'RSVP note label should match expected').toBe(expectedConfig.noteLabel);
    }
  }
}

export function assertCompleteEventConfiguration(
  eventResult: any,
  config: {
    eventSync: {
      enabled: boolean;
      destination: EventSyncDestination;
      emailEnabled: boolean;
      invitees: string;
      syncStatus?: string;
    };
    rsvp: {
      hasRsvp: boolean;
      hasMaybeOption?: boolean;
      noteLabel?: string | null;
    };
  }
): void {
  assertEventSyncConfiguration(eventResult, config.eventSync);
  assertRsvpConfiguration(eventResult, config.rsvp);
}
