import { EVENT } from "@/lib/event";
import {
  formatAdminRsvpMessage,
  formatAttendeeConfirmMessage,
  sendSMS,
} from "@/lib/twilio";
import { normalizePhone, validateRsvp } from "@/lib/validate";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  phone?: string;
  on_time?: string;
  activity?: string;
  eating?: string;
  drink?: string;
  plus_one?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phoneRaw = (body.phone ?? "").trim();
  const on_time = (body.on_time ?? "").trim();
  const activity = (body.activity ?? "").trim();
  const eating = (body.eating ?? "").trim();
  const drink = (body.drink ?? "").trim();
  const plus_one = (body.plus_one ?? "").trim();

  const errors = validateRsvp({ name, phone: phoneRaw });
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "validation", errors },
      { status: 400 }
    );
  }

  if (!on_time || !activity || !eating || !drink || !plus_one) {
    return Response.json(
      { ok: false, error: "all questions are required" },
      { status: 400 }
    );
  }

  const phone = normalizePhone(phoneRaw);
  const rsvp_id = randomUUID();

  const adminPhone = process.env.ADMIN_PHONE;
  const messages: Promise<unknown>[] = [];
  if (adminPhone) {
    messages.push(
      sendSMS(
        adminPhone,
        formatAdminRsvpMessage({
          name,
          phone,
          onTime: on_time,
          activity,
          eating,
          drink,
          plusOne: plus_one,
        })
      ).catch((e) => console.error("admin sms failed", e))
    );
  }
  messages.push(
    sendSMS(
      phone,
      formatAttendeeConfirmMessage({ name, address: EVENT.addressShort })
    ).catch((e) => console.error("attendee sms failed", e))
  );
  await Promise.allSettled(messages);

  return Response.json({ ok: true, rsvp_id });
}
