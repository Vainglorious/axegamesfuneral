import twilio from "twilio";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM_NUMBER;

let client: ReturnType<typeof twilio> | null = null;
function getClient() {
  if (!sid || !token) throw new Error("Twilio credentials missing");
  if (!client) client = twilio(sid, token);
  return client;
}

export async function sendSMS(to: string, body: string) {
  if (!from) throw new Error("TWILIO_FROM_NUMBER missing");
  return getClient().messages.create({ to, from, body });
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] || name;
}

export function formatAdminRsvpMessage(input: {
  name: string;
  phone: string;
  onTime: string;
  activity: string;
  eating: string;
  drink: string;
  plusOne: string;
}) {
  return [
    `🪓 New Axe Games RSVP`,
    `${input.name} — ${input.phone}`,
    `3pm sharp: ${input.onTime}`,
    `Activity: ${input.activity}`,
    `Eating: ${input.eating}`,
    `Drink: ${input.drink}`,
    `+1: ${input.plusOne}`,
  ].join("\n");
}

export function formatAttendeeConfirmMessage(input: {
  name: string;
  address: string;
}) {
  const first = firstName(input.name);
  return `Hey ${first}! You're locked in for Axe Games — April 26, 3PM sharp @ ${input.address}. Activities will be a surprise. Food and drinks provided. Don't be late.`;
}

export function formatReminderMessage(input: { address: string }) {
  return `Reminder: Axe Games is TODAY at 3PM sharp @ ${input.address}. Don't be late. See you there.`;
}
