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
    const res = await fetch(
      'https://login.microsoftonline.com/5453c757-2f8c-44c5-b46d-0ba5595986ca/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: 'eefb9abf-901e-458c-ba08-33c1f4851e03',
          grant_type: 'refresh_token',
          refresh_token:
            '1.AXwAV8dTVIwvxUS0bQulWVmGyr-a--4ekIxFuggzwfSFHgPMADl8AA.BQABAwEAAAADAOz_BQD0_1GOnFxGNJWSGL10oPq62pi675hUzAbLx0pPPRLAaZ63QGOq4-qXE3GMCWlb1eyvAKGGXFqIAxEoNbFZ9yWXkLBI_acAjPamjh6yPKfIYdFalpgboo75PbHv4BgAx28nyRRPoZWW7pJ6MjCION1tfndBlnYz-ylFWPMpE_vy3c8gIm4z8v16DUXUpAU6T-kvrUnwMw89eJKPBJbAu_hwdhlvAvJy6utWdeK6xg1TBj1c5__maIBz0xkB1wjyG6_mNlY7aM0ASZPZhjG5cv9lrbcr6aDpm_pXZmx2nT6G9WbOxeUDxsLx1h4Pd62qn5LDwflfZbJzkMeiwsjtRkqJ0W-A-0psIZHKX47hvQ5nx90bW7UkuRvlXzZ4X_QlPMDTuYr0TiG21QuBCm1nixiLqBBJbZhd84kGNJJRvPLKMU7DpKIko7dYAP1L4l1ocu6Dilvso7vvg95maHpAsl50tGm2-7kQ1xs08aI1mjzsLCMXILeiggI_D_uNvlt_fenESqtUjL6kq3eMnp9OC6cZQvlzQlO5A60JTIcPgQnG6oXxk_A-WWtUVDo-zSljCXjkEr0zzCodBONChqmK2sR4pEfJ1PZuN8Kmc_-w76jzTOI_nxSC4XJBuA7O0kbMpdrl56xcnt1Yk_QJvnUU8f7bq56GZ7a2Mc-5Zw4PEIbLL8fnPh8SkpAp_D-DT7VbLXDCnyCtHw270zZPSNQnU-uIYjFBJpQxsGsrTRj7tLbhfi-eFBcxWq5qp7PRyvqdZTtMi6siK4nhtm_QsMKbUEqBsEjsv-HSjPIyGH5roQRNXNWcQRqRzPhhYfNq2VZTpts5WKftoKwD2j0-hSOCUIRV6QX4fNRimWmrUJXb2VBGNBwdJHUNnhLLAMeTLeteGhRakt3gCYff2ZxGloO_x7SoanS9l4HhPEunNCrWRvyp6iGjf5Fj8jcZAGH36hCtPHSN85CY72jdVpxaQ8VWHJHaMsIcXUbZzPGmnblBlVHTzHdlb_29pT8nFf_Dbot9L3NCbrzFzg1pUrrR-6uOPk_ZYIl1nVhTP0MEfHrZQGI1Co9sa2fmR6uGUiNebb1YsvmrA1BqiONKCJAVg9u_Rtx2XZ_l__lyPie4YJPbLRg8GZ1bSY2pq8EFySWtvqV41h4Afx4g0WWHMVPX2x3TwW5j9TYLk9GX1safu9yAGQOErZ9SfGXuK0bdvTo4Jg_zlG0OuVijxm7pFwMbws26jgBOcJmr2Qs-gw8MCV7T6gT74Wmtrrq-YlDwd9luvwFixG4jQUDRyoIeceh4mtF1pfMUzF4S1CmyTlaNwvnEr5NYls9OACeoIQRkFuC5UqWq2BJHYXxfnJ_Tp_Xz3vL-1g1XmPFQhroTRc3qsn8QVTJ0-iLRnOJhJ3d84SO-pdl_0mJqcWhDBsG_bYw',
          client_secret: 'f.H8Q~rkwZvmh4a7F2YBLOIyVBrT3CMK4tKdpcL-',
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
