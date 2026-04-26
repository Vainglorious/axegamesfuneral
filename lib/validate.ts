export function phoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

export function formatPhoneInput(raw: string): string {
  const digits = phoneDigits(raw).slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function normalizePhone(raw: string): string {
  const digits = phoneDigits(raw);
  if (digits.length === 10) return `+1${digits}`;
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    const intl = "+" + trimmed.slice(1).replace(/\D/g, "");
    return intl.length > 1 ? intl : "";
  }
  return "";
}

export function validateName(raw: string): string | null {
  const n = raw.trim();
  if (!n) return "we need your name";
  if (n.length < 2) return "that name looks short";
  if (n.length > 80) return "just first + last is plenty";
  return null;
}

export function validatePhone(raw: string): string | null {
  const digits = phoneDigits(raw);
  if (!digits) return "phone number, please";
  if (digits.length < 10) return "need 10 digits";
  if (digits.length > 10) return "too many digits";
  return null;
}

export type ValidationErrors = {
  name?: string;
  phone?: string;
};

export function validateRsvp(input: {
  name: string;
  phone: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  const n = validateName(input.name);
  if (n) errors.name = n;
  const p = validatePhone(input.phone);
  if (p) errors.phone = p;
  return errors;
}
