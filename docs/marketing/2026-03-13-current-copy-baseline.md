# Current Copy Baseline

This document captures the current live English product copy so marketing and content work can start from the same baseline as the application.

## Source of Truth for This Baseline

Primary source:

1. `frontend/src/lib/i18n/locales/en.js`

Supporting rendered surfaces:

1. `frontend/src/features/landing/LandingPage.jsx`
2. `frontend/src/features/wizard/WizardPage.jsx`
3. `frontend/src/features/wizard/components/WizardSteps.jsx`
4. `frontend/src/features/result/ResultPage.jsx`
5. `frontend/src/features/unlock/UnlockForm.jsx`
6. `frontend/src/features/auth/RegisterPage.jsx`
7. `frontend/src/features/auth/LoginPage.jsx`
8. `frontend/src/features/auth/RecoveryPage.jsx`
9. `frontend/src/features/auth/AuthVerifyPage.jsx`
10. `frontend/src/features/history/HistoryPage.jsx`

## Landing Page

- Heading line 1: `There are thousands of AI tools.`
- Heading line 2: `We tell you exactly which one to use.`
- Subtitle: `Answer 3 quick questions. Get your best match in under 60 seconds.`
- Primary CTA: `Find my AI tool`
- Support line: `No login required to start.`

## Wizard

- Title: `Find your best AI tool`
- Reset: `Reset`
- Lookup error: `Unable to load wizard options. Please retry.`
- Submit error: `Could not generate recommendation. Please try again.`
- Step label: `Step {current} of {total}`

### Wizard Step Copy

- Step 1 title: `Who are you?`
- Step 2 title: `What's the mission?`
- Step 3 title: `What matters most?`
- Priority helper: `Pick one top priority only.`
- Buttons:
  - `Continue`
  - `Back`
  - `Find my match`

### Wizard Loading State

- Title: `Finding your best match...`
- Subtitle: `One moment while we process your choices.`
- Checks:
  - `Saving your session`
  - `Computing recommendation`
  - `Preparing result`

## Consent Copy

- Consent text: `I agree to receive product updates and useful AI tool recommendations by email.`

## Unlock Flow

- Email label: `Email to unlock`
- Email placeholder: `you@example.com`
- Invalid email: `Enter a valid email address.`
- Consent required: `Consent is required to unlock your recommendation.`
- Loading CTA: `Unlocking...`
- Main CTA: `✦ Reveal my best match`
- Generic error: `Could not unlock recommendation.`

## Result Page

### Empty State

- Title: `No result yet`
- Body: `Complete the wizard first to see your recommendation.`
- CTA: `Start wizard`

### Header / General

- Unlocked header: `Your Best Match`
- Locked header: `Your result is ready 🎯`
- Secondary CTA: `Run again`

### Locked Primary Card

- Card title: `Your best match is ready`
- Card subtitle: `One quick step to reveal it`

### Unlock Outcome / Errors

- Success toast: `Recommendation unlocked.`
- Server unavailable: `Server is unavailable. Please try again.`
- Unlock failed: `Could not unlock recommendation.`

### Unlocked Primary Recommendation

- Main CTA: `Try it →`
- Fallback tool name: `Top recommendation`

### Feedback

- Question: `Was this helpful?`
- Yes: `👍 Yes`
- No: `👎 Not really`
- Unavailable: `Feedback is unavailable for this result.`
- Success: `Thanks for the feedback.`
- Failure: `Could not submit feedback right now.`

### Account Nudge

- Prefix: `Want to save this?`
- Register CTA text: `Create a free account`
- Joiner: `or`
- Login CTA text: `log in`

### Locked Result Section

- Section title: `We found your perfect AI tool`
- Section subtitle: `Enter your email below to unlock the full recommendation.`
- Alternatives heading: `Also consider:`

## Account / Authentication

### Shared Account Copy

- Already signed in title: `You are already signed in`
- Signed in as: `Signed in as {email}.`
- Signed in fallback email: `your account`
- Continue: `Continue`
- Account label: `Account`
- Account recovery label: `Account Recovery`
- Account email label: `Account email`
- Email placeholder: `you@example.com`
- Invalid email: `Enter a valid email address.`
- Server unavailable: `Server is unavailable. Please try again.`

### Register

- Title: `Create account with passkey`
- Subtitle: `Use your device passkey for passwordless sign-in. Email recovery stays available as backup.`
- Consent required: `Consent is required to create your account.`
- Loading: `Creating passkey...`
- Submit CTA: `Create account with passkey`
- Fallback prefix: `Can't use passkeys right now?`
- Fallback action: `Use email recovery`
- Existing account prefix: `Already have an account?`
- Existing account action: `Sign in with passkey`
- Failure: `Could not create your passkey account.`

### Login

- Title: `Sign in with passkey`
- Subtitle: `Use the passkey saved on your device for fast, passwordless sign-in.`
- Loading: `Signing in...`
- Submit CTA: `Sign in with passkey`
- Fallback prefix: `Need account recovery or first-device bootstrap?`
- Fallback action: `Use email recovery`
- New user prefix: `New here?`
- New user action: `Create account with passkey`
- Failure: `Could not complete passkey sign-in.`
- Unsupported: `Passkeys are not supported on this browser. Use email recovery instead.`
- Creation cancelled: `Passkey creation was cancelled.`
- Sign-in cancelled: `Passkey sign-in was cancelled.`

### Recovery

- Title: `Recovery email fallback`
- Subtitle: `Use this only when passkey sign-in is unavailable on your current device.`
- Loading: `Sending recovery email...`
- Submit CTA: `Send recovery email`
- Success title: `Check your email`
- Success body: `If the email is valid, a secure recovery link has been sent to {email}.`
- Success hint: `Open it on this device to complete sign-in.`
- Back to passkey: `Back to passkey sign-in`
- Prefer passkey prefix: `Prefer passkeys?`
- Prefer passkey action: `Return to sign-in`
- Failure: `Could not start recovery. Please try again.`

### Recovery Verification

- Loading title: `Verifying your recovery link`
- Loading subtitle: `Please wait a moment.`
- Failure title: `Could not sign you in`
- Missing token: `This recovery link is invalid. Request a new recovery email.`
- Invalid or expired: `This recovery link is invalid or expired.`
- Request another: `Request another recovery email`
- Back to passkey: `Back to passkey sign-in`

### Passkey Enrollment After Recovery

- Title: `Secure this account with a passkey`
- Subtitle: `You signed in with email recovery. Add a passkey now for faster sign-in next time.`
- Email label: `Account email`
- Consent label: `I agree to receive product updates and useful AI tool recommendations by email.`
- Submit CTA: `Add passkey`
- Loading: `Adding passkey...`
- Success: `Passkey added to your account.`
- Failure: `Could not add a passkey right now.`

## Recommendation History

- Title: `Recommendation history`
- Subtitle: `Your recent unlocked recommendations.`
- Loading: `Loading history...`
- Empty title: `No saved recommendations yet`
- Empty body: `Finish the wizard and unlock a result to start building your history.`
- Empty CTA: `Start wizard`
- Error title: `Could not load history right now.`
- Retry: `Retry`
- Sign-in title: `Sign in to view your history`
- Sign-in body: `History is available for your authenticated account.`
- Sign-in CTA: `Sign in`
- Result action: `Open result`
- External CTA: `Try it`
- Fallback date: `Recent`
- Priority label: `Priority`

## App Shell / Global Utility Copy

- Loading: `Loading...`
- Signed-in fallback: `Signed in`
- Logout: `Logout`
- Account: `Account`
- History: `History`
- Footer copyright: `© 2026 TrustMeBroAI`
- Footer link label: `LinkedIn`
- Footer line: `Made by real people.`
- Recovery nudge title: `Signed in via recovery`
- Recovery nudge body: `Add a passkey now so your next sign-in stays fast and passwordless.`
- Recovery nudge action: `Add passkey`
- Recovery nudge dismiss: `Later`

## Notes for Marketing Review

1. This is a baseline capture, not a recommendation document.
2. Product copy currently emphasizes:
   - speed
   - low friction
   - confident recommendation
   - email capture
3. Product copy currently does not yet include a visible `follow the build` marketing capture on the landing page, even though that direction exists in the final implementation plan.
4. The result page still includes the label `Also consider:` for alternatives, which may be worth re-evaluating against the product promise of one clear answer.
