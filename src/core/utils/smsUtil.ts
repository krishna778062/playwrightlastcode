import Mailosaur from 'mailosaur';

export class OTPUtils {
  private mailosaurClient: Mailosaur;

  constructor(
    private mailosaurApiKey: string,
    private mailosaurServerId: string
  ) {
    this.mailosaurClient = new Mailosaur(mailosaurApiKey);
  }

  /**
   * Retrieve OTP from SMS received by Mailosaur phone number
   */
  async getOTPFromSMS(phoneNumber: string): Promise<string> {
    const sms = await this.mailosaurClient.messages.get(
      this.mailosaurServerId,
      { sentTo: phoneNumber },
      { timeout: 30000 }
    );

    const otpMatch = sms.text?.body?.match(/\d{6}/);

    if (!otpMatch) throw new Error('OTP not found in SMS body');

    return otpMatch[0];
  }

  /**
   * Retrieve OTP from email received by Mailosaur email address
   */
  async getOTPFromEmail(emailAddress: string): Promise<string> {
    const email = await this.mailosaurClient.messages.get(
      this.mailosaurServerId,
      { sentTo: emailAddress },
      { timeout: 30000 }
    );

    const otpMatch = email.html?.body?.match(/<p[^>]*>\s*Verification code\s*<\/p>\s*<h1[^>]*>(\d{6})<\/h1>/i);

    if (!otpMatch) throw new Error('OTP not found in email body');

    return otpMatch[1];
  }

  /**
   * Generate Mailosaur test email address
   */
  generateTestEmail(prefix: string = 'test'): string {
    return `${prefix}.${Date.now()}@${this.mailosaurServerId}.mailosaur.net`;
  }
}
