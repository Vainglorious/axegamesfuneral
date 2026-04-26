import { RsvpForm } from "@/components/RsvpForm";
import { EVENT } from "@/lib/event";

export default function Home() {
  return (
    <main className="w-full max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      {/* Hero */}
      <section className="text-center mb-14">
        <div className="text-4xl mb-4">🪓</div>
        <h1 className="font-heading text-5xl sm:text-7xl tracking-wider uppercase leading-tight">
          Axe Games
        </h1>
        <p className="font-heading text-xl sm:text-2xl tracking-widest uppercase text-gold mt-2">
          Celebration
        </p>

        <div className="divider my-8" />

        <div className="space-y-1">
          <p className="font-heading text-2xl sm:text-3xl tracking-wide text-cream">
            {EVENT.date}
          </p>
          <p className="font-heading text-4xl sm:text-5xl tracking-wide text-gold">
            {EVENT.time}
          </p>
        </div>

        <div className="divider my-8" />

        <p className="font-heading text-lg tracking-widest uppercase text-stone-light ornament">
          Activities will be a surprise
        </p>
      </section>

      {/* Event details card */}
      <section className="bg-bg-card gothic-border gothic-shadow p-6 sm:p-8 mb-14">
        <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
          <InfoBlock label="When" value={EVENT.date} sub={EVENT.time} />
          <InfoBlock label="Where" value={EVENT.addressShort} />
          <InfoBlock label="What" value="Food & Drinks" sub="Provided" />
        </div>
        <div className="divider my-6" />
        <p className="text-stone text-center font-body text-base">
          Don&apos;t be late. 3PM means 3PM.
        </p>
      </section>

      {/* RSVP Form */}
      <section id="rsvp">
        <h2 className="font-heading text-3xl sm:text-4xl tracking-wider uppercase text-center mb-2">
          RSVP
        </h2>
        <p className="text-stone text-center mb-10">
          Answer the questions below so we can plan for exact numbers.
        </p>
        <RsvpForm />
      </section>

      {/* Footer */}
      <footer className="mt-20 text-center">
        <div className="divider mb-6" />
        <p className="font-heading text-sm tracking-widest uppercase text-stone-dark">
          Axe Games Celebration &middot; {EVENT.date}
        </p>
        <p className="text-stone-dark text-sm mt-1">{EVENT.address}</p>
      </footer>
    </main>
  );
}

function InfoBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="font-heading text-xs tracking-[0.2em] uppercase text-stone-dark">
        {label}
      </p>
      <p className="font-heading text-xl sm:text-2xl tracking-wide text-cream mt-1">
        {value}
      </p>
      {sub && <p className="text-stone text-sm mt-0.5">{sub}</p>}
    </div>
  );
}
