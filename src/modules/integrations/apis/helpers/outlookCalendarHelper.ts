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

export class OutlookCalendarHelper {
  private static readonly GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }

    // Get credentials from environment variables
    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;
    const refreshToken = process.env.OUTLOOK_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        '❌ Missing required Outlook Calendar environment variables: OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, OUTLOOK_REFRESH_TOKEN'
      );
    }

    const res = await fetch(
      'https://login.microsoftonline.com/5453c757-2f8c-44c5-b46d-0ba5595986ca/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_secret: clientSecret,
          redirect_uri: 'https://localhost:3000/auth/callback',
          scope: 'offline_access Calendars.ReadWrite',
        }),
      }
    );

    const data: any = await res.json();

    if (!res.ok) {
      console.error(`❌ Outlook token refresh failed:`, data);
      throw new Error(`Outlook token refresh failed: ${JSON.stringify(data)}`);
    }

    // Cache the new token with 5 minute buffer before expiry
    this.accessToken = data.access_token;
    this.tokenExpiryTime = Date.now() + data.expires_in * 1000 - 300000; // 5 min buffer

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

    const endpoint =
      calendarId === 'primary'
        ? `/me/events?${params}`
        : `/me/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

    const data = await this.makeRequest(endpoint);
    const events = data.value || [];

    const matchingEvents = events.filter(
      (event: any) => event.subject && event.subject.includes(eventTitle)
    ) as OutlookCalendarEvent[];

    return matchingEvents;
  }

  async rsvpToEvent(
    calendarId: string,
    eventId: string,
    email: string,
    status: 'accepted' | 'declined' | 'tentativelyAccepted'
  ): Promise<any> {
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

    console.log(`[Outlook Calendar] Searching "${eventTitle}" - expect ${expectFound ? 'found' : 'NOT found'}`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);
      const eventFound = matchingEvents.length > 0;

      console.log(`[Outlook Calendar] Attempt ${attempt}/${maxAttempts}: ${eventFound ? 'Found' : 'Not found'}`);

      if (eventFound === expectFound) {
        console.log(`[Outlook Calendar] ✅ SUCCESS after ${attempt} attempts`);
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

    console.log(`[Outlook Calendar] ❌ FAILED after ${maxAttempts} attempts`);
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

    console.log(`[Outlook Calendar] Verifying details for "${eventTitle}"`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const matchingEvents = await this.findEvents(eventTitle, calendarId);

      console.log(
        `[Outlook Calendar] Attempt ${attempt}/${maxAttempts}: ${matchingEvents.length > 0 ? 'Found event' : 'No event'}`
      );

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
          console.log(`[Outlook Calendar] ✅ All details match after ${attempt} attempts`);
          return {
            found: true,
            detailsMatched: true,
            event: foundEvent,
            attempts: attempt,
          };
        } else {
          console.log(`[Outlook Calendar] Details mismatch: ${mismatches.length} issues`);
        }
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }

    console.log(`[Outlook Calendar] ❌ Details verification failed after ${maxAttempts} attempts`);
    return {
      found: false,
      detailsMatched: false,
      attempts: maxAttempts,
    };
  }

  static assertEventSyncConfiguration(
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
    expect(eventResult.eventSyncDetails.enabled, 'Event sync should be enabled as expected').toBe(
      expectedConfig.enabled
    );
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

  static assertRsvpConfiguration(
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
        expect(eventResult.rsvpDetails.noteLabel, 'RSVP note label should match expected').toBe(
          expectedConfig.noteLabel
        );
      }
    }
  }

  static assertCompleteEventConfiguration(
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
    OutlookCalendarHelper.assertEventSyncConfiguration(eventResult, config.eventSync);
    OutlookCalendarHelper.assertRsvpConfiguration(eventResult, config.rsvp);
  }
}

export const createAppManagerOutlookCalendarHelper = () => new OutlookCalendarHelper();
