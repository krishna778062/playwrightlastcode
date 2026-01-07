/**
 * Constants for Login With OTP (LWO) messages used in frontline tests
 */
export const LWO_MESSAGES = {
  OPTIONAL_FORCE_ADD_CONTACT_HEADING:
    'We recommend adding a phone number or email to make login easier. You need to add at-least one of the asked details to enable login with OTP.',
  MANDATORY_FORCE_ADD_CONTACT_HEADING: 'Please add at-least one of the asked details to enable login with OTP.',
  MOBILE_NUMBER_FORCE_ADD_CONTACT_MESSAGE: 'Please add your Mobile number to enable login with OTP.',
  EMAIL_NUMBER_FORCE_ADD_CONTACT_MESSAGE: 'Please add your Email ID to enable login with OTP.',
  DONT_SHOW_THIS_AGAIN_MODAL_HEADER: 'Confirmation',
  DONT_SHOW_THIS_AGAIN_MODAL_BODY:
    'Once confirmed you wont be asked mobile number or email ID for setting up login with OTP. You can still add these details from your profile field if allowed by admin',
  INVALID_MOBILE_NUMBER_FORMAT_ERROR: 'Please check mobile number format',
  INVALID_MOBILE_NUMBER_WITHOUT_COUNTRY_CODE: '9675523848',
  // OTP verification error messages
  INCORRECT_VERIFICATION_CODE: 'Incorrect verification code',
  TWO_ATTEMPTS_REMAINING: 'Incorrect verification code. You have 2 attempts remaining.',
  ONE_ATTEMPT_REMAINING: 'Incorrect verification code. You have 1 attempt remaining.',
  ACCOUNT_LOCKED_30_MINUTES: 'Your account has been locked. Please try again in 30 minutes.',
  BLOCKED_FOR_30_MINUTES: 'Your account has been locked. Please try again in 30 minutes.',
  // OTP verification success messages
  VERIFICATION_CODE_SENT_TO_EMAIL: 'A verification code has been sent to your email',
  VERIFICATION_CODE_SENT_TO_MOBILE: 'A verification code has been sent to your mobile',
  // Resend OTP messages
  RESEND_WAIT_SECONDS_PATTERN: /You need to wait \d+ seconds? before you can request another verification code/,
  RESEND_WAIT_MINUTES_PATTERN: /You need to wait \d+ minutes? before you can request another verification code/,
  RESEND_LOCKED_30_MINUTES: 'You need to wait 30 minutes before you can request another verification code',
} as const;

/**
 * Timeout constants for OTP resend functionality (in milliseconds)
 */
export const OTP_RESEND_TIMEOUTS = {
  COOLDOWN_SECONDS: 14,
  LOCKOUT_MINUTES: 30, // Lockout duration after 3rd resend
  MAX_RESEND_ATTEMPTS: 2, // Number of resends allowed before lockout (3rd triggers lockout)
} as const;

/**
 * Constants for OTP test values used in validation testing
 */
export const OTP_TEST_VALUES = {
  INVALID_LENGTH_OTP: '12345', // 5-digit OTP to test button disabled state
  INCORRECT_OTP: '123456', // 6-digit incorrect OTP for error validation
  INVALID_MOBILE_NUMBER_WITHOUT_COUNTRY_CODE: '9675523848',
} as const;

export type LWOMessage = (typeof LWO_MESSAGES)[keyof typeof LWO_MESSAGES];
