"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT } from "@/lib/event";
import {
  formatPhoneInput,
  normalizePhone,
  validateRsvp,
  type ValidationErrors,
} from "@/lib/validate";

type Status = "idle" | "submitting" | "error";

export function RsvpForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    onTime: "",
    activity: "",
    eating: "",
    drink: "",
    plusOne: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    const next = key === "phone" ? formatPhoneInput(value) : value;
    setForm((f) => ({ ...f, [key]: next }));
    if (key in fieldErrors) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errs = validateRsvp(form);
    const missing: string[] = [];
    if (!form.onTime) missing.push("3pm confirmation");
    if (!form.activity) missing.push("special activity");
    if (!form.eating) missing.push("eating");
    if (!form.drink) missing.push("drink flavor");
    if (!form.plusOne) missing.push("+1");

    if (missing.length > 0 || Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      if (missing.length > 0) {
        setFormError(`Answer all questions: ${missing.join(", ")}`);
      }
      return;
    }

    setStatus("submitting");
    try {
      const payload = {
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        on_time: form.onTime,
        activity: form.activity,
        eating: form.eating,
        drink: form.drink,
        plus_one: form.plusOne,
      };
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        errors?: ValidationErrors;
      };
      if (!res.ok || !data.ok) {
        if (data.errors) setFieldErrors(data.errors);
        throw new Error(data.error ?? "something broke");
      }
      router.push(`/confirmed?name=${encodeURIComponent(form.name.trim())}`);
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof Error ? err.message : "something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="space-y-5">
        <Field
          label="Your Name"
          value={form.name}
          onChange={(v) => updateField("name", v)}
          error={fieldErrors.name}
          autoComplete="name"
        />
        <Field
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={(v) => updateField("phone", v)}
          error={fieldErrors.phone}
          autoComplete="tel"
          inputMode="tel"
          placeholder="403-555-5555"
          maxLength={12}
        />
      </div>

      <QuestionGroup
        label="Are you coming for 3PM sharp?"
        value={form.onTime}
        onChange={(v) => updateField("onTime", v)}
        options={["Yes", "No"]}
      />

      <QuestionGroup
        label={`Are you in for the special activity (${EVENT.activityTime})?`}
        value={form.activity}
        onChange={(v) => updateField("activity", v)}
        options={["Yes", "No"]}
      />

      <QuestionGroup
        label="Are you eating?"
        value={form.eating}
        onChange={(v) => updateField("eating", v)}
        options={["Yes", "No"]}
      />

      <QuestionGroup
        label="Favorite flavor of drink?"
        value={form.drink}
        onChange={(v) => updateField("drink", v)}
        options={[...EVENT.drinkFlavors]}
      />

      <QuestionGroup
        label="Are you bringing a +1?"
        value={form.plusOne}
        onChange={(v) => updateField("plusOne", v)}
        options={["Yes", "No"]}
      />

      {formError && (
        <p className="text-blood font-bold" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto font-heading text-xl sm:text-2xl tracking-wider uppercase bg-gold text-ink px-10 py-4 gothic-shadow hover:bg-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Lock It In"}
      </button>

      <p className="text-sm text-stone">
        You&apos;ll get a text confirmation. That&apos;s it.
      </p>
    </form>
  );
}

function QuestionGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <fieldset>
      <legend className="font-heading text-lg sm:text-xl tracking-wide text-cream mb-3">
        {label}
      </legend>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              aria-pressed={selected}
              className={[
                "px-5 py-2.5 border text-base sm:text-lg font-body transition-all",
                selected
                  ? "bg-gold text-ink border-gold gothic-glow"
                  : "bg-transparent text-stone-light border-stone-dark hover:border-gold hover:text-cream",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
};

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}: FieldProps) {
  return (
    <label className="block">
      <span className="font-heading text-sm tracking-widest uppercase text-stone-light">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        className={[
          "mt-1 block w-full bg-transparent border-b px-1 py-2.5 text-lg text-cream focus:outline-none",
          error
            ? "border-blood focus:border-blood"
            : "border-stone-dark focus:border-gold",
        ].join(" ")}
      />
      {error && (
        <span className="block mt-1 text-blood text-sm" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
