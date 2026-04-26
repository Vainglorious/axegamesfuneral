import { EVENT } from "@/lib/event";
import { formatReminderMessage, sendSMS } from "@/lib/twilio";
import { normalizePhone } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { password, phones } = (await req.json().catch(() => ({}))) as {
    password?: string;
    phones?: string[];
  };
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: "bad password" }, { status: 401 });
  }
  if (!Array.isArray(phones) || phones.length === 0) {
    return Response.json(
      { ok: false, error: "no phone numbers provided" },
      { status: 400 }
    );
  }

  const normalized = Array.from(
    new Set(
      phones
        .map((p) => normalizePhone(typeof p === "string" ? p : ""))
        .filter((p) => p.length > 0)
    )
  );

  if (normalized.length === 0) {
    return Response.json(
      { ok: false, error: "no valid phone numbers" },
      { status: 400 }
    );
  }

  const body = formatReminderMessage({ address: EVENT.addressShort });

  const results = await Promise.allSettled(
    normalized.map((phone) => sendSMS(phone, body))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;
  const failures = results
    .map((r, i) =>
      r.status === "rejected"
        ? { phone: normalized[i], error: String(r.reason?.message ?? r.reason) }
        : null
    )
    .filter((x): x is { phone: string; error: string } => x !== null);

  return Response.json({ ok: true, sent, failed, total: normalized.length, failures });
}
