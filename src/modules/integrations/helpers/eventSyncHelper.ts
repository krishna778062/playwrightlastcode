/**
 * Event Sync Helper
 *
 * Provides utilities for Event Sync integrations including:
 * - Google Calendar API integration with OAuth token management
 * - Outlook Calendar integration (future)
 * - Event search and verification across multiple calendar platforms
 * - RSVP status tracking and validation
 * - Retry logic for sync delays
 *
 * @author Test Automation Team
 */

// ========================================
// CALENDAR PLATFORM CONFIGURATIONS
// ========================================

// 🔑 Google Calendar OAuth credentials - App Manager (howard.nelson@simpplr.dev)
const GOOGLE_CLIENT_ID = '685076636922-hn6agrob6i281i169pve6j708d8o8377.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_REFRESH_TOKEN =
  '1//04NK3OXb5--o0CgYIARAAGAQSNwF-L9Ir9X22Aq07KhJoOr6GKcLAml09xOogMlq8YZ0edo6hEQxobe-CCT98j5Cl9yKAvjM_jBA';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// 🔑 End User Google Calendar OAuth credentials (craig.gordon@simpplr.dev)
const END_USER_GOOGLE_CLIENT_ID = '38539235084-kln2uin2cn2k1nvccbmeahuec42lk0a1.apps.googleusercontent.com';
const END_USER_GOOGLE_CLIENT_SECRET = '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';
const END_USER_GOOGLE_REFRESH_TOKEN =
  '1//04bbp561L3HanCgYIARAAGAQSNwF-L9IrlRVaLdNlo-TAVhq8l3crXUjGxaxwK4gADUkIgY-NVKXb50wpPPXL_MsHU8U9fkHgWpo';

// 🔑 Outlook Calendar OAuth credentials (future implementation)
// const OUTLOOK_CLIENT_ID = "";
// const OUTLOOK_CLIENT_SECRET = "";
// const OUTLOOK_REFRESH_TOKEN = "";
// const OUTLOOK_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

// ========================================
// INTERFACES & TYPES
// ========================================

/**
 * Interface for Google Calendar event data
 */
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

// ========================================
// GOOGLE CALENDAR FUNCTIONS
// ========================================

/**
 * RSVP event to Google Calendar
 *
 * @param accessToken - Google Calendar access token
 * @param calendarId - Calendar ID (default: 'primary')
 * @param eventId - Event ID
 * @param email - Email of the attendee
 * @param status - RSVP status
 */

/**
 * RSVP to a Google Calendar event with specified status
 *
 * @param accessToken - Google Calendar access token
 * @param calendarId - Calendar ID (default: 'primary')
 * @param eventId - Google Calendar event ID
 * @param email - Email address of the attendee
 * @param status - RSVP status ('accepted', 'declined', 'tentative')
 * @returns Promise<any> - Google Calendar API response
 */
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
    console.error(`❌ RSVP failed: ${errorText}`);
    throw new Error(`RSVP failed: ${errorText}`);
  }

  const result = await res.json();
  console.log(`✅ RSVP sent successfully to Google Calendar`);
  return result;
}

/**
 * Get Google Calendar access token using OAuth refresh token (App Manager)
 *
 * @returns Promise<string> - Access token for Google Calendar API
 * @throws Error if token exchange fails
 */
export async function getGoogleAccessToken(): Promise<string> {
  console.log('🔑 Getting App Manager Google Calendar access token...');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ App Manager Google access token obtained successfully');
  return data.access_token as string;
}

/**
 * Get End User Google Calendar access token using OAuth refresh token (craig.gordon@simpplr.dev)
 *
 * @returns Promise<string> - Access token for End User Google Calendar API
 * @throws Error if token exchange fails
 */
export async function getEndUserGoogleAccessToken(): Promise<string> {
  console.log('🔑 Getting End User Google Calendar access token...');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: END_USER_GOOGLE_CLIENT_ID,
    client_secret: END_USER_GOOGLE_CLIENT_SECRET,
    refresh_token: END_USER_GOOGLE_REFRESH_TOKEN,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`End User Google token exchange failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ End User Google access token obtained successfully');
  return data.access_token as string;
}

/**
 * Search for events in Google Calendar by title with RSVP status
 *
 * @param eventTitle - Title of the event to search for
 * @param accessToken - Google Calendar access token
 * @param calendarId - Calendar ID (default: 'primary')
 * @returns Promise<GoogleCalendarEvent[]> - Array of matching events
 */
export async function findEventOnGoogleCalendar(
  eventTitle: string,
  accessToken: string,
  calendarId = 'primary'
): Promise<GoogleCalendarEvent[]> {
  console.log(`🔍 Searching for event: "${eventTitle}" in Google Calendar...`);

  try {
    // Search for events in the last 24 hours and next 24 hours
    const now = new Date();
    const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('q', eventTitle); // Search by title

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Google Calendar API error: ${await res.text()}`);
    }

    const data = await res.json();
    const events = data.items || [];
    console.log(`📅 Found ${events.length} total events in time range`);

    // Filter events that match the title more precisely
    const matchingEvents = events.filter((event: any) => event.summary && event.summary.includes(eventTitle));

    if (matchingEvents.length > 0) {
      console.log(`✅ Found ${matchingEvents.length} matching events`);
      matchingEvents.forEach((event: any) => {
        console.log(`📋 Event: ${event.summary}`);
        console.log(`📅 Start: ${event.start?.dateTime || event.start?.date}`);

        if (event.attendees) {
          console.log(`👥 Attendees (${event.attendees.length}):`);
          event.attendees.forEach((attendee: any) => {
            console.log(`   - ${attendee.email}: ${attendee.responseStatus || 'needsAction'}`);
          });
        } else {
          console.log(`👥 No attendees/RSVP info found`);
        }
      });
    } else {
      console.log(`⏳ No events found matching "${eventTitle}"`);
    }

    return matchingEvents as GoogleCalendarEvent[];
  } catch (error) {
    console.error('❌ Error searching Google Calendar:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to search Google Calendar: ${errorMessage}`);
  }
}

// ========================================
// EVENT SYNC ASSERTION FUNCTIONS
// ========================================

/**
 * Assert event sync configuration details
 *
 * @param eventResult - Event creation result from API
 * @param expectedConfig - Expected sync configuration
 */
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
  console.log('🔍 Asserting Event Sync Configuration...');

  // Import expect dynamically to avoid issues
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

  console.log('✅ Event Sync Configuration assertions passed');
}

/**
 * Assert RSVP configuration details
 *
 * @param eventResult - Event creation result from API
 * @param expectedConfig - Expected RSVP configuration
 */
export function assertRsvpConfiguration(
  eventResult: any,
  expectedConfig: {
    hasRsvp: boolean;
    hasMaybeOption?: boolean;
    noteLabel?: string | null;
  }
): void {
  console.log('🔍 Asserting RSVP Configuration...');

  // Import expect dynamically to avoid issues
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

  console.log('✅ RSVP Configuration assertions passed');
}

/**
 * Assert complete event sync and RSVP configuration (convenience function)
 *
 * @param eventResult - Event creation result from API
 * @param config - Complete configuration to assert
 */
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
  console.log('🔍 Asserting Complete Event Configuration...');

  // Assert event sync configuration
  assertEventSyncConfiguration(eventResult, config.eventSync);

  // Assert RSVP configuration
  assertRsvpConfiguration(eventResult, config.rsvp);

  console.log('✅ Complete Event Configuration assertions passed');
}

// ========================================
// GENERIC EVENT SYNC VERIFICATION FUNCTIONS
// ========================================

/**
 * Verify event sync to Google Calendar with retry logic
 *
 * @param eventTitle - Title of the event to verify
 * @param accessToken - Google Calendar access token
 * @param options - Configuration options
 * @returns Promise<{ found: boolean; event?: GoogleCalendarEvent; attempts: number }>
 */
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

  console.log(`Verifying "${eventTitle}" - expecting ${expectFound ? 'found' : 'removed'}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const matchingEvents = await findEventOnGoogleCalendar(eventTitle, accessToken, calendarId);
      const eventFound = matchingEvents.length > 0;

      // Check if expectation is met
      if (eventFound === expectFound) {
        const message = expectFound ? 'Event found in Google Calendar' : 'Event removed from Google Calendar';
        console.log(`${message} (attempt ${attempt})`);
        return {
          found: eventFound,
          event: eventFound ? matchingEvents[0] : undefined,
          attempts: attempt,
        };
      }

      // Expectation not met, continue retrying
      const status = expectFound ? 'not found yet' : 'still exists';
      console.log(`Attempt ${attempt}/${maxAttempts}: Event ${status}, retrying...`);

      // Wait before next attempt (except on last attempt)
      if (attempt < maxAttempts) {
        await waitFunction(retryDelayMs);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error on attempt ${attempt}:`, errorMessage);
    }
  }

  // All attempts exhausted - return failure
  return { found: !expectFound, attempts: maxAttempts };
}

/**
 * Extract and log comprehensive event verification summary
 *
 * @param result - Result from verifyEventSyncWithRetry
 * @param eventTitle - Original event title for reference
 */
export function logEventVerificationSummary(
  result: { found: boolean; event?: GoogleCalendarEvent; attempts: number },
  eventTitle: string
): void {
  if (result.found && result.event) {
    console.log('🎉 SUCCESS: Event successfully synced to Google Calendar!');
    console.log(`📊 Verification Summary:`);
    console.log(`   ✅ Event found: ${result.event.summary}`);
    console.log(`   ✅ Sync verified: After ${result.attempts} attempts`);
    console.log(`   ✅ Time taken: ~${result.attempts * 12} seconds`);

    if (result.event.attendees && result.event.attendees.length > 0) {
      console.log(`   ✅ RSVP data: ${result.event.attendees.length} attendees found`);
    }
  } else {
    console.log('⚠️ INFO: Event was not found in Google Calendar within the retry period');
    console.log('💡 This could be normal due to:');
    console.log('   - Google Calendar sync delay (can take 5-15 minutes)');
    console.log('   - Calendar permissions or visibility settings');
    console.log('   - Network connectivity issues');
    console.log('   - Google API rate limiting');
    console.log(`   - Search performed: ${result.attempts} attempts for "${eventTitle}"`);
  }
}

/**
 * Verifies that an event's details match expected values in Google Calendar
 * @param eventTitle - The event title to search for
 * @param expectedDetails - Object containing expected values to verify
 * @param accessToken - Google Calendar access token
 * @param options - Configuration options
 * @returns Promise<{ found: boolean; detailsMatched: boolean; event?: GoogleCalendarEvent; attempts: number; mismatches?: string[] }>
 */
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

  console.log(`🔍 Starting Google Calendar event details verification for: "${eventTitle}"`);
  console.log(`📊 Configuration: ${maxAttempts} attempts, ${retryDelayMs / 1000}s intervals`);
  console.log('📝 Expected Details:');
  if (expectedDetails.title) console.log(`   📅 Title: "${expectedDetails.title}"`);
  if (expectedDetails.description) console.log(`   📄 Description: "${expectedDetails.description}"`);
  if (expectedDetails.location) console.log(`   📍 Location: "${expectedDetails.location}"`);

  let attempts = 0;

  for (let i = 0; i < maxAttempts; i++) {
    attempts++;
    console.log(`🔍 Attempt ${attempts}/${maxAttempts}: Verifying event details in Google Calendar...`);

    try {
      const matchingEvents = await findEventOnGoogleCalendar(eventTitle, accessToken, calendarId);

      if (matchingEvents.length > 0) {
        const foundEvent = matchingEvents[0];
        console.log('📋 Event found in Google Calendar, verifying details...');

        // Check for mismatches
        const mismatches: string[] = [];

        // Verify title
        if (expectedDetails.title && foundEvent.summary !== expectedDetails.title) {
          mismatches.push(`Title mismatch: expected "${expectedDetails.title}", got "${foundEvent.summary}"`);
        }

        // Verify description
        if (expectedDetails.description) {
          const actualDescription = foundEvent.description || '';
          if (!actualDescription.includes(expectedDetails.description)) {
            mismatches.push(
              `Description mismatch: expected to contain "${expectedDetails.description}", got "${actualDescription}"`
            );
          }
        }

        // Verify location
        if (expectedDetails.location && foundEvent.location !== expectedDetails.location) {
          mismatches.push(
            `Location mismatch: expected "${expectedDetails.location}", got "${foundEvent.location || 'N/A'}"`
          );
        }

        if (mismatches.length === 0) {
          console.log('✅ SUCCESS: All event details verified in Google Calendar!');
          console.log('📊 Details Verification Summary:');
          if (expectedDetails.title) console.log(`   ✅ Title: "${foundEvent.summary}"`);
          if (expectedDetails.description) console.log(`   ✅ Description verified successfully`);
          if (expectedDetails.location) console.log(`   ✅ Location: "${foundEvent.location}"`);
          console.log(`   ✅ Details verified after ${attempts} attempts`);

          return {
            found: true,
            detailsMatched: true,
            event: foundEvent,
            attempts,
          };
        } else {
          console.log('⚠️ Event found but details do not match expected values:');
          mismatches.forEach(mismatch => console.log(`   ❌ ${mismatch}`));
        }
      } else {
        console.log(`⏳ Event "${eventTitle}" not found in Google Calendar yet`);
      }

      // Wait before next attempt (only if not the last attempt)
      if (i < maxAttempts - 1) {
        console.log(`⏳ Waiting ${retryDelayMs / 1000} seconds before next attempt...`);
        await waitFunction(retryDelayMs);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error during attempt ${attempts}:`, errorMessage);

      if (i < maxAttempts - 1) {
        console.log(`⏳ Waiting ${retryDelayMs / 1000} seconds before retry...`);
        await waitFunction(retryDelayMs);
      }
    }
  }

  console.log('❌ FAILURE: Event details verification failed');
  console.log(`🔍 Completed ${attempts} verification attempts`);

  return {
    found: false,
    detailsMatched: false,
    attempts,
  };
}
