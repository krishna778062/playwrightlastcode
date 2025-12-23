import { expect } from '@playwright/test';
import https from 'https';
import Mailosaur from 'mailosaur';
import { Message } from 'mailosaur/lib/models';

export class EmailUtils {
  readonly mailosaurClient: Mailosaur;
  private static sslConfigured = false;

  constructor(
    readonly mailosaurApiKey: string,
    readonly mailosaurServerId: string
  ) {
    if (!!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
      throw new Error('MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID must be set');
    }
    // Configure SSL at process level to handle certificate issues
    // This is necessary because Mailosaur SDK doesn't support custom HTTPS agents
    // Only configure once to avoid multiple configurations
    if (!EmailUtils.sslConfigured) {
      // For test environments, handle SSL certificate issues that may occur due to:
      // - Corporate proxies/firewalls intercepting SSL
      // - Missing CA certificates
      // - Self-signed certificates
      // Check if NODE_TLS_REJECT_UNAUTHORIZED is explicitly set to '0' or if IGNORE_TLS is set
      const shouldIgnoreTLS = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' || process.env.IGNORE_TLS === '1';

      if (shouldIgnoreTLS) {
        // Create a custom HTTPS agent that doesn't reject unauthorized certificates
        const httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        });
        // Set as default for all HTTPS requests
        https.globalAgent = httpsAgent;
        EmailUtils.sslConfigured = true;
        console.log('SSL certificate verification disabled for Mailosaur API calls (test environment only)');
      }
    }

    this.mailosaurClient = new Mailosaur(mailosaurApiKey);
  }

  /**
   * Get a message from Mailosaur
   * @param params - The parameters for the email
   * @param params.sentTo - The email address to get the email from
   * @param params.sentFrom - The email address of the sender
   * @param params.subject - The subject of the email
   * @param params.body - The body of the email
   * @param params.receivedAfter - The date to start searching for messages from
   * @param params.timeout - The timeout for the search
   * Note: By default searches only look for messages received in the last hour. To look back further in your message history, if you want to look further back than this, just set the 'received after' parameter.
   * @returns The message object
   * @example
   * const message = await emailUtils.getMessage({
   *   sentTo: 'green@bie7v7vm.mailosaur.net',
   *   sentFrom: 'support@mailosaur.net',
   *   subject: 'Test email',
   *   body: 'Test email body',
   *   receivedAfter: new Date('2025-11-05'),
   *   timeout: 10000,
   * });
   */
  async getMessage(params: {
    sentTo: string;
    sentFrom?: string;
    subject?: string;
    body?: string;
    receivedAfter?: Date;
    timeout?: number;
  }): Promise<Message> {
    return this.mailosaurClient.messages.get(
      this.mailosaurServerId,
      {
        sentTo: params.sentTo,
        sentFrom: params.sentFrom,
        subject: params.subject,
        body: params.body,
      },
      {
        receivedAfter: params.receivedAfter,
        timeout: params.timeout,
      }
    );
  }

  /**
   * Generate a unique email address
   * @param prefix - The prefix for the email address
   * @returns The unique email address
   */
  async generateUniqueEmailAddress(prefix: string = 'test'): Promise<string> {
    return `${prefix}.${Date.now()}@${this.mailosaurServerId}.mailosaur.net`;
  }

  /**
   * Verify an email is in the inbox with this subject
   * @param emailAddress - The email address to verify
   * @param subject - The subject to verify
   * @returns The message object
   */
  async verifyEmailIsInInboxWithThisSubject(params: { sentTo: string; subject: string }): Promise<void> {
    try {
      const message = await this.getMessage({ sentTo: params.sentTo, subject: params.subject, timeout: 10000 });
      console.log(message);
      expect(message, `Email with subject ${params.subject} not found in inbox`).toBeDefined();
    } catch (error) {
      console.error(`Email with subject ${params.subject} not found in inbox: ${error}`);
      throw error;
    }
  }
}
