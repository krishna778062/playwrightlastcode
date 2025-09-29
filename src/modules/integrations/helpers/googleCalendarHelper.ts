import { getEnvVar } from '@core/utils/getEnvConfig';

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

    console.log(`🔍 Searching Google Calendar for events containing: "${eventTitle}"`);
    const data = await this.makeRequest(`/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
    const events = data.items || [];

    console.log(`📅 Found ${events.length} total events in calendar`);
    const matchingEvents = events.filter(
      (event: any) => event.summary && event.summary.includes(eventTitle)
    ) as GoogleCalendarEvent[];

    console.log(`🎯 Found ${matchingEvents.length} events matching "${eventTitle}"`);
    if (matchingEvents.length > 0) {
      console.log(
        `✅ Matching events:`,
        matchingEvents.map(e => ({ id: e.id, summary: e.summary }))
      );
    }

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

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);
      const eventFound = matchingEvents.length > 0;

      if (eventFound === expectFound) {
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

    return { found: !expectFound, attempts: maxAttempts };
  }

  async verifyEventDetailsWithRetry(
    eventTitle: string,
    expectedDetails: {
      title?: string;
      description?: string;
      location?: string;
    },
    options: {
      maxAttempts?: number;
      retryDelayMs?: number;
      calendarId?: string;
    } = {}
  ): Promise<{
    found: boolean;
    detailsMatched: boolean;
    event?: GoogleCalendarEvent;
    attempts: number;
    mismatches?: string[];
  }> {
    const { maxAttempts = 8, retryDelayMs = 10000, calendarId = 'primary' } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);

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

        if (mismatches.length === 0) {
          return {
            found: true,
            detailsMatched: true,
            event: foundEvent,
            attempts: attempt,
          };
        }
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }

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
  },
  accessToken: string,
  options: {
    maxAttempts?: number;
    retryDelayMs?: number;
    calendarId?: string;
    waitFunction?: (ms: number) => Promise<void>;
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
