"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [phonesText, setPhonesText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<string | null>(null);

  const phoneCount = phonesText
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirm(
        `Send reminder SMS to ${phoneCount} phone number(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    setStatus("sending");
    setResult(null);
    try {
      const phones = phonesText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, phones }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        sent?: number;
        failed?: number;
        total?: number;
        error?: string;
        failures?: { phone: string; error: string }[];
      };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "failed");
      setStatus("done");
      const failureDetails =
        data.failures && data.failures.length > 0
          ? "\n" + data.failures.map((f) => `${f.phone}: ${f.error}`).join("\n")
          : "";
      setResult(
        `Sent ${data.sent}/${data.total}${data.failed ? `, ${data.failed} failed` : ""}${failureDetails}`
      );
    } catch (err) {
      setStatus("error");
      setResult(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-heading text-3xl tracking-wider uppercase mb-2">
        Admin &middot; Axe Games
      </h1>
      <p className="text-stone text-sm mb-6">
        Paste phone numbers (one per line, or comma-separated) and send the
        reminder SMS. Numbers can be in any format — they&rsquo;ll be normalized
        automatically.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="font-heading text-sm tracking-widest uppercase text-stone-light">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full bg-transparent border-b border-stone-dark px-1 py-2 text-lg text-cream focus:border-gold focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="font-heading text-sm tracking-widest uppercase text-stone-light">
            Phone numbers ({phoneCount})
          </span>
          <textarea
            required
            value={phonesText}
            onChange={(e) => setPhonesText(e.target.value)}
            rows={12}
            placeholder={"+15871234567\n5879876543\n+1 (587) 555-1212"}
            className="mt-1 block w-full bg-bg-card border border-stone-dark px-3 py-2 text-cream focus:border-gold focus:outline-none font-mono text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending" || phoneCount === 0}
          className="font-heading text-sm tracking-widest uppercase bg-blood text-cream border border-blood px-5 py-2 hover:bg-blood-deep transition-colors disabled:opacity-50"
        >
          {status === "sending"
            ? "Sending..."
            : `Send Reminder to ${phoneCount}`}
        </button>

        {result && (
          <pre
            className={`text-sm whitespace-pre-wrap ${status === "error" ? "text-blood" : "text-gold"}`}
          >
            {result}
          </pre>
        )}
      </form>
    </main>
  );
}
