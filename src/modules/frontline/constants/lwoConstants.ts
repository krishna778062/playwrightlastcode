/**
 * Constants for Login With OTP (LWO) messages used in frontline tests
 */
export const LWO_MESSAGES = {
  OPTIONAL_FORCE_ADD_CONTACT_HEADING:
    'We recommend adding a phone number or email to make login easier. You need to add at-least one of the asked details to enable login with OTP.',
  MANDATORY_FORCE_ADD_CONTACT_HEADING: 'Please add at-least one of the asked details to enable login with OTP.',
  MOBILE_NUMBER_FORCE_ADD_CONTACT_MESSAGE: 'Please add your Mobile number to enable login with OTP.',
  EMAIL_NUMBER_FORCE_ADD_CONTACT_MESSAGE: 'Please add your Email address to enable login with OTP.',
} as const;

export type LWOMessage = (typeof LWO_MESSAGES)[keyof typeof LWO_MESSAGES];
