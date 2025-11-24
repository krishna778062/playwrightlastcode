import { getEnvVar } from '@core/utils/getEnvConfig';

/**
 * Google Calendar Integration Credentials
 */
export const GOOGLE_CALENDAR_USERS = {
  APP_MANAGER: {
    email: 'howard.nelson@simpplr.dev',
    password: 'Simpplr@1220169',
  },
  END_USER: {
    email: 'craig.gordon@simpplr.dev',
    password: '_Simp_1234',
  },
};

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  description?: string;
  organizer?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  attendees?: Array<{
    email: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
}

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class GoogleCalendarHelper {
  private static readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

  private config: GoogleCalendarConfig;
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  constructor(userType: 'APP_MANAGER' | 'END_USER' = 'APP_MANAGER') {
    const prefix = userType === 'APP_MANAGER' ? 'GOOGLE_CALENDAR' : 'END_USER_GOOGLE_CALENDAR';

    this.config = {
      clientId: getEnvVar(`${prefix}_CLIENT_ID`, true)!,
      clientSecret: getEnvVar(`${prefix}_CLIENT_SECRET`, true)!,
      refreshToken: getEnvVar(`${prefix}_REFRESH_TOKEN`, true)!,
    };
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiryTime) {
      console.log(`🔑 Using cached Google Calendar access token`);
      return this.accessToken;
    }

    console.log(`🔄 Refreshing Google Calendar access token...`);
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
    });

    const res = await fetch(GoogleCalendarHelper.GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`❌ Google token exchange failed:`, data);
      throw new Error(`Google token exchange failed: ${JSON.stringify(data)}`);
    }

    // Cache the token with 1 minute buffer before expiry
    this.accessToken = data.access_token;
    this.tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000;
    console.log(`✅ Successfully obtained Google Calendar access token`);

    return this.accessToken!;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${GoogleCalendarHelper.CALENDAR_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar API error: ${errorText}`);
    }

    return response.json();
  }

  async findEvents(eventTitle: string, calendarId = 'primary'): Promise<GoogleCalendarEvent[]> {
    const now = new Date();
    const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      q: eventTitle,
    });

    const data = await this.makeRequest(`/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
    const events = data.items || [];
    const matchingEvents = events.filter((event: any) => event.summary?.includes(eventTitle)) as GoogleCalendarEvent[];

    return matchingEvents;
  }

  async rsvpToEvent(
    calendarId: string,
    eventId: string,
    email: string,
    status: 'accepted' | 'declined' | 'tentative'
  ): Promise<any> {
    return this.makeRequest(`/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        attendees: [{ email, responseStatus: status }],
      }),
    });
  }

  async verifyEventSyncWithRetry(
    eventTitle: string,
    options: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
      expectFound?: boolean;
    } = {}
  ): Promise<{ found: boolean; event?: GoogleCalendarEvent; attempts: number }> {
    const { maxAttempts = 8, retryDelayMs = 10000, calendarId = 'primary', expectFound = true } = options;

    console.log(`[Google Calendar] Searching "${eventTitle}" - expect ${expectFound ? 'found' : 'NOT found'}`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);
      const eventFound = matchingEvents.length > 0;

      console.log(`[Google Calendar] Attempt ${attempt}/${maxAttempts}: ${eventFound ? 'Found' : 'Not found'}`);

      if (eventFound === expectFound) {
        console.log(`[Google Calendar] ✅ SUCCESS after ${attempt} attempts`);
        return {
          found: eventFound,
          event: eventFound ? matchingEvents[0] : undefined,
          attempts: attempt,
        };
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }

    console.log(`[Google Calendar] ❌ FAILED after ${maxAttempts} attempts`);
    return { found: !expectFound, attempts: maxAttempts };
  }

  async verifyEventDetailsWithRetry(
    eventTitle: string,
    expectedDetails: {
      title?: string;
      description?: string;
      location?: string;
      author?: string;
    },
    options: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
      authorMatchBy?: 'email' | 'displayName' | 'both';
    } = {}
  ): Promise<{
    found: boolean;
    detailsMatched: boolean;
    event?: GoogleCalendarEvent;
    attempts: number;
    mismatches?: string[];
  }> {
    const { maxAttempts = 12, retryDelayMs = 10000, calendarId = 'primary', authorMatchBy = 'both' } = options;

    console.log(`[Google Calendar] Verifying details for "${eventTitle}"`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);

      console.log(
        `[Google Calendar] Attempt ${attempt}/${maxAttempts}: ${matchingEvents.length > 0 ? 'Found event' : 'No event'}`
      );

      if (matchingEvents.length > 0) {
        const foundEvent = matchingEvents[0];
        const mismatches: string[] = [];

        if (expectedDetails.title && foundEvent.summary !== expectedDetails.title) {
          mismatches.push(`Title mismatch: expected "${expectedDetails.title}", got "${foundEvent.summary}"`);
        }

        if (expectedDetails.description) {
          const actualDescription = foundEvent.description || '';
          if (!actualDescription.includes(expectedDetails.description)) {
            mismatches.push(
              `Description mismatch: expected to contain "${expectedDetails.description}", got "${actualDescription}"`
            );
          }
        }

        if (expectedDetails.location && foundEvent.location !== expectedDetails.location) {
          mismatches.push(
            `Location mismatch: expected "${expectedDetails.location}", got "${foundEvent.location || 'N/A'}"`
          );
        }

        if (expectedDetails.author) {
          if (!foundEvent.organizer) {
            mismatches.push('Author mismatch: organizer information is missing from event');
          } else {
            const organizerEmail = foundEvent.organizer.email?.toLowerCase() || '';
            const organizerDisplayName = foundEvent.organizer.displayName?.toLowerCase() || '';
            const expectedAuthorLower = expectedDetails.author.toLowerCase();

            console.log(
              `[Google Calendar] Author verification - Expected: "${expectedDetails.author}" (${authorMatchBy}), Got - Email: "${foundEvent.organizer.email || 'N/A'}", DisplayName: "${foundEvent.organizer.displayName || 'N/A'}"`
            );

            let authorMatched = false;

            if (authorMatchBy === 'email') {
              authorMatched = organizerEmail === expectedAuthorLower;
            } else if (authorMatchBy === 'displayName') {
              authorMatched = organizerDisplayName === expectedAuthorLower;
            } else {
              // authorMatchBy === 'both'
              authorMatched = organizerEmail === expectedAuthorLower || organizerDisplayName === expectedAuthorLower;
            }

            if (!authorMatched) {
              mismatches.push(
                `Author mismatch: expected "${expectedDetails.author}", got "${foundEvent.organizer.displayName || foundEvent.organizer.email || 'N/A'}" (Email: ${organizerEmail}, DisplayName: ${organizerDisplayName})`
              );
            }
          }
        }

        if (mismatches.length === 0) {
          console.log(`[Google Calendar] ✅ All details match after ${attempt} attempts`);
          return {
            found: true,
            detailsMatched: true,
            event: foundEvent,
            attempts: attempt,
          };
        } else {
          console.log(`[Google Calendar] Details mismatch: ${mismatches.length} issues`);
          console.log(`[Google Calendar] Mismatch details:`, mismatches);
        }
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }

    console.log(`[Google Calendar] ❌ Details verification failed after ${maxAttempts} attempts`);
    return {
      found: false,
      detailsMatched: false,
      attempts: maxAttempts,
    };
  }
}

export const createAppManagerGoogleCalendarHelper = () => new GoogleCalendarHelper('APP_MANAGER');
export const createEndUserGoogleCalendarHelper = () => new GoogleCalendarHelper('END_USER');

export const getGoogleAccessToken = async (): Promise<string> => {
  const helper = createAppManagerGoogleCalendarHelper();
  return helper.getAccessToken();
};

export const getEndUserGoogleAccessToken = async (): Promise<string> => {
  const helper = createEndUserGoogleCalendarHelper();
  return helper.getAccessToken();
};

export const findEventOnGoogleCalendar = async (
  eventTitle: string,
  accessToken: string,
  calendarId = 'primary'
): Promise<GoogleCalendarEvent[]> => {
  const helper = createAppManagerGoogleCalendarHelper();
  return helper.findEvents(eventTitle, calendarId);
};

export const rsvpEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
  email: string,
  status: 'accepted' | 'declined' | 'tentative'
) => {
  // Note: accessToken parameter is ignored for backward compatibility
  // The helper manages its own tokens
  const helper = createAppManagerGoogleCalendarHelper();
  return helper.rsvpToEvent(calendarId, eventId, email, status);
};

export const verifyEventSyncWithRetry = async (
  eventTitle: string,
  accessToken: string,
  options: {
    maxAttempts?: number;
    retryDelayMs?: number;
    calendarId?: string;
    waitFunction?: (ms: number) => Promise<void>;
    expectFound?: boolean;
  } = {}
): Promise<{ found: boolean; event?: GoogleCalendarEvent; attempts: number }> => {
  // Note: accessToken parameter is ignored for backward compatibility
  // The helper manages its own tokens
  const helper = createAppManagerGoogleCalendarHelper();
  return helper.verifyEventSyncWithRetry(eventTitle, options);
};

export const verifyEventDetailsInGoogleCalendar = async (
  eventTitle: string,
  expectedDetails: {
    title?: string;
    description?: string;
    location?: string;
    author?: string;
  },
  accessToken: string,
  options: {
    maxAttempts?: number;
    retryDelayMs?: number;
    calendarId?: string;
    waitFunction?: (ms: number) => Promise<void>;
    authorMatchBy?: 'email' | 'displayName' | 'both';
  } = {}
): Promise<{
  found: boolean;
  detailsMatched: boolean;
  event?: GoogleCalendarEvent;
  attempts: number;
  mismatches?: string[];
}> => {
  // Note: accessToken parameter is ignored for backward compatibility
  // The helper manages its own tokens
  const helper = createAppManagerGoogleCalendarHelper();
  return helper.verifyEventDetailsWithRetry(eventTitle, expectedDetails, options);
};

// Event configuration assertion functions
export function assertEventSyncConfiguration(
  eventResult: any,
  expectedConfig: {
    enabled: boolean;
    destination: string;
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
      destination: string;
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

export function assertEventSyncedToCalendar(eventSyncResult: any): void {
  const { expect } = require('@playwright/test');
  expect(eventSyncResult.found, 'Event should have been synced to Google Calendar').toBe(true);
}

export function assertEventRemovedFromCalendar(eventSyncResult: any): void {
  const { expect } = require('@playwright/test');
  expect(eventSyncResult.found, 'Event should have been removed from Google Calendar').toBe(false);
}
