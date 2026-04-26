# Get Axe Games RSVP Microsite Live

## Context

**The event is TODAY (2026-04-26) at 3:00 PM** — `lib/event.ts:3-4` says "April 26, 2026, 3:00 PM" and today's date matches. This means we need the fastest viable path to a working live URL, not a polished rollout.

This is a Next.js 16 RSVP microsite (`package.json:12`) that:
- Collects RSVPs on `/` via a form
- Sends an SMS confirmation to the attendee + an admin notification SMS via Twilio (`lib/twilio.ts`)
- Stores RSVPs in a Google Sheet via an Apps Script webhook (`apps-script/Code.gs`)
- Has a password-protected `/admin` page to view RSVPs and send reminder blasts

Code is complete and committed (last commit `2293360`). What's missing is purely **operational setup** — accounts, secrets, and deployment.

## What's missing (the punch list)

You correctly identified the three things blocking go-live. Here's the full state:

| Item | Status | Action |
|------|--------|--------|
| Code | ✅ Done | — |
| `.env.local` | ❌ Missing | Create from `.env.example` |
| Twilio account + SMS number | ❌ Missing | Sign up, buy number, copy creds |
| Google Sheet + Apps Script webhook | ❌ Missing | Create sheet, paste `apps-script/Code.gs`, deploy as Web app |
| Deployed live URL | ❌ Missing | Deploy to Vercel |
| End-to-end test | ❌ Not yet run | Submit a test RSVP, verify SMS + sheet row |

## The 8 environment variables (from `.env.example`)

| Var | Where it comes from |
|-----|---------------------|
| `TWILIO_ACCOUNT_SID` | Twilio Console home page |
| `TWILIO_AUTH_TOKEN` | Twilio Console home page |
| `TWILIO_FROM_NUMBER` | The SMS number you buy in Twilio (E.164, e.g. `+14035551234`) |
| `ADMIN_PHONE` | Your personal cell — receives one SMS per new RSVP |
| `ADMIN_PASSWORD` | Anything strong; you'll type it on `/admin` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | The Apps Script Web app URL after you deploy it |
| `APPS_SCRIPT_SECRET` | `openssl rand -hex 24` — must match the constant in `Code.gs:16` |
| `NEXT_PUBLIC_SITE_URL` | Your final Vercel URL (only matters for absolute links) |

## Execution order (fastest path)

### Step 1 — Twilio (~10 min, ~$1 + ~$1/mo for the number)
1. Sign up: https://www.twilio.com/try-twilio (trial gives ~$15 credit, enough for testing today)
2. **Buy a phone number** with SMS capability. On a trial account, SMS can only send to **verified** numbers — verify your own cell + `ADMIN_PHONE` so the SMS path works for testing. For real attendees, you must upgrade the account (add ~$20 credit) before the event.
3. Copy `Account SID`, `Auth Token`, and the new number from the Console dashboard.

⚠️ Canadian/US 10DLC note: A brand-new long-code number on a fresh account may need 10DLC registration to send to US/CA carrier numbers. If SMS gets blocked, the workaround for today is to either (a) use a Twilio toll-free number (also requires verification but is faster) or (b) keep the trial-account verified-numbers-only mode and manually verify each guest's phone.

### Step 2 — Google Sheet + Apps Script (~5 min)
1. Create a new Google Sheet (title: "Axe Games RSVPs")
2. Extensions → Apps Script. Replace the default `Code.gs` with the contents of `apps-script/Code.gs` (in this repo).
3. Generate the secret locally: `openssl rand -hex 24`. Replace `"CHANGE_ME"` on `apps-script/Code.gs:16` with that secret.
4. Save (💾). Deploy → **New deployment** → Type: **Web app** → Execute as: **Me** → Who has access: **Anyone** → Deploy.
5. Authorize when prompted (it'll warn "unverified" — click Advanced → Go to script).
6. Copy the **Web app URL** that comes back.

### Step 3 — Local `.env.local` and smoke test (~5 min)
1. `cp .env.example .env.local`
2. Fill in all 8 vars. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for now.
3. `npm install`
4. `npm run dev`
5. Open http://localhost:3000, submit an RSVP using your verified Twilio number.
6. Verify: (a) you got the attendee SMS, (b) `ADMIN_PHONE` got the admin SMS, (c) the Sheet has a new row in the auto-created `RSVPs` tab.
7. Test `/admin` with `ADMIN_PASSWORD` — confirm the row shows up.

### Step 4 — Deploy to Vercel (~5 min)
1. `npm i -g vercel` (skip if installed)
2. `vercel` — log in, link the project (accept defaults).
3. Add all 8 env vars to Vercel:
   ```
   vercel env add TWILIO_ACCOUNT_SID
   vercel env add TWILIO_AUTH_TOKEN
   vercel env add TWILIO_FROM_NUMBER
   vercel env add ADMIN_PHONE
   vercel env add ADMIN_PASSWORD
   vercel env add GOOGLE_SHEETS_WEBHOOK_URL
   vercel env add APPS_SCRIPT_SECRET
   vercel env add NEXT_PUBLIC_SITE_URL
   ```
   (For each, choose Production + Preview + Development.)
4. `vercel --prod`
5. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the prod URL Vercel printed, then redeploy: `vercel --prod`.

### Step 5 — Production verification (5 min)
- Hit the live URL, submit a real RSVP from your phone.
- Confirm SMS to attendee + admin land within ~10s.
- Confirm a new row appears in the Sheet.
- Open `/admin`, log in, confirm row visible.
- (Optional, later today) Use the **Send Reminders** button right before 3PM.

## Files involved

- `.env.example` — template for `.env.local` (do not commit `.env.local`)
- `lib/twilio.ts` — Twilio client; throws if creds missing
- `lib/sheet.ts` — Apps Script webhook client
- `apps-script/Code.gs:16` — `APPS_SCRIPT_SECRET` constant must match `.env.local`
- `app/api/rsvp/route.ts` — RSVP submit endpoint
- `app/api/admin/list/route.ts` — admin list endpoint
- `app/api/send-reminder/route.ts` — reminder blast endpoint
- `lib/event.ts` — event constants (date/address/drinks)

## Risks / gotchas for today

1. **Twilio trial restrictions.** Trial accounts can only SMS verified numbers. Upgrade with a credit-card top-up (~$20) before going live to actual guests, otherwise unverified attendees won't get confirmations.
2. **A2P 10DLC registration.** New US long-code numbers may be filtered by carriers until registered. If test SMS doesn't deliver, switch to toll-free or use the verified-numbers workaround.
3. **Apps Script "Anyone" access.** The webhook is open; the `APPS_SCRIPT_SECRET` is the only auth. Keep it out of git.
4. **Address confirmation.** `lib/event.ts:5` lists "23, 2015 32 Ave NE" — verify this is the right address before going live; it's hard-coded into SMS templates (`lib/twilio.ts:48`).
5. **No tests in repo.** Verification is entirely manual via Step 3 and Step 5.

## Verification (end-to-end)

You're done when, on the live Vercel URL:
- Submitting the RSVP form returns success and routes to `/confirmed`
- The submitter receives the confirmation SMS within ~10s
- `ADMIN_PHONE` receives the new-RSVP admin SMS within ~10s
- A new row appears in the Google Sheet `RSVPs` tab with the right columns
- `/admin` + `ADMIN_PASSWORD` shows that row in the list
