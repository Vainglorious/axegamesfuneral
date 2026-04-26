# Axe Games Celebration — RSVP Microsite

Event RSVP page for the Axe Games Celebration (April 26, 2026, 3PM).

Collects RSVPs via a web form, sends SMS confirmations via Twilio, and stores all responses in Google Sheets. Includes an admin panel to view RSVPs and send reminder blasts.

## RSVP Questions

1. Name
2. Phone number
3. Are you coming for 3PM sharp?
4. Are you in for the special activity (4PM–5PM)?
5. Are you eating?
6. Favorite flavor of drink (Lime / Mango / Grapefruit / Surprise me)
7. Are you bringing a +1?

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Twilio** — SMS confirmations + reminder blasts
- **Google Sheets** — data storage via Google Apps Script webhook

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page + RSVP form |
| `/confirmed` | Confirmation page after submitting |
| `/admin` | Password-protected admin panel (view RSVPs, send reminders) |

## Setup

### 1. Clone and install

```bash
git clone git@github.com:richerd/axe-games-event-microsite.git
cd axe-games-event-microsite
npm install
```

### 2. Environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | From [Twilio Console](https://console.twilio.com/) |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_FROM_NUMBER` | Your Twilio SMS-enabled number (e.g. `+14035551234`) |
| `ADMIN_PHONE` | Phone number to receive RSVP notifications (e.g. `+14035551234`) |
| `ADMIN_PASSWORD` | Password for the `/admin` panel |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Google Apps Script web app URL (see step 3) |
| `APPS_SCRIPT_SECRET` | Shared secret between the app and Apps Script (see step 3) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://axe-games.vercel.app`) |

### 3. Google Sheets setup

This app stores all RSVP data in a Google Sheet via a Google Apps Script webhook.

1. Create a new Google Sheet (or use an existing one)
2. Go to **Extensions > Apps Script**
3. Delete any existing code and paste the contents of `apps-script/Code.gs`
4. Generate a secret: `openssl rand -hex 24`
5. Replace `"CHANGE_ME"` in `Code.gs` with your generated secret
6. Set the same secret as `APPS_SCRIPT_SECRET` in `.env.local`
7. Click **Deploy > New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** and copy the Web app URL
9. Set that URL as `GOOGLE_SHEETS_WEBHOOK_URL` in `.env.local`

The script will auto-create an "RSVPs" tab with the correct headers on first use.

### 4. Twilio setup

1. Create a [Twilio account](https://www.twilio.com/try-twilio)
2. Get a phone number with SMS capability
3. Copy your Account SID, Auth Token, and phone number into `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard or via CLI:

```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_FROM_NUMBER
vercel env add ADMIN_PHONE
vercel env add ADMIN_PASSWORD
vercel env add GOOGLE_SHEETS_WEBHOOK_URL
vercel env add APPS_SCRIPT_SECRET
vercel env add NEXT_PUBLIC_SITE_URL
```

Then deploy to production:

```bash
vercel --prod
```

## Admin Panel

Go to `/admin` and enter the `ADMIN_PASSWORD` to:

- View all RSVPs with response details
- See counts (total, on-time, eating, activity, +1s)
- Send reminder SMS blasts to all attendees who haven't been reminded yet

## Sending Reminders

The admin panel has a "Send Reminders" button that texts every attendee who hasn't already received a reminder. Each person only gets one reminder — the sheet tracks who's been sent one.

You can also call the API directly:

```bash
curl -X POST https://your-site.vercel.app/api/send-reminder \
  -H "Content-Type: application/json" \
  -d '{"password": "your-admin-password"}'
```

## Project Structure

```
app/
  page.tsx              # Landing page + RSVP form
  confirmed/page.tsx    # Post-RSVP confirmation
  admin/page.tsx        # Admin panel
  api/
    rsvp/route.ts       # RSVP submission endpoint
    admin/list/route.ts # List RSVPs (password-protected)
    send-reminder/route.ts  # Reminder blast endpoint
components/
  RsvpForm.tsx          # RSVP form (client component)
  AdminClient.tsx       # Admin panel UI (client component)
lib/
  event.ts              # Event details (date, address, drink options)
  twilio.ts             # Twilio SMS client + message templates
  sheet.ts              # Google Sheets webhook client
  validate.ts           # Phone/name validation
apps-script/
  Code.gs               # Google Apps Script (paste into your Sheet)
```
