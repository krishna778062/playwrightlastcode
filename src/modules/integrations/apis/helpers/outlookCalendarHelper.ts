import { getEnvVar } from '@core/utils/getEnvConfig';

export interface OutlookCalendarEvent {
  id?: string;
  subject?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
  location?: {
    displayName?: string;
  };
  body?: {
    content?: string;
    contentType?: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    status: {
      response: 'accepted' | 'declined' | 'tentativelyAccepted' | 'notResponded';
      time?: string;
    };
  }>;
}

export interface OutlookCalendarConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class OutlookCalendarHelper {
  private static readonly MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private static readonly GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

  private config: OutlookCalendarConfig;
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  constructor(userType: 'APP_MANAGER' | 'END_USER' = 'APP_MANAGER') {
    const prefix = userType === 'APP_MANAGER' ? 'OUTLOOK' : 'END_USER_OUTLOOK';

    this.config = {
      clientId: getEnvVar(`${prefix}_CLIENT_ID`, true)!,
      clientSecret: getEnvVar(`${prefix}_CLIENT_SECRET`, true)!,
      refreshToken: getEnvVar(`${prefix}_REFRESH_TOKEN`, true)!,
    };

    // Debug logging to verify tokens are loaded correctly
    console.log(`🔧 Outlook Calendar Config for ${userType}:`);
    console.log(`   Client ID: ${this.config.clientId}`);
    console.log(`   Client Secret: ${this.config.clientSecret?.substring(0, 10)}...`);
    console.log(`   Refresh Token: ${this.config.refreshToken?.substring(0, 50)}...`);
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiryTime) {
      console.log(`🔑 Using cached Outlook Calendar access token`);
      return this.accessToken;
    }

    // Check if we have a direct access token in environment (for testing)
    const directAccessToken = getEnvVar('OUTLOOK_ACCESS_TOKEN', false);
    if (directAccessToken) {
      console.log(`🔑 Using direct Outlook Calendar access token from environment`);
      this.accessToken = directAccessToken;
      this.tokenExpiryTime = Date.now() + 3600 * 1000; // 1 hour from now
      return this.accessToken;
    }

    console.log(`🔄 Refreshing Outlook Calendar access token...`);
    console.log(`🔧 Using Client ID: ${this.config.clientId}`);
    console.log(`🔧 Using Refresh Token (first 50 chars): ${this.config.refreshToken.substring(0, 50)}...`);

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
      // Don't specify scope - use the original scope from the refresh token
    });

    const res = await fetch(OutlookCalendarHelper.MICROSOFT_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`❌ Outlook token exchange failed:`, data);
      throw new Error(`Outlook token exchange failed: ${JSON.stringify(data)}`);
    }

    // Cache the token with 1 minute buffer before expiry
    this.accessToken = data.access_token;
    this.tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000;
    console.log(`✅ Successfully obtained Outlook Calendar access token`);

    return this.accessToken!;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${OutlookCalendarHelper.GRAPH_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Outlook Calendar API error: ${errorText}`);
    }

    return response.json();
  }

  async findEvents(eventTitle: string, calendarId = 'primary'): Promise<OutlookCalendarEvent[]> {
    const now = new Date();
    const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
      startDateTime: timeMin,
      endDateTime: timeMax,
      $filter: `contains(subject,'${eventTitle}')`,
      $orderby: 'start/dateTime',
    });

    console.log(`🔍 Searching Outlook Calendar for events containing: "${eventTitle}"`);

    // Use /me/events for primary calendar or /me/calendars/{id}/events for specific calendar
    const endpoint =
      calendarId === 'primary'
        ? `/me/events?${params}`
        : `/me/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

    const data = await this.makeRequest(endpoint);
    const events = data.value || [];

    console.log(`📅 Found ${events.length} total events in calendar`);
    const matchingEvents = events.filter(
      (event: any) => event.subject && event.subject.includes(eventTitle)
    ) as OutlookCalendarEvent[];

    console.log(`🎯 Found ${matchingEvents.length} events matching "${eventTitle}"`);
    if (matchingEvents.length > 0) {
      console.log(
        `✅ Matching events:`,
        matchingEvents.map(e => ({ id: e.id, subject: e.subject }))
      );
    }

    return matchingEvents;
  }

  async rsvpToEvent(
    calendarId: string,
    eventId: string,
    email: string,
    status: 'accepted' | 'declined' | 'tentativelyAccepted'
  ): Promise<any> {
    // For Outlook, we need to respond to the event invitation
    const responseEndpoint = `/me/events/${eventId}/accept`;

    let endpoint: string;
    const body: any = {};

    switch (status) {
      case 'accepted':
        endpoint = `/me/events/${eventId}/accept`;
        break;
      case 'declined':
        endpoint = `/me/events/${eventId}/decline`;
        break;
      case 'tentativelyAccepted':
        endpoint = `/me/events/${eventId}/tentativelyAccept`;
        break;
      default:
        throw new Error(`Invalid RSVP status: ${status}`);
    }

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
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
  ): Promise<{ found: boolean; event?: OutlookCalendarEvent; attempts: number }> {
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
    event?: OutlookCalendarEvent;
    attempts: number;
    mismatches?: string[];
  }> {
    const { maxAttempts = 8, retryDelayMs = 10000, calendarId = 'primary' } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);

      if (matchingEvents.length > 0) {
        const foundEvent = matchingEvents[0];
        const mismatches: string[] = [];

        if (expectedDetails.title && foundEvent.subject !== expectedDetails.title) {
          mismatches.push(`Title mismatch: expected "${expectedDetails.title}", got "${foundEvent.subject}"`);
        }

        if (expectedDetails.description) {
          const actualDescription = foundEvent.body?.content || '';
          if (!actualDescription.includes(expectedDetails.description)) {
            mismatches.push(
              `Description mismatch: expected to contain "${expectedDetails.description}", got "${actualDescription}"`
            );
          }
        }

        if (expectedDetails.location && foundEvent.location?.displayName !== expectedDetails.location) {
          mismatches.push(
            `Location mismatch: expected "${expectedDetails.location}", got "${foundEvent.location?.displayName || 'N/A'}"`
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

export const createAppManagerOutlookCalendarHelper = () => new OutlookCalendarHelper('APP_MANAGER');
export const createEndUserOutlookCalendarHelper = () => new OutlookCalendarHelper('END_USER');

export const getOutlookAccessToken = async (): Promise<string> => {
  const helper = createAppManagerOutlookCalendarHelper();
  return helper.getAccessToken();
};

export const getEndUserOutlookAccessToken = async (): Promise<string> => {
  const helper = createEndUserOutlookCalendarHelper();
  return helper.getAccessToken();
};

export const findEventOnOutlookCalendar = async (
  eventTitle: string,
  accessToken: string,
  calendarId = 'primary'
): Promise<OutlookCalendarEvent[]> => {
  const helper = createAppManagerOutlookCalendarHelper();
  return helper.findEvents(eventTitle, calendarId);
};

export const rsvpOutlookEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
  email: string,
  status: 'accepted' | 'declined' | 'tentativelyAccepted'
) => {
  // Note: accessToken parameter is ignored for backward compatibility
  // The helper manages its own tokens
  const helper = createAppManagerOutlookCalendarHelper();
  return helper.rsvpToEvent(calendarId, eventId, email, status);
};

export const verifyOutlookEventSyncWithRetry = async (
  eventTitle: string,
  accessToken: string,
  options: {
    maxAttempts?: number;
    retryDelayMs?: number;
    calendarId?: string;
    waitFunction?: (ms: number) => Promise<void>;
    expectFound?: boolean;
  } = {}
): Promise<{ found: boolean; event?: OutlookCalendarEvent; attempts: number }> => {
  // Note: accessToken parameter is ignored for backward compatibility
  // The helper manages its own tokens
  const helper = createAppManagerOutlookCalendarHelper();
  return helper.verifyEventSyncWithRetry(eventTitle, options);
};

export const verifyEventDetailsInOutlookCalendar = async (
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
  event?: OutlookCalendarEvent;
  attempts: number;
  mismatches?: string[];
}> => {
  // Note: accessToken parameter is ignored for backward compatibility
  // The helper manages its own tokens
  const helper = createAppManagerOutlookCalendarHelper();
  return helper.verifyEventDetailsWithRetry(eventTitle, expectedDetails, options);
};

// Event configuration assertion functions for Outlook
export function assertOutlookEventSyncConfiguration(
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

export function assertOutlookRsvpConfiguration(
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

export function assertCompleteOutlookEventConfiguration(
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
  assertOutlookEventSyncConfiguration(eventResult, config.eventSync);
  assertOutlookRsvpConfiguration(eventResult, config.rsvp);
}
