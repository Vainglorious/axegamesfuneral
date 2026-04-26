import Link from "next/link";
import { EVENT } from "@/lib/event";

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const firstName = name ? name.split(/\s+/)[0] : undefined;

  return (
    <main className="w-full max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
      <div className="text-5xl mb-6">🪓</div>

      <h1 className="font-heading text-5xl sm:text-6xl tracking-wider uppercase leading-tight">
        {firstName ? `You're in, ${firstName}` : "You're in."}
      </h1>

      <p className="text-stone-light text-xl mt-4">
        A text confirmation is on its way.
      </p>

      <div className="divider my-10" />

      <div className="bg-bg-card gothic-border gothic-shadow p-6 text-left space-y-3">
        <p className="text-stone-light">
          <span className="font-heading text-xs tracking-[0.2em] uppercase text-stone-dark block">
            When
          </span>
          <span className="font-heading text-xl text-cream">
            {EVENT.date} &middot; {EVENT.time}
          </span>
        </p>
        <p className="text-stone-light">
          <span className="font-heading text-xs tracking-[0.2em] uppercase text-stone-dark block">
            Where
          </span>
          <span className="font-heading text-xl text-cream">
            {EVENT.address}
          </span>
        </p>
      </div>

      <p className="text-stone mt-10 max-w-md mx-auto">
        Don&apos;t be late. 3PM sharp. Activities are a surprise.
      </p>

      <Link
        href="/"
        className="inline-block mt-8 font-heading text-sm tracking-widest uppercase text-gold border-b border-gold pb-1 hover:text-cream hover:border-cream transition-colors"
      >
        &larr; Back
      </Link>
    </main>
  );
}
