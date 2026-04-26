import { readFileSync } from "node:fs";
import twilio from "twilio";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const sid = env.TWILIO_ACCOUNT_SID;
const token = env.TWILIO_AUTH_TOKEN;
const from = process.env.FROM || env.TWILIO_FROM_NUMBER;
const to = process.argv[2] || env.ADMIN_PHONE;

if (!sid || !token || !from || !to) {
  console.error("Missing one of: SID, TOKEN, FROM, TO");
  console.error({ sid: !!sid, token: !!token, from, to });
  process.exit(1);
}

console.log(`Sending test SMS:  from=${from}  to=${to}`);

const client = twilio(sid, token);
try {
  const msg = await client.messages.create({
    to,
    from,
    body: "Axe Games SMS test — if you got this, Twilio is wired up.",
  });
  console.log(`OK. sid=${msg.sid}  status=${msg.status}`);
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  if (err.code) console.error(`twilio code: ${err.code}`);
  if (err.moreInfo) console.error(`more info: ${err.moreInfo}`);
  process.exit(1);
}
