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

export async function rsvpEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  email: string,
  status: 'accepted' | 'declined' | 'tentative'
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attendees: [{ email, responseStatus: status }],
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`RSVP failed: ${errorText}`);
  }

  return await res.json();
}

export async function getGoogleAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: getEnvVar('GOOGLE_CALENDAR_CLIENT_ID', true)!,
    client_secret: getEnvVar('GOOGLE_CALENDAR_CLIENT_SECRET', true)!,
    refresh_token: getEnvVar('GOOGLE_CALENDAR_REFRESH_TOKEN', true)!,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
}

export async function getEndUserGoogleAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: getEnvVar('END_USER_GOOGLE_CALENDAR_CLIENT_ID', true)!,
    client_secret: getEnvVar('END_USER_GOOGLE_CALENDAR_CLIENT_SECRET', true)!,
    refresh_token: getEnvVar('END_USER_GOOGLE_CALENDAR_REFRESH_TOKEN', true)!,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`End User Google token exchange failed: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
}

export async function findEventOnGoogleCalendar(
  eventTitle: string,
  accessToken: string,
  calendarId = 'primary'
): Promise<GoogleCalendarEvent[]> {
  const now = new Date();
  const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('q', eventTitle);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${await res.text()}`);
  }

  const data = await res.json();
  const events = data.items || [];

  return events.filter((event: any) => event.summary && event.summary.includes(eventTitle)) as GoogleCalendarEvent[];
}

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

export async function verifyEventSyncWithRetry(
  eventTitle: string,
  accessToken: string,
  options: {
    maxAttempts?: number;
    retryDelayMs?: number;
    calendarId?: string;
    waitFunction?: (ms: number) => Promise<void>;
    expectFound?: boolean;
  } = {}
): Promise<{ found: boolean; event?: GoogleCalendarEvent; attempts: number }> {
  const {
    maxAttempts = 10,
    retryDelayMs = 12000,
    calendarId = 'primary',
    waitFunction = ms => new Promise(resolve => setTimeout(resolve, ms)),
    expectFound = true,
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const matchingEvents = await findEventOnGoogleCalendar(eventTitle, accessToken, calendarId);
    const eventFound = matchingEvents.length > 0;

    if (eventFound === expectFound) {
      return {
        found: eventFound,
        event: eventFound ? matchingEvents[0] : undefined,
        attempts: attempt,
      };
    }

    if (attempt < maxAttempts) {
      await waitFunction(retryDelayMs);
    }
  }

  return { found: !expectFound, attempts: maxAttempts };
}

export async function verifyEventDetailsInGoogleCalendar(
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
}> {
  const {
    maxAttempts = 10,
    retryDelayMs = 12000,
    calendarId = 'primary',
    waitFunction = ms => new Promise(resolve => setTimeout(resolve, ms)),
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const matchingEvents = await findEventOnGoogleCalendar(eventTitle, accessToken, calendarId);

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
      await waitFunction(retryDelayMs);
    }
  }

  return {
    found: false,
    detailsMatched: false,
    attempts: maxAttempts,
  };
}
