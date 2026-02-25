# GDPR Compliance

This boilerplate includes built-in GDPR compliance features: consent tracking, audit logs, data export, and account deletion. These features provide a foundation, but **application-specific customization is required** for full compliance.

---

## Table of Contents

- [Overview](#overview)
- [GDPR Features](#gdpr-features)
- [Consent Tracking](#consent-tracking)
- [Audit Log](#audit-log)
- [Data Export](#data-export)
- [Account Deletion](#account-deletion)
- [Privacy Policy](#privacy-policy)
- [Cookies](#cookies)
- [Customization Required](#customization-required)
- [API Reference](#api-reference)

---

## Overview

### What is GDPR?

The **General Data Protection Regulation (GDPR)** is a European Union regulation that requires organizations to:

1. **Obtain consent** before collecting personal data
2. **Provide transparency** about data collection and usage
3. **Allow data access** (Right of Access)
4. **Allow data correction** (Right to Rectification)
5. **Allow data deletion** (Right to Erasure / "Right to be Forgotten")
6. **Allow data portability** (Right to Data Portability)
7. **Maintain audit logs** for accountability

### Built-in Features

This boilerplate provides:

- ✅ Consent tracking with IP and timestamp
- ✅ Audit log for data subject actions
- ✅ Data export (download my data as JSON)
- ✅ Account deletion with cascading cleanup
- ✅ Privacy policy template
- ✅ Cookie notice
- ✅ Session tracking (IP address, user agent)

### Important Disclaimer

While these features provide a **strong foundation**, full GDPR compliance depends on:

- Your specific business requirements
- The types of data you collect
- How you process and store data
- Your data retention policies
- Third-party services you integrate

**Recommendation**: Consult with a legal professional to ensure full compliance for your specific use case.

---

## GDPR Features

### 1. Right of Access (Art. 15)

Users can download all their personal data as a JSON file via the "Download My Data" button in their profile settings.

**Included Data**:
- User account information (name, email, email verified status, profile picture)
- Consent information (consent given, timestamp, IP address)
- Account creation and update timestamps
- Linked authentication providers (Google, email/password)
- Active sessions (IP address, user agent, creation time, expiry)
- User profile information

### 2. Right to Rectification (Art. 16)

Users can update their personal information via the profile settings page:
- Name
- Profile picture

Additional fields can be added as needed.

### 3. Right to Erasure (Art. 17)

Users can permanently delete their account and all associated data via the "Delete Account" button.

**What Gets Deleted**:
- User account record
- All sessions
- All authentication accounts (Google OAuth tokens, passwords, etc.)
- User profile
- Tenant memberships
- Verification tokens (email verification, OTP, password reset)
- OAuth tokens (encrypted access/refresh tokens)

**What Remains**:
- Audit log entries (user ID + action only, no personal data)
- This is required for legal accountability and regulatory compliance

### 4. Right to Data Portability (Art. 20)

The data export feature provides data in a **machine-readable format** (JSON), allowing users to transfer their data to another service.

---

## Consent Tracking

### How Consent Works

**Automatic consent is recorded** when a user creates an account:

1. User signs up (via any auth method)
2. Better Auth creates user record
3. `databaseHooks.user.create.after` is triggered
4. System records consent:
   - `User.consentGiven = true`
   - `User.consentAt = current timestamp`
   - `User.consentIp = user's IP address`
5. Audit log entry created: `CONSENT_GIVEN`

### Database Schema

```prisma
model User {
  id           String    @id
  email        String
  name         String
  consentGiven Boolean   @default(false)
  consentAt    DateTime?
  consentIp    String?
  // ...
}
```

### Consent UI

During sign-up, users see consent text:

> "By signing in, you agree to our Privacy & Data Policy and consent to the processing of your personal data."

The privacy policy link is displayed prominently, and users must complete sign-up to proceed (implicit consent).

**Note**: Some jurisdictions require **explicit opt-in consent** (e.g., a checkbox). You may need to add this based on your requirements.

---

## Audit Log

### What is Logged?

The `GdprAuditLog` table records all GDPR-related user actions:

| Action | Description |
|--------|-------------|
| `CONSENT_GIVEN` | User created account and consented to data processing |
| `DATA_DELETION` | User requested and completed account deletion |

### Database Schema

```prisma
model GdprAuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   @db.VarChar(50)
  details   String?  @db.Text
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("gdpr_audit_log")
}
```

### Why This Matters

Audit logs provide:
- **Accountability**: Proof of user actions and consent
- **Regulatory compliance**: Required by GDPR Article 30 (Records of Processing Activities)
- **Transparency**: Can be reviewed in case of disputes or investigations

### Retention Policy

Audit log entries are **not deleted** when a user deletes their account. This is intentional:

- Logs contain only `userId` (a UUID) and action type
- No personal data (name, email, etc.) is stored in logs
- Retention is necessary for legal accountability
- Logs may be purged after a statutory period (e.g., 7 years) based on your policies

---

## Data Export

### User Experience

1. User navigates to "Profile & Security" settings
2. Scrolls to "Data & Privacy" section
3. Clicks "Download My Data"
4. System generates JSON file with all user data
5. Browser downloads `my-data-[timestamp].json`

### Implementation

Backend endpoint: `trpc.gdpr.myData.useQuery()`

**Exported Data Structure**:

```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "image": "https://example.com/avatar.jpg",
    "consentGiven": true,
    "consentAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-02-01T00:00:00Z"
  },
  "accounts": [
    {
      "providerId": "google",
      "scope": "openid email profile",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "sessions": [
    {
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T00:00:00Z",
      "expiresAt": "2024-01-22T00:00:00Z"
    }
  ],
  "profile": {
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Security Notes**:
- Sensitive data (passwords, OAuth tokens) is **excluded** from export
- Data is not stored on the server (generated on-demand)
- No authentication credentials included

---

## Account Deletion

### User Experience

1. User navigates to "Profile & Security" settings
2. Scrolls to "Data & Privacy" section
3. Clicks "Delete Account"
4. Modal appears with warning: "This action is irreversible"
5. User must type their email address to confirm
6. Account and all data is permanently deleted
7. User is signed out and redirected to sign-in page

### Implementation

Backend endpoint: `trpc.gdpr.deleteAccount.useMutation()`

**Deletion Flow**:

1. User submits deletion request with email confirmation
2. System verifies confirmation matches user's email
3. `beforeDelete` hook executes:
   - Audit log entry created: `DATA_DELETION`
   - Tenant memberships deleted
   - Verification tokens deleted (email verification, OTP, password reset)
4. Better Auth deletes user (CASCADE deletes all related records):
   - Sessions
   - Accounts (including OAuth tokens)
   - User profile
5. User is logged out
6. Response returned to frontend
7. Frontend redirects to sign-in page

**Database Cascade**:

```prisma
model Session {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserProfile {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Privacy Policy

### Built-in Template

A comprehensive privacy policy is included in the i18n files:

**Location**: `apps/web/i18n/en/index.ts` → `Privacy` section

**Sections Covered**:
1. What data we collect
2. How we use your data
3. Cookies
4. Third-party services
5. How we protect your data
6. Your rights (access, rectify, delete, withdraw consent)
7. Data retention
8. Contact information

### Displaying the Policy

The privacy policy is available at `/privacy` (or similar route in your app).

Users see links to the privacy policy:
- During sign-up
- In the footer
- In profile settings (Data & Privacy section)

### Customization Required

The template policy is **generic** and must be customized for your application:

- Replace placeholder contact email
- Update service descriptions (Google Drive, AWS SES, Rollbar)
- Add any additional data collection points
- Add your company name and address
- Review with legal counsel

---

## Cookies

### Cookie Notice

A cookie banner appears on first visit:

> "This site uses essential cookies to keep you signed in. No tracking or advertising cookies."

**Features**:
- Non-intrusive design
- "Learn more" link to privacy policy
- "Got it" button to dismiss
- Preference stored in localStorage

### Cookies Used

| Cookie | Purpose | Expiry |
|--------|---------|--------|
| Session Token | Keeps user signed in | 7 days |
| OAuth State | Secures Google sign-in flow | 3 days |

These are **strictly necessary cookies** (GDPR allows without explicit consent).

**No tracking, analytics, or advertising cookies are used.**

### Adding Analytics Cookies

If you add analytics (e.g., Google Analytics), you must:
1. Update cookie notice to mention analytics
2. Obtain explicit consent (opt-in checkbox)
3. Only load analytics after consent given
4. Provide opt-out mechanism

---

## Customization Required

While the boilerplate provides a solid foundation, you must customize based on your needs:

### 1. Additional Data Collection

If you collect additional personal data (e.g., phone number, address, payment info), you must:

- Update consent text to mention these fields
- Include them in data export
- Delete them on account deletion
- Document them in privacy policy

### 2. Third-Party Services

If you integrate additional services (e.g., Stripe, Twilio, analytics), you must:

- Update privacy policy to mention them
- Update cookie notice if they use cookies
- Ensure they have data processing agreements (DPAs)
- Include their data in export (if stored)

### 3. Data Retention Policies

Define and document:

- How long you retain user data
- How long you retain audit logs
- When inactive accounts are deleted
- When sessions are purged

### 4. International Transfers

If you transfer data outside the EU:

- Document this in the privacy policy
- Ensure adequate safeguards (e.g., Standard Contractual Clauses)
- Inform users about data transfer

### 5. Marketing and Analytics

If you use marketing emails or analytics:

- Obtain **explicit opt-in consent** (checkboxes during sign-up)
- Provide opt-out mechanisms
- Honor "Do Not Track" requests
- Update privacy policy

### 6. Children's Data

If your service is targeted at children under 16:

- Implement age verification
- Obtain parental consent
- Update privacy policy with special protections

---

## API Reference

### Frontend Usage (tRPC)

#### Download My Data

```typescript
const { data, isLoading } = trpc.gdpr.myData.useQuery();

if (data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-data-${Date.now()}.json`;
  a.click();
}
```

#### Update Profile (Right to Rectification)

```typescript
const { mutate } = trpc.gdpr.updateProfile.useMutation();

mutate({
  name: 'New Name',
  image: 'https://example.com/new-avatar.jpg',
}, {
  onSuccess: (updatedUser) => {
    console.log('Profile updated:', updatedUser);
  },
});
```

#### Delete Account

```typescript
const { mutate, isPending } = trpc.gdpr.deleteAccount.useMutation();

const handleDelete = () => {
  if (window.confirm('Are you sure? This cannot be undone.')) {
    mutate({
      confirmation: userEmail, // Must match user's email
    }, {
      onSuccess: () => {
        // User is logged out
        router.push('/auth/signin');
      },
      onError: (error) => {
        console.error('Deletion failed:', error.message);
      },
    });
  }
};
```

---

## Best Practices

### 1. Be Transparent

Clearly explain:
- What data you collect
- Why you collect it
- How long you keep it
- Who you share it with

### 2. Make It Easy

GDPR rights should be **easy to exercise**:
- One-click data export
- Simple account deletion
- Clear privacy policy

### 3. Document Everything

Maintain records of:
- Data processing activities
- Consent collection
- Data breaches (if any)
- DPAs with third parties

### 4. Review Regularly

GDPR compliance is ongoing:
- Review privacy policy annually
- Update consent text when adding features
- Audit third-party services
- Monitor regulatory changes

### 5. Respond Promptly

GDPR requires responses to data requests within **30 days** (extendable to 60 days in complex cases).

---

## Troubleshooting

### Data Export Missing Fields

**Cause**: Custom data not included in export query.

**Solution**: Update `apps/api/src/modules/gdpr/gdpr.service.ts` to include additional fields in the `myData()` method.

### Account Deletion Not Working

**Cause**: Foreign key constraint preventing deletion.

**Solution**: Ensure all related tables use `onDelete: Cascade` in Prisma schema:

```prisma
model RelatedTable {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Consent Not Recorded

**Cause**: `databaseHooks.user.create.after` is not executing.

**Solution**: Check Better Auth configuration in `apps/api/src/modules/auth/auth.ts`. Ensure the hook is registered.

---

## Related Documentation

- [Authentication →](authentication.md)
- [Multi-Tenancy →](multi-tenancy.md)
- [Internationalization →](internationalization.md)

---

## Additional Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO GDPR Guide](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [GDPR Checklist](https://gdpr.eu/checklist/)
