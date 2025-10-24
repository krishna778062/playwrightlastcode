# Integrations Module

## OTPAuth Library Usage

### Overview

We use the `otpauth` library to automate Time-based One-Time Password (TOTP) generation for 2FA authentication during integration testing, specifically for Atlassian Confluence login.

### Why OTPAuth?

- **Automated 2FA**: Bypasses manual 2FA code entry during test execution
- **Reliable**: Generates accurate TOTP codes based on the secret key
- **Time-synchronized**: Automatically handles time-based token generation
- **No Gmail API needed**: Eliminates dependency on email-based code retrieval

### Implementation

#### 1. Installation

```bash
npm install otpauth
```

#### 2. Configuration

Located in: `src/modules/integrations/apis/helpers/confluenceHelper.ts`

```typescript
import * as OTPAuth from 'otpauth';

// Confluence credentials with TOTP secret
const CONFLUENCE_CREDENTIALS = {
  username: 'developer@simpplr.com',
  password: 'Long@beach@8715',
  totpSecret: 'MATF2NBPEISVYVJ7JBVVETLGLZFXAYDH', // Base32 encoded secret
};

// Initialize TOTP generator
const confluenceTotp = new OTPAuth.TOTP({
  issuer: 'Atlassian',
  label: CONFLUENCE_CREDENTIALS.username,
  algorithm: 'SHA1', // Hash algorithm (SHA1, SHA256, SHA512)
  digits: 6, // Number of digits in OTP
  period: 30, // Time step in seconds (30s is standard)
  secret: CONFLUENCE_CREDENTIALS.totpSecret,
});
```

### How to Get TOTP Secret

1. **During 2FA Setup:**
   - When setting up 2FA for Atlassian, you'll see a QR code
   - Click "Can't scan the QR code?"
   - Copy the secret key (Base32 encoded string)
   - Example: `otpauth://totp/Atlassian:developer@simpplr.com?secret=MATF2NBPEISVYVJ7JBVVETLGLZFXAYDH&issuer=Atlassian`

2. **Extract the Secret:**
   - From the URI, extract the `secret` parameter
   - Store it securely in your configuration
