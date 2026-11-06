import { SITE } from "@/lib/constants";

const currencyFormatter = new Intl.NumberFormat(SITE.locale, {
  style: "currency",
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(SITE.locale, {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: SITE.timezone,
});

const shortDateFormatter = new Intl.DateTimeFormat(SITE.locale, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: SITE.timezone,
});

const dateTimeFormatter = new Intl.DateTimeFormat(SITE.locale, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: SITE.timezone,
});

const timeFormatter = new Intl.DateTimeFormat(SITE.locale, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: SITE.timezone,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(SITE.locale).format(value);
}

export function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

export function formatShortDate(value: Date | string): string {
  return shortDateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: Date | string): string {
  return timeFormatter.format(new Date(value));
}

/** Convierte un valor datetime-local de Argentina a Date UTC. */
export function parseArgentinaDateTime(value: string): Date | null {
  const clean = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(clean)) return null;
  const date = new Date(`${clean.slice(0, 16)}:00-03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Devuelve un datetime-local (hora Argentina) para precargar formularios. */
export function toArgentinaInput(value: Date | string): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SITE.timezone,
  }).format(new Date(value));
  return parts.replace(" ", "T");
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function humanDateTime(value: Date | string): string {
  const date = new Date(value);
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  if (abs < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.round(abs / 60000));
    return diff > 0 ? `en ${minutes} min` : `hace ${minutes} min`;
  }
  if (abs < 24 * 60 * 60 * 1000) {
    const hours = Math.round(abs / 3600000);
    return diff > 0 ? `en ${hours} h` : `hace ${hours} h`;
  }
  return formatDateTime(value);
}
